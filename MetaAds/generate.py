#!/usr/bin/env python3
"""
=============================================================
  Camping Puerto Viejo Conchal — Script 1: Generador de Contenido
  Autor: SmartFlow Automations
=============================================================
  QUÉ HACE:
    1. Lee fotos crudas de la carpeta INPUT_FOLDER
    2. Genera 2 variaciones de diseño por imagen
    3. Llama a Claude para crear copy persuasivo
    4. Guarda imágenes + copy en OUTPUT_FOLDER

  EJECUTAR:
    python generate.py
    python generate.py --image foto1.jpg   (procesar solo una)
=============================================================
"""

import os
import sys
import json
import argparse
import textwrap
import random
from datetime import datetime
from pathlib import Path
from io import BytesIO

import anthropic
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from dotenv import load_dotenv

# ── Cargar variables de entorno ─────────────────────────────
load_dotenv()

# ── Configuración ───────────────────────────────────────────
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
INPUT_FOLDER      = os.getenv("INPUT_FOLDER", "./images")
OUTPUT_FOLDER     = os.getenv("OUTPUT_FOLDER", "./output")
WEBSITE_URL       = "https://camping-puertoviejo-conchal.com/"

# Dimensiones estándar para Meta (1:1 y 4:5)
TARGET_SIZES = {
    "square": (1080, 1080),   # Facebook/Instagram Feed cuadrado
    "portrait": (1080, 1350), # Instagram retrato (mejor reach)
}

BRAND_COLORS = {
    "green_dark":   (34,  85,  34),   # Verde selva oscuro
    "green_mid":    (56,  116, 56),   # Verde medio
    "green_light":  (144, 195, 100),  # Verde lima
    "sand":         (230, 210, 170),  # Arena playa
    "white":        (255, 255, 255),
    "black":        (0,   0,   0),
    "overlay_dark": (0,   0,   0,   160),  # Negro semitransparente
    "overlay_green":(20,  60,  20,  140),  # Verde oscuro semitransparente
}

CAMPING_INFO = {
    "nombre":  "Camping Puerto Viejo Conchal",
    "precio":  "₡7.000 por persona/noche",
    "playas":  "Playa Puerto Viejo a 3 min en carro",
    "mascotas":"🐾 Se aceptan mascotas con correa",
    "website": WEBSITE_URL,
    "features": [
        "🌿 Naturaleza exuberante",
        "🚿 Baños limpios y duchas frescas",
        "👨‍👩‍👧‍👦 Ambiente familiar y tranquilo",
        "🏖️ A pasos de 4 playas",
        "🐾 Pet friendly con correa",
    ]
}


# ── Fuentes ─────────────────────────────────────────────────
def get_font(size: int, bold: bool = False):
    """Intenta cargar fuentes del sistema, sino usa la default de Pillow."""
    font_candidates = {
        True: [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "C:/Windows/Fonts/arialbd.ttf",
        ],
        False: [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "C:/Windows/Fonts/arial.ttf",
        ]
    }
    for path in font_candidates[bold]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


# ── Utilidades de imagen ─────────────────────────────────────
def load_and_resize(image_path: str, target_size: tuple) -> Image.Image:
    """Carga y recorta la imagen al tamaño objetivo (crop centrado)."""
    img = Image.open(image_path).convert("RGB")
    tw, th = target_size
    iw, ih = img.size
    scale = max(tw / iw, th / ih)
    new_w, new_h = int(iw * scale), int(ih * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - tw) // 2
    top  = (new_h - th) // 2
    return img.crop((left, top, left + tw, top + th))


def draw_text_wrapped(draw, text, font, max_width, x, y, fill, line_spacing=8):
    """Dibuja texto con wrap automático, retorna la Y final."""
    words = text.split()
    lines, line = [], []
    for word in words:
        test = " ".join(line + [word])
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] <= max_width:
            line.append(word)
        else:
            if line:
                lines.append(" ".join(line))
            line = [word]
    if line:
        lines.append(" ".join(line))

    for ln in lines:
        draw.text((x, y), ln, font=font, fill=fill)
        bbox = draw.textbbox((0, 0), ln, font=font)
        y += (bbox[3] - bbox[1]) + line_spacing
    return y


