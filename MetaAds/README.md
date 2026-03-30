# 🏕️ Camping Puerto Viejo Conchal — Automatización de Marketing Meta

Scripts de Python para generar y publicar contenido automáticamente en Facebook e Instagram.

---

## 📁 Estructura de archivos

```
camping-marketing/
├── generate.py        ← Script 1: Genera imágenes con diseño + copy
├── publish.py         ← Script 2: Publica la imagen aprobada en Meta
├── .env               ← Tus credenciales (creás este archivo vos)
├── .env.example       ← Plantilla del .env
├── requirements.txt   ← Dependencias Python
├── images/            ← TUS FOTOS CRUDAS van aquí
│   ├── foto1.jpg
│   ├── foto2.jpg
│   └── ...
└── output/            ← Imágenes generadas y copy (se crea automáticamente)
    ├── foto1_20250101_v1_overlay.jpg
    ├── foto1_20250101_v2_banner.jpg
    ├── foto1_20250101_copy.json
    └── publish_log.json
```

---

## 🚀 PASO A PASO: Instalación

### Paso 1 — Verificar Python

Abrí tu terminal y escribí:

```bash
python --version
```

Necesitás Python 3.8 o superior. Si no lo tenés:
- Windows: https://www.python.org/downloads/
- Mac: `brew install python3`

---

### Paso 2 — Descargar los archivos

Copiá los 4 archivos descargados a una carpeta nueva, por ejemplo:
- Windows: `C:\Users\TuNombre\camping-marketing\`
- Mac/Linux: `~/camping-marketing/`

Dentro de esa carpeta, creá dos subcarpetas:
```
images/    ← aquí van tus fotos crudas
output/    ← aquí se guardan los resultados (se crea solo)
```

---

### Paso 3 — Instalar dependencias

En la terminal, navegá a tu carpeta:

```bash
cd camping-marketing
```

Instalá las librerías necesarias:

```bash
pip install anthropic pillow requests python-dotenv
```

---

### Paso 4 — Configurar credenciales

Copiá el archivo `.env.example` y renombralo a `.env`:

```bash
# Mac/Linux:
cp .env.example .env

# Windows:
copy .env.example .env
```

Abrí el `.env` con cualquier editor de texto (Notepad, VS Code, etc.) y completá los valores.
Los pasos para obtener cada credencial están en las secciones de abajo.

---

## 🔑 Cómo obtener las credenciales

### Anthropic API Key

1. Andá a https://console.anthropic.com/
2. Iniciá sesión (o creá cuenta)
3. En el menú lateral: **API Keys** → **Create Key**
4. Copiá la key y pegala en el `.env` como `ANTHROPIC_API_KEY`

---

### Facebook Page Access Token (GUÍA COMPLETA)

Este es el paso más técnico. Seguilo con calma:

**1. Crear una Meta App**

1. Andá a https://developers.facebook.com/
2. Iniciá sesión con tu cuenta personal de Facebook (que debe ser admin de la Página del Camping)
3. Clic en **My Apps** → **Create App**
4. Elegí tipo: **Business** → **Next**
5. Poné un nombre (ej: "Camping PV Automation") → **Create App**

**2. Agregar el producto "Pages API"**

1. En el dashboard de tu app, buscá **Add a Product**
2. Encontrá **Facebook Login** → **Set Up**
3. Elegí **Web** → poné `http://localhost` como URL del sitio → **Save**

**3. Obtener un Page Access Token temporal (para pruebas)**

1. Andá a: https://developers.facebook.com/tools/explorer/
2. En el selector de app (arriba), elegí tu app ("Camping PV Automation")
3. Clic en **Generate Access Token**
4. Autorizá los permisos que te pida
5. En **Permissions**, agregá estos permisos:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
6. Clic en **Generate Access Token** → copialo

**4. Convertirlo en un token de PÁGINA (no de usuario)**

El token que generaste arriba es de usuario. Necesitás uno de página:

1. En Graph API Explorer, ejecutá esta consulta:
   ```
   GET /me/accounts
   ```
2. Buscá la entrada de tu Página del Camping
3. Copiá el valor de `"access_token"` de esa entrada — ESE es el Page Access Token

**5. Extender el token (para que dure ~60 días)**

Los tokens por defecto duran 1-2 horas. Para extenderlos:

