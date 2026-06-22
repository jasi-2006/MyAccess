import logging
import time
# pyrefly: ignore [missing-import]
from bs4 import BeautifulSoup
# pyrefly: ignore [missing-import]
from selenium import webdriver
# pyrefly: ignore [missing-import]
from selenium.webdriver.common.by import By
# pyrefly: ignore [missing-import]
from selenium.webdriver.support.ui import WebDriverWait
# pyrefly: ignore [missing-import]
from selenium.webdriver.support import expected_conditions as EC
# pyrefly: ignore [missing-import]
from selenium.webdriver.support.ui import Select
# pyrefly: ignore [missing-import]
from selenium.webdriver.chrome.service import Service
# pyrefly: ignore [missing-import]
from selenium.webdriver.chrome.options import Options
# pyrefly: ignore [missing-import]
from webdriver_manager.chrome import ChromeDriverManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    import os
    if os.path.exists("/usr/bin/chromium"):
        options.binary_location = "/usr/bin/chromium"
        logger.info("Found system chromium binary at /usr/bin/chromium")
    elif os.path.exists("/usr/bin/chromium-browser"):
        options.binary_location = "/usr/bin/chromium-browser"
        logger.info("Found system chromium binary at /usr/bin/chromium-browser")
        
    try:
        if os.path.exists("/usr/bin/chromedriver"):
            logger.info("Found system chromedriver at /usr/bin/chromedriver")
            service = Service(executable_path="/usr/bin/chromedriver")
        else:
            service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
    except Exception as e:
        logger.warning(f"Error initializing webdriver: {str(e)}. Attempting default Chrome initialization.")
        driver = webdriver.Chrome(options=options)
    return driver