def draw_rounded_rect(draw, xy, radius, fill):
    """Dibuja un rectángulo con esquinas redondeadas."""
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill)


# ── VARIACIÓN 1: Overlay oscuro semitransparente ─────────────
def apply_variation_1(img: Image.Image, copy_data: dict) -> Image.Image:
    """
    Estilo: Overlay verde oscuro semitransparente en la mitad inferior.
    Logo/nombre arriba, copy central, precio + CTA abajo.
    """
    result = img.copy().convert("RGBA")
    w, h = result.size

    # Overlay degradado en la mitad inferior
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)

    # Gradiente manual: más opaco abajo
    panel_top = int(h * 0.42)
    for row in range(panel_top, h):
        progress = (row - panel_top) / (h - panel_top)
        alpha = int(30 + progress * 185)
        r, g, b = BRAND_COLORS["green_dark"]
        ov_draw.line([(0, row), (w, row)], fill=(r, g, b, alpha))

    result = Image.alpha_composite(result, overlay)
    draw = ImageDraw.Draw(result)

    # ── Barra superior (nombre del camping) ──
    bar_h = 70
    bar_overlay = Image.new("RGBA", (w, bar_h), (*BRAND_COLORS["green_dark"], 200))
    result.alpha_composite(bar_overlay, (0, 0))
    draw = ImageDraw.Draw(result)

    font_title = get_font(28, bold=True)
    draw.text((w // 2, 35), "🏕️ " + CAMPING_INFO["nombre"],
              font=font_title, fill=BRAND_COLORS["white"], anchor="mm")

    # ── Copy principal ──
    copy_text = copy_data.get("copy_short", "")
    font_copy = get_font(36, bold=True)
    margin = 60
    y_copy = int(h * 0.47)
    y_copy = draw_text_wrapped(draw, copy_text, font_copy,
                                w - margin * 2, margin, y_copy,
                                fill=BRAND_COLORS["white"], line_spacing=10)

    # ── Frase secundaria ──
    secondary = copy_data.get("copy_secondary", "")
    if secondary:
        font_sec = get_font(26)
        y_copy += 14
        y_copy = draw_text_wrapped(draw, secondary, font_sec,
                                    w - margin * 2, margin, y_copy,
                                    fill=BRAND_COLORS["sand"], line_spacing=8)

    # ── Panel inferior: precio + CTA ──
    panel_h = 115
    panel_y = h - panel_h
    panel_overlay = Image.new("RGBA", (w, panel_h), (*BRAND_COLORS["green_dark"], 230))
    result.alpha_composite(panel_overlay, (0, panel_y))
    draw = ImageDraw.Draw(result)

    font_price = get_font(34, bold=True)
    font_cta   = get_font(26, bold=True)
    font_small = get_font(20)

    draw.text((margin, panel_y + 12), CAMPING_INFO["precio"],
              font=font_price, fill=BRAND_COLORS["green_light"])
    draw.text((margin, panel_y + 52), "🐾 Pet friendly  •  👨‍👩‍👧 Familias",
              font=font_small, fill=BRAND_COLORS["sand"])

    # Botón CTA
    btn_w, btn_h_size = 280, 48
    btn_x = w - btn_w - margin
    btn_y = panel_y + (panel_h - btn_h_size) // 2
    draw_rounded_rect(draw, (btn_x, btn_y, btn_x + btn_w, btn_y + btn_h_size),
                      radius=10, fill=BRAND_COLORS["green_light"])
    draw.text((btn_x + btn_w // 2, btn_y + btn_h_size // 2),
              "¡Reservá aquí! →", font=font_cta,
              fill=BRAND_COLORS["green_dark"], anchor="mm")

    # URL pequeña
    font_url = get_font(18)
    draw.text((w // 2, h - 8), WEBSITE_URL,
              font=font_url, fill=BRAND_COLORS["sand"], anchor="mb")

    return result.convert("RGB")


# ── VARIACIÓN 2: Banner inferior sólido estilo anuncio ───────
def apply_variation_2(img: Image.Image, copy_data: dict) -> Image.Image:
    """
    Estilo: Foto en 60% superior, banner sólido verde en 40% inferior.
    Limpio, corporativo, con precio destacado y CTA claro.
    """
    w, h = img.size
    result = Image.new("RGB", (w, h), BRAND_COLORS["green_dark"])

    # Foto ocupa 62% superior con leve viñeta
    photo_h = int(h * 0.62)
    photo = img.crop((0, 0, w, photo_h)).copy()

    # Viñeta inferior en la foto
    vignette = Image.new("RGBA", (w, photo_h), (0, 0, 0, 0))
    vg_draw = ImageDraw.Draw(vignette)
    for row in range(int(photo_h * 0.65), photo_h):
        progress = (row - int(photo_h * 0.65)) / (photo_h * 0.35)
        alpha = int(progress * 160)
        vg_draw.line([(0, row), (w, row)], fill=(20, 60, 20, alpha))
    photo_rgba = photo.convert("RGBA")
    photo_rgba = Image.alpha_composite(photo_rgba, vignette)
    result.paste(photo_rgba.convert("RGB"), (0, 0))

    # Línea separadora verde lima
    draw = ImageDraw.Draw(result)
    draw.rectangle([(0, photo_h), (w, photo_h + 5)],
                   fill=BRAND_COLORS["green_light"])

    banner_y = photo_h + 5
    banner_area = h - banner_y
    margin = 50

    # ── Nombre + emoji ──
    font_name = get_font(28, bold=True)
    draw.text((margin, banner_y + 18), "🏕️  " + CAMPING_INFO["nombre"],
              font=font_name, fill=BRAND_COLORS["green_light"])

    # ── Copy principal ──
    copy_text = copy_data.get("copy_short", "")
    font_copy = get_font(32, bold=True)
    y_txt = banner_y + 62
    y_txt = draw_text_wrapped(draw, copy_text, font_copy,
                               w - margin * 2, margin, y_txt,
                               fill=BRAND_COLORS["white"], line_spacing=8)

    # ── Íconos de features ──
    features = CAMPING_INFO["features"][:3]
    font_feat = get_font(22)
    y_feat = y_txt + 12
    for feat in features:
        draw.text((margin, y_feat), feat, font=font_feat, fill=BRAND_COLORS["sand"])
        y_feat += 30

    # ── Precio (destacado, lado derecho) ──
    price_x = w - margin
    price_y = banner_y + 20
    font_price_label = get_font(20)
    font_price_main  = get_font(38, bold=True)
    draw.text((price_x, price_y), "Desde", font=font_price_label,
              fill=BRAND_COLORS["sand"], anchor="ra")
    draw.text((price_x, price_y + 24), "₡7.000", font=font_price_main,
              fill=BRAND_COLORS["green_light"], anchor="ra")
    draw.text((price_x, price_y + 68), "por persona/noche", font=font_price_label,
              fill=BRAND_COLORS["sand"], anchor="ra")

    # ── CTA ──
    cta_h = 52
    cta_y = h - cta_h - 22
    cta_w = w - margin * 2
    draw_rounded_rect(draw, (margin, cta_y, margin + cta_w, cta_y + cta_h),
                      radius=12, fill=BRAND_COLORS["green_light"])
    font_cta = get_font(26, bold=True)
    draw.text((margin + cta_w // 2, cta_y + cta_h // 2),
              "🌐  Reservá en línea: camping-puertoviejo-conchal.com",
              font=font_cta, fill=BRAND_COLORS["green_dark"], anchor="mm")

    return result


# ── Generador de copy con Claude ────────────────────────────
def generate_copy_with_claude(api_key: str, image_filename: str) -> dict:
    """Llama a Claude para generar copy persuasivo con variación semanal."""

    weekly_themes = [
        {"angle": "escapada familiar", "emoji": "👨‍👩‍👧‍👦",
         "hook": "¿Cuándo fue la última vez que la familia se desconectó de verdad?"},
        {"angle": "naturaleza y playa", "emoji": "🌿🏖️",
         "hook": "4 playas a pasos. Naturaleza pura. Solo ₡7.000 por noche."},
        {"angle": "pet friendly", "emoji": "🐾",
         "hook": "¡Tu perrito también merece vacaciones en la playa!"},
        {"angle": "precio accesible", "emoji": "💚",
         "hook": "Vacaciones en Guanacaste sin romper el presupuesto."},
        {"angle": "Semana Santa / feriados", "emoji": "🌴",
         "hook": "Feriados cerca: ¿ya tenés tu lugar en la playa?"},
    ]

    week_num = datetime.now().isocalendar()[1]
    theme = weekly_themes[week_num % len(weekly_themes)]

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""Sos un experto en marketing digital para redes sociales en Costa Rica.
Escribís copy persuasivo, cálido y auténtico para Facebook e Instagram.
Conocés bien el tono costarricense: directo, amigable, con orgullo por la naturaleza y la familia.

DATOS DEL NEGOCIO:
- Nombre: Camping Puerto Viejo Conchal, Guanacaste, Costa Rica
- Precio: ₡7.000 por persona por noche
- Ambiente: tranquilo y familiar
- Se aceptan mascotas con correa
- Baños limpios y duchas frescas
- A 3 minutos en carro (15 min caminando) de Playa Puerto Viejo
- Caminando se llega a Playa Conchal, Playa Minas y Playa Piratas
- Naturaleza exuberante
- Reservas en línea: {WEBSITE_URL}

ÁNGULO DE ESTA SEMANA: {theme['angle']} {theme['emoji']}
HOOK SUGERIDO: {theme['hook']}

GENERA exactamente este JSON (sin markdown, sin explicaciones):
{{
  "copy_short": "<texto principal del post, máximo 180 chars, impactante, con el hook semanal>",
  "copy_secondary": "<frase secundaria de apoyo, máximo 120 chars, menciona las playas o el precio>",
  "caption_facebook": "<caption completo para Facebook, 3-4 párrafos, con emojis, menciona reservas en línea, precio, playas y mascotas>",
  "caption_instagram": "<caption para Instagram, más visual y emocional, con los mismos datos clave>",
  "hashtags": "<10-12 hashtags relevantes separados por espacio, mix español/inglés, CR y playa>"
}}

Reglas del copy:
- Usá "vos/tenés/reservá" (español costarricense)
- Siempre mencioná el precio ₡7.000 de forma atractiva
- Siempre terminá con un CTA claro para reservar en línea
- Tono cálido pero con urgencia suave
- Los captions deben sentirse humanos, no como publicidad genérica"""

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1200,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.content[0].text.strip()
    # Limpiar posibles bloques de código markdown
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback si Claude devuelve algo inesperado
        print("⚠️  Advertencia: Claude no devolvió JSON puro. Usando copy de respaldo.")
        return {
            "copy_short": "La playa más tranquila de Guanacaste te está esperando 🌿",
            "copy_secondary": f"4 playas a pasos. Solo {CAMPING_INFO['precio']}.",
            "caption_facebook": f"🏕️ ¡Escapate al Camping Puerto Viejo Conchal!\n\nNaturaleza, playa y tranquilidad desde ₡7.000 por persona/noche. Familias, parejas y mascotas bienvenidas 🐾\n\nA solo 3 minutos de Playa Puerto Viejo y caminando a Playa Conchal, Minas y Piratas.\n\n¡Reservá en línea! 👉 {WEBSITE_URL}",
            "caption_instagram": f"🌊 Naturaleza + playa + familia = Camping Puerto Viejo Conchal ✨\n\nDesde ₡7.000/persona. Pet friendly 🐾\nReservá: {WEBSITE_URL}",
            "hashtags": "#CampingCostaRica #PlayaConchal #GuanacasteCostaRica #CampingFamiliar #PuertoViejo #PlayaConchal #VacacionesCR #PetFriendlyCR #NaturalezaCR #EscapadaFamiliar"
        }


# ── Procesamiento principal ──────────────────────────────────
def process_image(image_path: str, api_key: str, output_dir: Path) -> dict:
    """Procesa una imagen: genera 2 variaciones + copy. Retorna paths de salida."""

    filename = Path(image_path).stem
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = f"{filename}_{timestamp}"

    print(f"\n{'='*55}")
    print(f"  Procesando: {Path(image_path).name}")
    print(f"{'='*55}")

    # Generar copy
    print("  🤖 Generando copy con Claude...")
    copy_data = generate_copy_with_claude(api_key, Path(image_path).name)
    print(f"  ✅ Copy generado: \"{copy_data['copy_short'][:60]}...\"")

    results = {}

    for size_name, size_dims in TARGET_SIZES.items():
        print(f"\n  📐 Tamaño: {size_name} {size_dims[0]}x{size_dims[1]}px")

        # Cargar y redimensionar
        base_img = load_and_resize(image_path, size_dims)

        # Variación 1
        print("     Generando Variación 1 (overlay verde)...")
        v1 = apply_variation_1(base_img.copy(), copy_data)
        v1_path = output_dir / f"{base_name}_{size_name}_v1_overlay.jpg"
        v1.save(str(v1_path), "JPEG", quality=92)
        print(f"     ✅ Guardado: {v1_path.name}")

        # Variación 2
        print("     Generando Variación 2 (banner sólido)...")
        v2 = apply_variation_2(base_img.copy(), copy_data)
        v2_path = output_dir / f"{base_name}_{size_name}_v2_banner.jpg"
        v2.save(str(v2_path), "JPEG", quality=92)
        print(f"     ✅ Guardado: {v2_path.name}")

        results[size_name] = {
            "v1": str(v1_path),
            "v2": str(v2_path),
        }

    # Guardar copy en JSON
    copy_path = output_dir / f"{base_name}_copy.json"
    with open(str(copy_path), "w", encoding="utf-8") as f:
        json.dump({
            "source_image": str(image_path),
            "generated_at": datetime.now().isoformat(),
            "copy": copy_data,
            "output_images": results,
        }, f, ensure_ascii=False, indent=2)
    print(f"\n  📄 Copy guardado: {copy_path.name}")

    return {"copy_path": str(copy_path), "images": results, "copy_data": copy_data}


def main():
    parser = argparse.ArgumentParser(
        description="Genera contenido de marketing para Camping Puerto Viejo Conchal"
    )
    parser.add_argument("--image", help="Procesar solo esta imagen (nombre del archivo)")
    parser.add_argument("--all",   action="store_true", help="Procesar todas las imágenes de INPUT_FOLDER")
    args = parser.parse_args()

    # Validaciones
    if not ANTHROPIC_API_KEY:
        print("❌ ERROR: Falta ANTHROPIC_API_KEY en el archivo .env")
        sys.exit(1)

    input_dir  = Path(INPUT_FOLDER)
    output_dir = Path(OUTPUT_FOLDER)

    if not input_dir.exists():
        print(f"❌ ERROR: La carpeta de imágenes no existe: {input_dir.resolve()}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    # Buscar imágenes
    extensions = {".jpg", ".jpeg", ".png", ".webp"}
    all_images = [f for f in input_dir.iterdir()
                  if f.suffix.lower() in extensions and not f.name.startswith(".")]

    if not all_images:
        print(f"❌ No se encontraron imágenes en: {input_dir.resolve()}")
        sys.exit(1)

    if args.image:
        target = input_dir / args.image
        if not target.exists():
            print(f"❌ No se encontró: {target}")
            sys.exit(1)
        images_to_process = [target]
    elif args.all:
        images_to_process = all_images
    else:
        # Sin argumentos: procesar UNA aleatoria (comportamiento semanal)
        images_to_process = [random.choice(all_images)]
        print(f"💡 Modo semanal: procesando imagen aleatoria.")
        print(f"   Usá --all para procesar todas o --image NOMBRE.jpg para una específica.")

    print(f"\n🏕️  Camping Puerto Viejo Conchal — Generador de Contenido")
    print(f"   Imágenes a procesar: {len(images_to_process)}")
    print(f"   Output: {output_dir.resolve()}\n")

    all_results = []
    for img_path in images_to_process:
        result = process_image(str(img_path), ANTHROPIC_API_KEY, output_dir)
        all_results.append(result)

    print(f"\n{'='*55}")
    print(f"  ✅ PROCESO COMPLETO")
    print(f"{'='*55}")
    print(f"  📁 Revisá tus archivos en: {output_dir.resolve()}")
    print(f"  📸 Imágenes generadas: {len(all_results) * 4} (2 tamaños × 2 variaciones)")
    print(f"\n  PRÓXIMO PASO:")
    print(f"  Revisá las imágenes, elegí la mejor y ejecutá:")
    print(f"  python publish.py --image NOMBRE_IMAGEN.jpg --copy NOMBRE_COPY.json")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    main()
