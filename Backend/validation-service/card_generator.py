import os
import uuid
from PIL import Image, ImageDraw, ImageFont

def generate_feedback_card(
    profile_data: dict, 
    mismatched_fields: list, 
    uploads_dir: str = None
) -> str:
    """
    Genera una imagen mockup del carnet del aprendiz y dibuja recuadros rojos
    alrededor de los campos con discrepancias.
    Retorna el nombre del archivo generado (guardado en la carpeta uploads).
    """
    # Determinar la carpeta de subidas
    if not uploads_dir:
        # Buscar la ruta por defecto
        # Intenta en el user-service local primero, de lo contrario en el directorio actual
        possible_paths = [
            os.path.join("..", "user-service", "uploads"),
            os.path.join("Backend", "user-service", "uploads"),
            os.path.join("..", "MyAccess", "uploads"),
            "uploads"
        ]
        for p in possible_paths:
            if os.path.exists(p) or os.path.exists(os.path.dirname(p)):
                uploads_dir = p
                break
        if not uploads_dir:
            uploads_dir = "uploads"
            
    os.makedirs(uploads_dir, exist_ok=True)

    # 1. Crear lienzo de alta resolución (530x840)
    width, height = 530, 840
    img = Image.new("RGB", (width, height), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    # 2. Dibujar Fondo del Carnet (Estilos de CarnetCard.jsx)
    # Dibujar bordes redondeados limpios (simulado)
    draw.rectangle([10, 10, width - 10, height - 10], fill="#FDFDFD", outline="#D7D7D7", width=2)
    
    # 3. Dibujar Encabezado Verde SENA
    sena_green = "#0A8A4A"
    draw.rectangle([10, 10, width - 10, 150], fill=sena_green)

    # Cargar Fuentes (fuente integrada por defecto si no están las de sistema)
    try:
        # En Windows, comúnmente están Arial o Segoe UI
        font_bold = ImageFont.truetype("arialbd.ttf", 26)
        font_regular = ImageFont.truetype("arial.ttf", 20)
        font_small = ImageFont.truetype("arial.ttf", 16)
        font_large = ImageFont.truetype("arialbd.ttf", 36)
    except Exception:
        font_bold = ImageFont.load_default()
        font_regular = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_large = ImageFont.load_default()

    # 4. Dibujar Textos del Encabezado
    draw.text((30, 40), "SENA", fill="#FFFFFF", font=font_large)
    draw.text((30, 95), "CARNET DIGITAL", fill="#FFFFFF", font=font_regular)

    # 5. Dibujar Foto de Perfil (Silueta de Placeholder)
    # Coordenadas: X de 310 a 490 (ancho 180), Y de 60 a 280 (alto 220)
    photo_box = [310, 60, 490, 280]
    draw.rectangle(photo_box, fill="#E9E9E9", outline="#D7D7D7", width=2)
    # Dibujar una silueta simple con el lápiz
    draw.ellipse([360, 100, 440, 180], fill="#CCCCCC")  # Cabeza
    draw.ellipse([330, 190, 470, 270], fill="#CCCCCC")  # Cuerpo

    # 6. Dibujar Cuerpo del Carnet
    # Rol Label
    draw.text((30, 310), "APRENDIZ", fill="#2F2F2F", font=font_bold)
    # Regla verde divisoria
    draw.line([30, 345, 280, 345], fill=sena_green, width=6)

    # Nombre del Aprendiz
    student_name = profile_data.get("fullName", "Aprendiz SENA")
    draw.text((30, 370), student_name, fill="#118449", font=font_bold)

    # C.C. Documento
    doc_type = profile_data.get("typeDocument", "C.C")
    doc_num = profile_data.get("document", "0.000.000.000")
    blood = profile_data.get("bloodType", "RH O+")
    doc_text = f"{doc_type} {doc_num}   RH {blood}"
    draw.text((30, 420), doc_text, fill="#3A3A3A", font=font_regular)

    # Código de barras (Simulado)
    # Dibujar barras negras finas
    barcode_x = 30
    barcode_y = 470
    barcode_w = 250
    barcode_h = 50
    draw.rectangle([barcode_x, barcode_y, barcode_x + barcode_w, barcode_y + barcode_h], fill="#FFFFFF", outline="#111111", width=1)
    for i in range(barcode_x + 10, barcode_x + barcode_w - 10, 8):
        # Alternar grosores
        w_bar = 2 if i % 3 == 0 else 4 if i % 5 == 0 else 1
        draw.rectangle([i, barcode_y + 5, i + w_bar, barcode_y + barcode_h - 5], fill="#111111")

    # 7. Dibujar Pie de Página (Footer)
    regional = profile_data.get("regional", "Regional Quindio")
    center = profile_data.get("trainingCenter", "Centro de Comercio y Turismo")
    program = profile_data.get("trainingProgram", "ADSO")
    ficha = profile_data.get("ficha", "0000000")

    draw.text((30, 560), f"Regional {regional}", fill="#4A4A4A", font=font_bold)
    draw.text((30, 600), center, fill="#5D9C7A", font=font_bold)
    
    # Envolver texto del programa si es muy largo
    if len(program) > 30:
        program_line1 = program[:30] + "..."
        draw.text((30, 640), program_line1, fill="#4A4A4A", font=font_regular)
    else:
        draw.text((30, 640), program, fill="#4A4A4A", font=font_regular)

    draw.text((30, 680), f"Grupo No {ficha}", fill="#4A4A4A", font=font_regular)

    # 8. DIBUJAR RECUADROS ROJOS DE ERROR
    # Mapeo de campos a coordenadas aproximadas en el lienzo de 530x840
    highlights = {
        "fullName": [20, 360, 500, 410],
        "document": [20, 412, 300, 455],
        "ficha": [20, 672, 280, 715],
        "trainingProgram": [20, 632, 500, 670]
    }

    red_color = "#DC2626"
    for field in mismatched_fields:
        if field in highlights:
            box = highlights[field]
            # Dibujar rectángulo rojo semi-transparente o grueso
            draw.rectangle(box, outline=red_color, width=4)
            # Dibujar una pequeña etiqueta de "ERROR"
            draw.rectangle([box[2] - 80, box[1] - 12, box[2], box[1] + 12], fill=red_color)
            draw.text((box[2] - 75, box[1] - 10), "ERROR", fill="#FFFFFF", font=font_small)

    # Guardar imagen con nombre único
    filename = f"feedback_{uuid.uuid4()}.png"
    filepath = os.path.join(uploads_dir, filename)
    img.save(filepath, "PNG")
    
    return filename