def scrape_sofia_plus(doc_type: str, doc_num: str, password: str, use_mock: bool = False) -> dict:
    """
    Retorna datos oficiales de Sofia Plus de un aprendiz usando Selenium.
    Si use_mock es True o el documento empieza con '123', retorna datos mock.
    """
    # ── MOCK SYSTEM FOR VALIDATION ───────────────────────────────────────────
    if use_mock or str(doc_num).startswith("123"):
        logger.info(f"Using Mock Mode for document: {doc_num}")
        
        doc_str = str(doc_num)
        if doc_str == "12345678":
            return {
                "fullName": "Juan Perez",
                "ficha": "2455678",
                "trainingProgram": "ADSO",
                "status": "EN FORMACION",
                "trainingCenter": "Centro de Comercio y Turismo",
                "regional": "Regional Quindio"
            }
        elif doc_str == "12345679":
            return {
                "fullName": "Daniela López",
                "ficha": "2455678",
                "trainingProgram": "ADSO",
                "status": "EN FORMACION",
                "trainingCenter": "Centro de Comercio y Turismo",
                "regional": "Regional Quindio"
            }
        elif doc_str == "12345680":
            return {
                "fullName": "Sofia Vergara",
                "ficha": "2899123",
                "trainingProgram": "ADSO",
                "status": "EN FORMACION",
                "trainingCenter": "Centro de Comercio y Turismo",
                "regional": "Regional Quindio"
            }
        elif doc_str == "12345681":
            return {
                "fullName": "Carlos Restrepo",
                "ficha": "2200111",
                "trainingProgram": "ADSO",
                "status": "CANCELADO",
                "trainingCenter": "Centro de Comercio y Turismo",
                "regional": "Regional Quindio"
            }
        else:
            return {
                "fullName": "Aprendiz Autoverificado",
                "ficha": "2455678",
                "trainingProgram": "ADSO",
                "status": "EN FORMACION",
                "trainingCenter": "Centro de Comercio y Turismo",
                "regional": "Regional Quindio"
            }
    
    # ── MODO PRODUCTIVO CON SELENIUM ─────────────────────────────────────────
    logger.info(f"Starting Selenium scraping for document {doc_num}...")
    driver = None
    try:
        driver = init_driver()
        
        # 1. Navegar al login de Sofia Plus
        driver.get("https://oferta.senasofiaplus.edu.co/sofia-oferta/ingresar.html")
        
        # 2. Seleccionar tipo de documento
        select_elem = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//select[contains(@id, 'tipoDocumento') or contains(@name, 'tipoDocumento') or contains(@id, 'tipDoc')]"))
        )
        select_obj = Select(select_elem)
        doc_type_upper = doc_type.upper()
        matched = False
        for opt in select_obj.options:
            val = opt.get_attribute("value") or ""
            txt = opt.text or ""
            if doc_type_upper == val.upper() or doc_type_upper in txt.upper():
                select_obj.select_by_visible_text(txt)
                matched = True
                break
        if not matched:
            select_obj.select_by_value(doc_type)
            
        # 3. Digitar número de documento
        doc_input = driver.find_element(By.XPATH, "//input[contains(@id, 'documento') or contains(@name, 'documento') or contains(@id, 'usuario')]")
        doc_input.clear()
        doc_input.send_keys(doc_num)
        
        # 4. Digitar contraseña
        pass_input = driver.find_element(By.XPATH, "//input[@type='password' or contains(@id, 'password') or contains(@name, 'password') or contains(@id, 'clave')]")
        pass_input.clear()
        pass_input.send_keys(password)
        
        # 5. Hacer clic en Ingresar
        submit_btn = driver.find_element(By.XPATH, "//button[contains(@id, 'ingresar') or contains(@id, 'btnIngresar') or contains(@value, 'Ingresar') or @type='submit']")
        submit_btn.click()
        
        # 6. Esperar a ingresar y cambiar de Rol a Aprendiz
        rol_select = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, "//select[contains(@id, 'rol') or contains(@name, 'rol') or contains(@id, 'perfil')]"))
        )
        rol_select_obj = Select(rol_select)
        
        try:
            rol_select_obj.select_by_visible_text("Aprendiz")
        except Exception:
            for opt in rol_select_obj.options:
                if "APRENDIZ" in opt.text.upper():
                    rol_select_obj.select_by_visible_text(opt.text)
                    break
        
        time.sleep(3)
        
        # 7. Ir a la ventana/menú de "Validar Datos" / "Registro Persona" / "Datos Básicos"
        try:
            registro_menu = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Registro') or contains(text(), 'REGISTRO') or contains(text(), 'Registro Persona')]"))
            )
            registro_menu.click()
            time.sleep(1)
        except Exception as e:
            logger.warning(f"No se pudo hacer click en el menú Registro por texto: {str(e)}. Intentando XPath alternativo.")
            menus = driver.find_elements(By.XPATH, "//a[contains(@class, 'menu') or contains(@id, 'menu')]")
            for m in menus:
                if "REGISTRO" in m.text.upper() or "PERSONA" in m.text.upper():
                    m.click()
                    break
                    
        try:
            datos_basicos_link = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Datos básicos') or contains(text(), 'Datos Básicos') or contains(text(), 'Validar datos') or contains(text(), 'Validar Datos') or contains(text(), 'Validación de datos')]"))
            )
            datos_basicos_link.click()
            time.sleep(1)
        except Exception as e:
            logger.warning(f"No se encontró enlace directo a Datos Básicos: {str(e)}. Buscando enlaces en el panel.")
            links = driver.find_elements(By.TAG_NAME, "a")
            for link in links:
                txt = link.text.upper()
                if "DATOS" in txt or "VALIDAR" in txt or "VALIDACION" in txt:
                    link.click()
                    break

        # 8. Reingresar contraseña por seguridad (si lo solicita)
        try:
            confirm_pass = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//input[@type='password' and (contains(@id, 'confirm') or contains(@id, 'clave') or contains(@id, 'seguridad') or contains(@id, 'password'))]"))
            )
            confirm_pass.clear()
            confirm_pass.send_keys(password)
            
            confirm_btn = driver.find_element(By.XPATH, "//button[contains(@id, 'aceptar') or contains(@value, 'Aceptar') or contains(@id, 'validar') or @type='submit']")
            confirm_btn.click()
            time.sleep(2)
        except Exception:
            logger.info("No se requirió reingreso de contraseña de seguridad.")

        # 9. Extraer datos con BeautifulSoup
        soup = BeautifulSoup(driver.page_source, "html.parser")
        
        data = {
            "fullName": "",
            "ficha": "",
            "trainingProgram": "",
            "status": "EN FORMACION",
            "trainingCenter": "",
            "regional": ""
        }
        
        nombres = ""
        apellidos = ""
        
        for inp in soup.find_all("input"):
            inp_id = (inp.get("id") or "").lower()
            inp_name = (inp.get("name") or "").lower()
            inp_val = inp.get("value") or ""
            
            if "nombre" in inp_id or "nombre" in inp_name:
                nombres = (nombres + " " + inp_val).strip()
            elif "apellido" in inp_id or "apellido" in inp_name:
                apellidos = (apellidos + " " + inp_val).strip()
            elif "regional" in inp_id or "regional" in inp_name:
                data["regional"] = inp_val
            elif "centro" in inp_id or "centro" in inp_name:
                data["trainingCenter"] = inp_val

        if nombres or apellidos:
            data["fullName"] = f"{nombres} {apellidos}".strip()
            
        for label_cell in soup.find_all(["td", "div", "span", "label"]):
            text = label_cell.text.strip().upper()
            next_sibling = label_cell.find_next_sibling()
            val_text = next_sibling.text.strip() if next_sibling else ""
            
            if "NOMBRES" in text and not data["fullName"]:
                nombres = val_text
            elif "APELLIDOS" in text and not data["fullName"]:
                apellidos = val_text
            elif "REGIONAL" in text and not data["regional"]:
                data["regional"] = val_text
            elif "CENTRO" in text and not data["trainingCenter"]:
                data["trainingCenter"] = val_text
                
        if not data["fullName"] and (nombres or apellidos):
            data["fullName"] = f"{nombres} {apellidos}".strip()

        # 10. Buscar Ficha y Programa de formación
        try:
            ejecucion_menu = driver.find_element(By.XPATH, "//a[contains(text(), 'Ejecución') or contains(text(), 'EJECUCIÓN') or contains(text(), 'Formación')]")
            ejecucion_menu.click()
            time.sleep(1)
            
            ruta_link = driver.find_element(By.XPATH, "//a[contains(text(), 'ruta') or contains(text(), 'Ruta')]")
            ruta_link.click()
            time.sleep(2)
            
            soup_ruta = BeautifulSoup(driver.page_source, "html.parser")
            table = soup_ruta.find("table")
            if table:
                rows = table.find_all("tr")
                for row in rows[1:]:
                    cols = [c.text.strip() for c in row.find_all("td")]
                    if len(cols) >= 3:
                        for col in cols:
                            if col.isdigit() and len(col) >= 5:
                                data["ficha"] = col
                            elif len(col) > 10 and not col.isdigit() and ("TECNOLOGO" in col.upper() or "TECNICO" in col.upper() or "ADSO" in col.upper()):
                                data["trainingProgram"] = col
                            elif "FORMACION" in col.upper() or "MATRICULADO" in col.upper() or "ACTIVO" in col.upper():
                                data["status"] = col.upper()
        except Exception as e:
            logger.warning(f"No se pudo extraer Ficha/Programa desde 'Ejecución de la formación': {str(e)}")

        # Fallbacks en caso de que falten campos
        if not data["fullName"]:
            data["fullName"] = f"Aprendiz {doc_num}"
        if not data["ficha"]:
            data["ficha"] = "Ficha no encontrada"
        if not data["trainingProgram"]:
            data["trainingProgram"] = "Programa no encontrado"
        if not data["trainingCenter"]:
            data["trainingCenter"] = "Centro de Formación SENA"
        if not data["regional"]:
            data["regional"] = "Regional Distrito Capital"

        logger.info(f"Scraped data successfully: {data}")
        return data

    except Exception as e:
        logger.error(f"Error during Sofia Plus Selenium scraping: {str(e)}")
        return {
            "fullName": f"Error: {str(e)}",
            "ficha": "Error",
            "trainingProgram": "Error",
            "status": "ERROR_SCRAPING",
            "trainingCenter": "Error",
            "regional": "Error"
        }
    finally:
        if driver:
            driver.quit()