1. En Graph API Explorer, ejecutá:
   ```
   GET /oauth/access_token?grant_type=fb_exchange_token
              &client_id={TU_APP_ID}
              &client_secret={TU_APP_SECRET}
              &fb_exchange_token={TU_TOKEN_DE_PAGINA}
   ```
2. Encontrás el App ID y App Secret en: tu App → **Settings** → **Basic**
3. El nuevo token dura ~60 días

**6. Obtener el Page ID**

1. Andá a tu Página de Facebook del Camping
2. Clic en **Acerca de** (o en los tres puntos → **Acerca de esta página**)
3. Buscá **ID de página** — ese número es el `FB_PAGE_ID`

---

### Instagram Business Account ID (opcional)

Solo si tenés Instagram Business conectado a tu Página de Facebook:

1. En Graph API Explorer, ejecutá:
   ```
   GET /{FB_PAGE_ID}?fields=instagram_business_account
   ```
2. El `id` que aparece bajo `instagram_business_account` es tu `IG_ACCOUNT_ID`

> ⚠️ **Requisitos para publicar en Instagram:**
> - Cuenta de Instagram debe ser tipo "Business" o "Creator"
> - Debe estar conectada a tu Página de Facebook
> - La imagen debe ser JPG o PNG, mínimo 320px

---

## ▶️ Cómo usar los scripts

### Script 1: Generar contenido

```bash
# Procesar UNA imagen aleatoria (modo semanal recomendado):
python generate.py

# Procesar una imagen específica:
python generate.py --image foto_entrada.jpg

# Procesar TODAS las imágenes de la carpeta:
python generate.py --all
```

**Qué genera:**
- `foto_square_v1_overlay.jpg` → Cuadrado 1080x1080 con overlay verde
- `foto_square_v2_banner.jpg` → Cuadrado 1080x1080 con banner inferior
- `foto_portrait_v1_overlay.jpg` → Retrato 1080x1350 con overlay verde
- `foto_portrait_v2_banner.jpg` → Retrato 1080x1350 con banner inferior
- `foto_copy.json` → Copy para Facebook e Instagram generado por Claude

---

### Script 2: Publicar

```bash
# Modo interactivo (te muestra las imágenes y elegís):
python publish.py

# Publicar una imagen específica:
python publish.py --image output/foto_v1.jpg --copy output/foto_copy.json

# Solo Facebook:
python publish.py --fb-only

# Solo Instagram:
python publish.py --ig-only

# Probar sin publicar de verdad:
python publish.py --dry-run

# Ver imágenes disponibles:
python publish.py --list
```

---

## 📅 Configurar ejecución semanal automática (los miércoles)

### En Windows — Programador de tareas

1. Abrí **Programador de tareas** (Task Scheduler)
2. **Crear tarea básica**
3. Nombre: "Camping Marketing Semanal"
4. Disparador: **Semanalmente** → Miércoles → 10:00 AM
5. Acción: **Iniciar un programa**
   - Programa: `python`
   - Argumentos: `C:\ruta\camping-marketing\generate.py`
   - Iniciar en: `C:\ruta\camping-marketing\`

### En Mac/Linux — Crontab

```bash
crontab -e
```

Agregá esta línea (ejecuta todos los miércoles a las 10am):
```
0 10 * * 3 cd /ruta/camping-marketing && python generate.py >> output/generate.log 2>&1
```

---

## ⚠️ Solución de problemas frecuentes

| Error | Causa | Solución |
|-------|-------|----------|
| `ANTHROPIC_API_KEY` inválido | Key incorrecta o vencida | Generá una nueva en console.anthropic.com |
| `OAuthException` en Facebook | Token expirado | Generá un nuevo Page Access Token |
| `PIL` no encontrado | No instalado | `pip install pillow` |
| Imagen muy pequeña | Foto de baja resolución | Usá fotos de al menos 800x800px |
| Instagram no publica | No es cuenta Business | Convertí la cuenta en Instagram Business |
| `JSONDecodeError` en copy | Claude devolvió texto libre | El script usa copy de respaldo automáticamente |

---

## 🔄 Renovar el token cada 60 días

Anotate en el calendario para renovar el Facebook Page Access Token cada 60 días.
El proceso es el mismo: Graph API Explorer → `/me/accounts` → copiar nuevo token → actualizar `.env`.

---

## 📞 Soporte

Scripts desarrollados por **SmartFlow Automations**
Para el **Camping Puerto Viejo Conchal**, Guanacaste, Costa Rica 🇨🇷
