import os
import logging
import unicodedata
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from scraper import scrape_sofia_plus
from card_generator import generate_feedback_card

# Cargar variables de entorno
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    localProfile: LocalProfileModel

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
        # 1. Ejecutar el Scraper para obtener datos oficiales
        scraped_data = scrape_sofia_plus(
            doc_type=req.documentType,
            doc_num=req.documentNumber,
            password=req.password,
            use_mock=req.useMock
        )
        
        # 2. Realizar Comparación de Datos
        mismatches = []
        
        # Comparación de Nombre
        local_name = req.localProfile.fullName
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
        local_ficha = req.localProfile.ficha
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
        local_program = req.localProfile.trainingProgram
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
        feedback_image_url = None
        
        if not success:
            # Generar la imagen con las zonas erróneas marcadas en rojo
            mismatched_fields = [m["field"] for m in mismatches]
            
            # Pasar campos de perfil a dict para el Pillow
            profile_dict = {
                "fullName": local_name,
                "typeDocument": req.documentType,
                "document": req.documentNumber,
                "ficha": local_ficha,
                "trainingProgram": local_program,
                "regional": scraped_data.get("regional", "Regional Quindio"),
                "trainingCenter": scraped_data.get("trainingCenter", "Centro de Comercio y Turismo")
            }
            
            filename = generate_feedback_card(profile_dict, mismatched_fields)
            feedback_image_url = f"/uploads/{filename}"

        return {
            "success": success,
            "mismatches": mismatches,
            "scrapedData": scraped_data,
            "feedbackImageUrl": feedback_image_url
        }

    except Exception as e:
        logger.error(f"Error in validate_sofia: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5005)
