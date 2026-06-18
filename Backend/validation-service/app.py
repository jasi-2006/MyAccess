import os
import logging
import unicodedata
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import pymysql
import pymysql.cursors

from scraper import scrape_sofia_plus

# Cargar variables de entorno
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_profile_from_db(document_number: str) -> dict:
    """
    Obtiene los datos del perfil del aprendiz directamente de la base de datos user_service.
    """
    host = os.getenv("DB_HOST", "localhost")
    port = int(os.getenv("DB_PORT", "3306"))
    user = os.getenv("DB_USERNAME")
    password = os.getenv("DB_PASSWORD")
    database = "user_service"

    # Habilitar SSL para conexiones seguras en TiDB Cloud
    ssl_config = {}
    if host and "tidbcloud.com" in host.lower():
        ssl_config = {"ssl": {}}

    connection = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        ssl=ssl_config if ssl_config else None,
        cursorclass=pymysql.cursors.DictCursor
    )
    try:
        with connection.cursor() as cursor:
            sql = "SELECT full_name, ficha, trainingProgram, type_document, regional, trainingCenter FROM user_profile WHERE document = %s"
            cursor.execute(sql, (document_number,))
            return cursor.fetchone()
    finally:
        connection.close()

app = FastAPI(
    title="MyAccess Sofia Plus Validation Service",
    description="Servicio de validación automatizada e IA para credenciales contra Sofia Plus",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LocalProfileModel(BaseModel):
    fullName: str
    ficha: str
    trainingProgram: str

class ValidationRequest(BaseModel):
    documentType: str
    documentNumber: str
    password: str
    useMock: bool = False
    localProfile: Optional[LocalProfileModel] = None

def normalize_text(text: str) -> str:
    """
    Normaliza texto para comparación: minúsculas, sin espacios múltiples, sin tildes.
    """
    if not text:
        return ""
    text = str(text).strip().lower()
    text = " ".join(text.split())
    # Remover tildes y diacríticos
    normalized = unicodedata.normalize('NFD', text)
    return "".join(c for c in normalized if unicodedata.category(c) != 'Mn')

def explain_with_ai(field: str, local_val: str, sofia_val: str) -> str:
    """
    Usa la API de Gemini para dar una explicación detallada del error si la API key está disponible.
    Si no, usa un motor de reglas local.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            Estás validando los datos de un carné digital del SENA contra la base de datos oficial Sofia Plus.
            Hay una discrepancia en el campo '{field}'.
            Valor local registrado en Carnet: '{local_val}'
            Valor oficial en Sofia Plus: '{sofia_val}'
            
            Escribe una explicación breve, amigable y clara en español (máximo 2 frases) para mostrarle al aprendiz. 
            Diles exactamente qué está fallando y cómo corregirlo (por ejemplo, corregir la ortografía, actualizar la ficha, etc.).
            No saludes ni uses introducciones, ve directo a la explicación.
            """
            response = model.generate_content(prompt)
            if response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Error calling Gemini API: {str(e)}. Falling back to local rules.")

    # Explicación basada en reglas locales (Fuzzy Match & fallback)
    if field == "fullName":
        # Ver si es solo diferencia de acentos o espaciados
        norm_local = normalize_text(local_val)
        norm_sofia = normalize_text(sofia_val)
        if norm_local == norm_sofia:
            return f"El nombre registrado '{local_val}' tiene una discrepancia menor de ortografía o espacios con el nombre oficial '{sofia_val}' en Sofia Plus."
        return f"El nombre registrado '{local_val}' no coincide con el nombre oficial '{sofia_val}' registrado en Sofia Plus. Verifica la ortografía."
    elif field == "ficha":
        return f"La ficha de grupo registrada '{local_val}' está desactualizada. Tu ficha activa actual en Sofia Plus es '{sofia_val}'."
    elif field == "trainingProgram":
        return f"El programa de formación '{local_val}' no coincide con el programa oficial '{sofia_val}' en el que estás matriculado."
    elif field == "status":
        return f"Tu estado académico actual en Sofia Plus es '{sofia_val}', lo cual no permite validar un carnet activo. Debe ser 'EN FORMACION'."
    
    return f"El campo '{field}' no coincide con el registro oficial de Sofia Plus."

@app.post("/validate-sofia")
def validate_sofia(req: ValidationRequest):
    try:
        # Intentar obtener el perfil local de la base de datos
        db_profile = None
        db_error = None
        try:
            db_profile = get_profile_from_db(req.documentNumber)
        except Exception as dbe:
            logger.error(f"Error al conectar u obtener perfil de la base de datos: {str(dbe)}")
            db_error = str(dbe)

        # Si no se encuentra en base de datos y no fue enviado en el request, arrojar error
        if not db_profile and not req.localProfile:
            raise HTTPException(
                status_code=404,
                detail=f"Perfil no encontrado en la base de datos para el documento '{req.documentNumber}' y no se proporcionó perfil local alternativo. Error DB: {db_error}"
            )

        # Mapear datos según el origen
        if db_profile:
            local_name = db_profile.get("full_name") or ""
            local_ficha = db_profile.get("ficha") or ""
            local_program = db_profile.get("trainingProgram") or ""
            local_type_doc = db_profile.get("type_document") or req.documentType
            local_regional = db_profile.get("regional") or "Regional Quindio"
            local_center = db_profile.get("trainingCenter") or "Centro de Comercio y Turismo"
        else:
            local_name = req.localProfile.fullName
            local_ficha = req.localProfile.ficha
            local_program = req.localProfile.trainingProgram
            local_type_doc = req.documentType
            local_regional = "Regional Quindio"
            local_center = "Centro de Comercio y Turismo"

        # 1. Ejecutar el Scraper para obtener datos oficiales
        scraped_data = scrape_sofia_plus(
            doc_type=local_type_doc,
            doc_num=req.documentNumber,
            password=req.password,
            use_mock=req.useMock
        )
        
        # 2. Realizar Comparación de Datos
        mismatches = []
        
        # Comparación de Nombre
        sofia_name = scraped_data.get("fullName", "")
        if normalize_text(local_name) != normalize_text(sofia_name):
            explanation = explain_with_ai("fullName", local_name, sofia_name)
            mismatches.append({
                "field": "fullName",
                "local": local_name,
                "sofia": sofia_name,
                "explanation": explanation
            })
            
        # Comparación de Ficha
        sofia_ficha = scraped_data.get("ficha", "")
        if normalize_text(local_ficha) != normalize_text(sofia_ficha):
            explanation = explain_with_ai("ficha", local_ficha, sofia_ficha)
            mismatches.append({
                "field": "ficha",
                "local": local_ficha,
                "sofia": sofia_ficha,
                "explanation": explanation
            })
            
        # Comparación de Programa de Formación (Solo si no coinciden)
        sofia_program = scraped_data.get("trainingProgram", "")
        if normalize_text(local_program) not in normalize_text(sofia_program) and normalize_text(sofia_program) not in normalize_text(local_program):
            explanation = explain_with_ai("trainingProgram", local_program, sofia_program)
            mismatches.append({
                "field": "trainingProgram",
                "local": local_program,
                "sofia": sofia_program,
                "explanation": explanation
            })
            
        # Validar Estado Académico (Debe ser activo: 'EN FORMACION', 'MATRICULADO', etc.)
        status = scraped_data.get("status", "").upper()
        if "CANCELADO" in status or "RETIRADO" in status or "INACTIVO" in status:
            explanation = explain_with_ai("status", "ACTIVO", status)
            mismatches.append({
                "field": "status",
                "local": "ACTIVO",
                "sofia": status,
                "explanation": explanation
            })

        # 3. Determinar resultado final
        success = len(mismatches) == 0
        
        # SOLO validar y retornar errores - NO generar carnet
        if not success:
            # Retornar solo los errores detectados, sin generar imagen
            return {
                "success": False,
                "mismatches": mismatches,
                "scrapedData": scraped_data,
                "message": "La validación detectó discrepancias en los datos. Revisa los campos marcados."  
            }

        # Si todo coincide correctamente
        return {
            "success": True,
            "message": "¡Validación exitosa! Todos los datos coinciden con Sofia Plus.",
            "scrapedData": scraped_data
        }

    except Exception as e:
        logger.error(f"Error in validate_sofia: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5005)
