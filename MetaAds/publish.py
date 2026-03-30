#!/usr/bin/env python3
"""
=============================================================
  Camping Puerto Viejo Conchal — Script 2: Publicador Meta
  Autor: SmartFlow Automations
=============================================================
  QUÉ HACE:
    1. Lee la imagen aprobada y su copy del OUTPUT_FOLDER
    2. Publica en la Página de Facebook del Camping
    3. Publica en Instagram Business del Camping
    4. Registra el resultado en un log local

  EJECUTAR:
    python publish.py
      → Modo interactivo: te muestra las imágenes disponibles y vos elegís

    python publish.py --image output/foto_v1.jpg --copy output/foto_copy.json
      → Publicar archivo específico directamente

    python publish.py --list
      → Listar todas las imágenes pendientes de publicar
=============================================================
"""

import os
import sys
import json
import argparse
import time
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

# ── Cargar variables de entorno ─────────────────────────────
load_dotenv()

# ── Configuración ───────────────────────────────────────────
FB_PAGE_ID           = os.getenv("FB_PAGE_ID", "")
FB_PAGE_ACCESS_TOKEN = os.getenv("FB_PAGE_ACCESS_TOKEN", "")
IG_ACCOUNT_ID        = os.getenv("IG_ACCOUNT_ID", "")   # Instagram Business Account ID
OUTPUT_FOLDER        = os.getenv("OUTPUT_FOLDER", "./output")
LOG_FILE             = os.getenv("LOG_FILE", "./output/publish_log.json")

GRAPH_API_VERSION    = "v19.0"
GRAPH_BASE_URL       = f"https://graph.facebook.com/{GRAPH_API_VERSION}"


# ── Facebook API ─────────────────────────────────────────────
class MetaPublisher:
    def __init__(self, page_id: str, page_token: str, ig_account_id: str):
        self.page_id    = page_id
        self.token      = page_token
        self.ig_id      = ig_account_id

    def _check_response(self, response: requests.Response, platform: str) -> dict:
        """Verifica la respuesta de la API y lanza error descriptivo si falla."""
        try:
            data = response.json()
        except Exception:
            raise Exception(f"[{platform}] Respuesta inválida del servidor: {response.text}")

        if "error" in data:
            err = data["error"]
            raise Exception(
                f"[{platform}] API Error {err.get('code', '?')}: "
                f"{err.get('message', 'Error desconocido')} "
                f"(type: {err.get('type', '?')})"
            )
        return data

    def publish_facebook(self, image_path: str, caption: str) -> str:
        """Publica una foto con caption en la Página de Facebook. Retorna post_id."""
        print("  📘 Publicando en Facebook...")

        url = f"{GRAPH_BASE_URL}/{self.page_id}/photos"

        with open(image_path, "rb") as img_file:
            response = requests.post(
                url,
                data={
                    "caption":      caption,
                    "published":    "true",
                    "access_token": self.token,
                },
                files={"source": img_file},
                timeout=60
            )

        data = self._check_response(response, "Facebook")
        post_id = data.get("post_id") or data.get("id", "unknown")
        print(f"  ✅ Facebook OK — Post ID: {post_id}")
        return post_id

    def publish_instagram(self, image_path: str, caption: str) -> str:
        """
        Publica en Instagram Business (2 pasos: crear container → publicar).
        Retorna media_id.
        """
        if not self.ig_id:
            print("  ⚠️  IG_ACCOUNT_ID no configurado — saltando Instagram.")
            return ""

        print("  📸 Publicando en Instagram...")

        # La imagen debe ser accesible por URL pública para Instagram API.
        # Primero la subimos a Facebook y usamos la URL pública.
        # Alternativa: subir a un CDN temporal.
        # Aquí usamos el endpoint de Facebook para alojar temporalmente.

        # Paso 1: Subir imagen a Facebook sin publicar (para obtener URL)
        fb_upload_url = f"{GRAPH_BASE_URL}/{self.page_id}/photos"
        with open(image_path, "rb") as img_file:
            upload_resp = requests.post(
                fb_upload_url,
                data={
                    "published":    "false",
                    "temporary":    "true",
                    "access_token": self.token,
                },
                files={"source": img_file},
                timeout=60
            )
        upload_data = self._check_response(upload_resp, "Instagram-Upload")
        fb_photo_id = upload_data.get("id")

        # Obtener URL pública de la foto subida
        photo_info_resp = requests.get(
            f"{GRAPH_BASE_URL}/{fb_photo_id}",
            params={"fields": "images", "access_token": self.token},
            timeout=30
        )
        photo_info = self._check_response(photo_info_resp, "Instagram-PhotoInfo")
        images = photo_info.get("images", [])
        if not images:
            raise Exception("No se pudo obtener la URL pública de la imagen para Instagram.")
        image_url = images[0]["source"]  # URL de mayor resolución

        # Paso 2: Crear IG container
        container_url = f"{GRAPH_BASE_URL}/{self.ig_id}/media"
        container_resp = requests.post(
            container_url,
            data={
                "image_url":    image_url,
                "caption":      caption,
                "access_token": self.token,
            },
            timeout=60
        )
        container_data = self._check_response(container_resp, "Instagram-Container")
        container_id = container_data.get("id")
        print(f"     Container creado: {container_id}")

        # Esperar a que el container esté listo (recomendado por Meta)
        time.sleep(5)

        # Paso 3: Publicar el container
        publish_url = f"{GRAPH_BASE_URL}/{self.ig_id}/media_publish"
        publish_resp = requests.post(
            publish_url,
            data={
                "creation_id":  container_id,
                "access_token": self.token,
            },
            timeout=60
        )
        pub_data = self._check_response(publish_resp, "Instagram-Publish")
        media_id = pub_data.get("id", "unknown")
        print(f"  ✅ Instagram OK — Media ID: {media_id}")
        return media_id

    def validate_token(self) -> bool:
        """Verifica que el token sea válido antes de publicar."""
        resp = requests.get(
            f"{GRAPH_BASE_URL}/me",
            params={"access_token": self.token, "fields": "id,name"},
            timeout=15
        )
        try:
            data = resp.json()
            if "error" in data:
                print(f"❌ Token inválido: {data['error'].get('message')}")
                return False
            print(f"  🔑 Token válido — Cuenta: {data.get('name', data.get('id'))}")
            return True
        except Exception:
            return False


