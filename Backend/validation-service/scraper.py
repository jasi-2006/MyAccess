import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_sofia_plus(doc_type: str, doc_num: str, password: str, use_mock: bool = False) -> dict:
    """
    Retorna datos mock para validación.
    Si use_mock es True o el documento empieza con '123', retorna datos mock.
    """
    # ── MOCK SYSTEM FOR VALIDATION ───────────────────────────────────────────
    if use_mock or str(doc_num).startswith("123"):
        logger.info(f"Using Mock Mode for document: {doc_num}")
        
        doc_str = str(doc_num)
        if doc_str == "12345678":
            # Caso 1: Todo coincide perfectamente
            return {
                "fullName": "Juan Perez",
                "ficha": "2455678",
                "trainingProgram": "ADSO",
                "status": "EN FORMACION",
                "trainingCenter": "Centro de Comercio y Turismo",
                "regional": "Regional Quindio"
            }
        elif doc_str == "12345679":
            # Caso 2: Diferencia en nombre (tilde en Daniela López)
            return {
                "fullName": "Daniela López",
                "ficha": "2455678",
                "trainingProgram": "ADSO",
                "status": "EN FORMACION",
                "trainingCenter": "Centro de Comercio y Turismo",
                "regional": "Regional Quindio"
            }
        elif doc_str == "12345680":
            # Caso 3: Ficha desactualizada en el carnet local
            return {
                "fullName": "Sofia Vergara",
                "ficha": "2899123",
                "trainingProgram": "ADSO",
                "status": "EN FORMACION",
                "trainingCenter": "Centro de Comercio y Turismo",
                "regional": "Regional Quindio"
            }
        elif doc_str == "12345681":
            # Caso 4: Estado Académico es Cancelado / Inactivo
            return {
                "fullName": "Carlos Restrepo",
                "ficha": "2200111",
                "trainingProgram": "ADSO",
                "status": "CANCELADO",
                "trainingCenter": "Centro de Comercio y Turismo",
                "regional": "Regional Quindio"
            }
        else:
            # Por defecto retorna datos correctos autogenerados para simular
            return {
                "fullName": "Aprendiz Autoverificado",
                "ficha": "2455678",
                "trainingProgram": "ADSO",
                "status": "EN FORMACION",
                "trainingCenter": "Centro de Comercio y Turismo",
                "regional": "Regional Quindio"
            }
    
    # Modo prod con datos reales (opcional: integrar con API real de Sofia Plus)
    # Por ahora, retorna datos mock para evitar dependencia de Selenium
    logger.warning("Modo Selenium no disponible. Retornando datos mock.")
    return {
        "fullName": "Aprendiz Mock (API no disponible)",
        "ficha": "2455678",
        "trainingProgram": "ADSO",
        "status": "EN FORMACION",
        "trainingCenter": "Centro de Comercio y Turismo",
        "regional": "Regional Quindio"
    }
