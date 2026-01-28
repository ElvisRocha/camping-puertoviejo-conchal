# Camping Puerto Viejo Conchal

Sitio web oficial para Camping Puerto Viejo Conchal, un destino de camping frente al mar ubicado cerca de Playa Conchal en Guanacaste, Costa Rica.

## Descripción

Este proyecto es el sitio web del camping que permite a los visitantes:

- Conocer la experiencia de camping en la playa
- Ver la galería de fotos del lugar
- Reservar su estadía
- Contactar al camping para consultas

## Tecnologías

Este proyecto está construido con:

- **Vite** - Build tool y servidor de desarrollo
- **React** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes de UI
- **Framer Motion** - Animaciones
- **React Router** - Navegación
- **i18next** - Internacionalización (ES, EN, FR, DE)
- **Supabase** - Backend y base de datos

## Instalación

### Requisitos previos

- Node.js (v18 o superior)
- npm o yarn

### Pasos

```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# Navegar al directorio
cd camping-puertoviejo-conchal

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El sitio estará disponible en `http://localhost:8080`

## Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera la versión de producción
- `npm run preview` - Vista previa de la build de producción

## Estructura del proyecto

```
src/
├── assets/           # Imágenes y recursos estáticos
├── components/       # Componentes React reutilizables
│   ├── booking/      # Componentes del flujo de reservas
│   ├── contact/      # Formulario de contacto
│   ├── gallery/      # Galería de imágenes
│   ├── sections/     # Secciones de la página principal
│   └── ui/           # Componentes de UI base
├── data/             # Datos estáticos
├── hooks/            # Custom React hooks
├── i18n/             # Configuración de internacionalización
├── lib/              # Utilidades
├── locales/          # Archivos de traducción
├── pages/            # Páginas de la aplicación
├── store/            # Estado global
└── types/            # Definiciones de TypeScript
```

## Contacto

- **Sitio web:** [camping-puertoviejo-conchal.com](https://camping-puertoviejo-conchal.com)
- **Email:** info@camping-puertoviejo-conchal.com
- **Ubicación:** Puerto Viejo de Conchal, Guanacaste, Costa Rica