# ── Log de publicaciones ─────────────────────────────────────
def load_log(log_path: str) -> list:
    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_log(log_path: str, entries: list):
    os.makedirs(os.path.dirname(log_path) if os.path.dirname(log_path) else ".", exist_ok=True)
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)


def add_log_entry(log_path: str, entry: dict):
    entries = load_log(log_path)
    entries.append(entry)
    save_log(log_path, entries)


# ── Selección interactiva ────────────────────────────────────
def interactive_select(output_dir: Path) -> tuple:
    """Muestra las imágenes disponibles y permite elegir cuál publicar."""
    extensions = {".jpg", ".jpeg", ".png"}
    images = sorted([
        f for f in output_dir.iterdir()
        if f.suffix.lower() in extensions and not f.name.startswith(".")
    ], key=lambda x: x.stat().st_mtime, reverse=True)

    if not images:
        print(f"❌ No hay imágenes en {output_dir.resolve()}")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"  Imágenes disponibles en {output_dir.name}/")
    print(f"{'='*60}")
    for i, img in enumerate(images[:20], 1):
        mtime = datetime.fromtimestamp(img.stat().st_mtime).strftime("%d/%m/%Y %H:%M")
        print(f"  [{i:2d}] {img.name:<50} ({mtime})")

    print(f"\n  [0]  Cancelar\n")

    while True:
        try:
            choice = input("  👉 Elegí el número de la imagen a publicar: ").strip()
            if choice == "0":
                print("  Cancelado.")
                sys.exit(0)
            idx = int(choice) - 1
            if 0 <= idx < len(images):
                selected_image = images[idx]
                break
            print(f"  ⚠️  Número inválido. Elegí entre 1 y {len(images)}.")
        except (ValueError, KeyboardInterrupt):
            print("\n  Cancelado.")
            sys.exit(0)

    # Buscar el JSON de copy correspondiente
    stem_parts = selected_image.stem.split("_")
    # Nombre base: todo antes de _square/_portrait/_v1/_v2
    base_tokens = []
    for part in stem_parts:
        if part in ("square", "portrait", "v1", "v2", "overlay", "banner"):
            break
        base_tokens.append(part)
    base_name = "_".join(base_tokens)

    copy_files = list(output_dir.glob(f"{base_name}*_copy.json"))
    selected_copy = None
    if copy_files:
        selected_copy = str(copy_files[0])
        print(f"\n  ✅ Copy encontrado: {copy_files[0].name}")
    else:
        print(f"\n  ⚠️  No se encontró JSON de copy para esta imagen.")
        print(f"     Se usará un caption genérico.")

    return str(selected_image), selected_copy


# ── Función principal ────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Publica contenido aprobado en Facebook e Instagram del Camping"
    )
    parser.add_argument("--image", help="Ruta de la imagen a publicar")
    parser.add_argument("--copy",  help="Ruta del JSON de copy (opcional)")
    parser.add_argument("--list",  action="store_true", help="Listar imágenes disponibles y salir")
    parser.add_argument("--fb-only", action="store_true", help="Publicar solo en Facebook")
    parser.add_argument("--ig-only", action="store_true", help="Publicar solo en Instagram")
    parser.add_argument("--dry-run", action="store_true",
                        help="Simular publicación sin llamar a la API")
    args = parser.parse_args()

    output_dir = Path(OUTPUT_FOLDER)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n🏕️  Camping Puerto Viejo Conchal — Publicador Meta")
    print(f"{'='*55}")

    # Solo listar
    if args.list:
        interactive_select(output_dir)
        sys.exit(0)

    # Validar credenciales
    if not args.dry_run:
        missing = []
        if not FB_PAGE_ID:           missing.append("FB_PAGE_ID")
        if not FB_PAGE_ACCESS_TOKEN: missing.append("FB_PAGE_ACCESS_TOKEN")
        if missing:
            print(f"❌ Variables faltantes en .env: {', '.join(missing)}")
            print(f"   Revisá la guía de configuración en README.md")
            sys.exit(1)

    # Determinar imagen y copy
    if args.image:
        image_path = args.image
        copy_path  = args.copy
    else:
        image_path, copy_path = interactive_select(output_dir)

    if not os.path.exists(image_path):
        print(f"❌ No se encontró la imagen: {image_path}")
        sys.exit(1)

    # Cargar copy
    caption_fb = ""
    caption_ig = ""
    copy_data  = {}

    if copy_path and os.path.exists(copy_path):
        with open(copy_path, "r", encoding="utf-8") as f:
            copy_file = json.load(f)
        copy_data  = copy_file.get("copy", {})
        hashtags   = copy_data.get("hashtags", "")
        caption_fb = copy_data.get("caption_facebook", "") + "\n\n" + hashtags
        caption_ig = copy_data.get("caption_instagram", "") + "\n\n" + hashtags
    else:
        # Caption genérico de respaldo
        caption_fb = (
            "🏕️ ¿Buscás una escapada a la playa en familia?\n\n"
            "Camping Puerto Viejo Conchal te espera en Guanacaste.\n"
            "A solo 3 minutos de Playa Puerto Viejo 🌊\n"
            "También podés caminar a Playa Conchal, Minas y Piratas.\n\n"
            "✅ Solo ₡7.000 por persona/noche\n"
            "🐾 Pet friendly (con correa)\n"
            "🚿 Baños limpios y duchas frescas\n\n"
            "👉 Reservá en línea: https://camping-puertoviejo-conchal.com/\n\n"
            "#CampingCostaRica #PlayaConchal #GuanacasteCR #VacacionesFamiliares"
        )
        caption_ig = caption_fb

    # Confirmación final
    print(f"\n  📋 RESUMEN DE PUBLICACIÓN")
    print(f"  {'─'*50}")
    print(f"  Imagen:    {Path(image_path).name}")
    print(f"  Copy (FB): {caption_fb[:100]}...")
    print(f"  Destinos:  {'Facebook' if not args.ig_only else ''} "
          f"{'+ Instagram' if not args.fb_only and IG_ACCOUNT_ID else ''}")
    if args.dry_run:
        print(f"\n  🧪 MODO DRY RUN — No se publicará nada.\n")

    if not args.dry_run:
        confirm = input(f"\n  ¿Publicar ahora? (s/n): ").strip().lower()
        if confirm not in ("s", "si", "sí", "yes", "y"):
            print("  ❌ Publicación cancelada.")
            sys.exit(0)

    print(f"\n  🚀 Publicando...\n")

    results = {
        "timestamp":   datetime.now().isoformat(),
        "image_path":  image_path,
        "copy_path":   copy_path,
        "facebook":    None,
        "instagram":   None,
        "success":     False,
        "error":       None,
    }

    if args.dry_run:
        print("  ✅ [DRY RUN] Facebook — simulated post_id: DRY_FB_123")
        print("  ✅ [DRY RUN] Instagram — simulated media_id: DRY_IG_456")
        results["success"] = True
        results["facebook"] = "DRY_FB_123"
        results["instagram"] = "DRY_IG_456"
    else:
        publisher = MetaPublisher(FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN, IG_ACCOUNT_ID)

        # Validar token
        print("  🔑 Validando token...")
        if not publisher.validate_token():
            print("\n❌ Token inválido. Generá uno nuevo siguiendo el README.")
            sys.exit(1)

        try:
            # Facebook
            if not args.ig_only:
                fb_id = publisher.publish_facebook(image_path, caption_fb)
                results["facebook"] = fb_id

            # Instagram
            if not args.fb_only and IG_ACCOUNT_ID:
                ig_id = publisher.publish_instagram(image_path, caption_ig)
                results["instagram"] = ig_id

            results["success"] = True

        except Exception as e:
            results["error"] = str(e)
            print(f"\n❌ Error al publicar: {e}")
            add_log_entry(LOG_FILE, results)
            sys.exit(1)

    # Guardar log
    add_log_entry(LOG_FILE, results)

    print(f"\n{'='*55}")
    print(f"  ✅ PUBLICACIÓN EXITOSA")
    if results.get("facebook"):
        print(f"  📘 Facebook Post ID: {results['facebook']}")
    if results.get("instagram"):
        print(f"  📸 Instagram Media ID: {results['instagram']}")
    print(f"  📋 Log guardado en: {LOG_FILE}")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    main()
