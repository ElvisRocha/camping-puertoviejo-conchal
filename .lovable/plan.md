

## Plan: Migrar Testimonios al Comportamiento de dra-ekaterina-gine

### Resumen

Replicar el comportamiento funcional del carrusel de testimonios del proyecto dra-ekaterina-gine en camping-puertoviejo-conchal, manteniendo los estilos visuales actuales del proyecto. Reemplazar los 6 testimonios ficticios con los 12 reviews reales proporcionados, con soporte bilingue ES/EN.

---

### Comportamiento a replicar (de dra-ekaterina-gine)

1. **Carrusel infinito con clones** - Paginas clonadas al inicio y final para loop seamless (no usa embla-carousel, es custom con CSS transform)
2. **Auto-rotacion** cada 5 segundos, pausable al hacer hover
3. **Responsive items-per-view**: 3 en desktop (>=1024), 2 en tablet (>=768), 1 en mobile
4. **Truncado de texto** con boton "Leer mas" (200 chars desktop, 150 mobile)
5. **Modal de lectura completa** con navegacion prev/next, swipe en mobile, teclado (Escape, flechas), counter "X / 12"
6. **Dot indicators** clickeables que muestran la pagina actual
7. **Flechas de navegacion** prev/next en los lados
8. **Avatares con iniciales** en lugar de fotos (circulo con gradiente + iniciales del nombre)
9. **Swipe touch** en el carrusel y en el modal

---

### Cambios por archivo

#### 1. Nuevo archivo: `src/data/testimonials.ts`
- Crear el tipo `Testimonial` con campos: `id`, `name`, `textEs`, `textEn`, `rating`, `timeEs`, `timeEn`
- Exportar el array de 12 reviews proporcionados en el JSON

#### 2. Reescribir: `src/components/sections/TestimonialsSection.tsx`
- Eliminar el import de embla-carousel (ya no se usa)
- Implementar carrusel custom con CSS transform (como en dra-ekaterina-gine)
- Constantes: `DESKTOP_TRUNCATE = 200`, `MOBILE_TRUNCATE = 150`, `AUTO_ROTATE_MS = 5000`, `SWIPE_THRESHOLD = 50`, `CAROUSEL_TRANSITION_MS = 400`
- Funciones helper: `truncateText()`, `getItemsPerView()`
- Componente `TestimonialCard`: Quote icon, rating stars, texto truncado con "Leer mas", avatar con iniciales, nombre, tiempo relativo segun idioma
- Componente `TestimonialModal`: overlay, texto completo, navegacion prev/next con AnimatePresence, swipe, keyboard, counter
- Componente principal: carrusel con extended items (clones), auto-rotacion, dot indicators, flechas
- Usar `useTranslation()` de react-i18next (en vez de `useLanguage()` del otro proyecto)
- Para el idioma: detectar `i18n.language` y mostrar `textEs`/`textEn` y `timeEs`/`timeEn` segun corresponda
- Mantener los estilos/colores existentes del proyecto (bg-muted/30, text-primary, fill-yellow-400, etc.) -- NO copiar los colores coral/magenta del otro proyecto

#### 3. Actualizar: `src/locales/es.json` y `src/locales/en.json`
- Reemplazar la seccion `testimonials.reviews` completa (ya no se necesitan los 6 reviews ficticios con keys individuales)
- Mantener `testimonials.title`, `testimonials.subtitle`, `testimonials.ratingCount`
- Agregar nuevas claves:
  - `testimonials.readMore` ("Leer mas" / "Read more")
  - `testimonials.close` ("Cerrar" / "Close")
  - `testimonials.prev` ("Anterior" / "Previous")
  - `testimonials.next` ("Siguiente" / "Next")
  - `testimonials.goToSlide` ("Ir a pagina" / "Go to page")
- Eliminar `testimonials.reviews` por completo (los datos ahora viven en `testimonials.ts` directamente con campos bilingues)

#### 4. Actualizar otros locale files: `fr.json`, `de.json`, `zh.json`, `ru.json`
- Agregar las mismas claves nuevas (`readMore`, `close`, `prev`, `next`, `goToSlide`) traducidas
- Eliminar `testimonials.reviews`

---

### Detalles tecnicos

- El carrusel custom NO usa embla-carousel. Usa `translateX` con porcentajes calculados, `onTransitionEnd` para el loop infinito, y `requestAnimationFrame` para saltar sin animacion
- Los datos bilingues estan directamente en el data file (`textEs`/`textEn`), no en los JSON de i18n. Esto simplifica porque cada review tiene traduccion propia
- El idioma activo se obtiene con `const { i18n } = useTranslation()` y se usa `i18n.language.startsWith('es') ? textEs : textEn`
- El modal usa `framer-motion` `AnimatePresence` para las transiciones entre testimonios
- Se preserva `document.body.style.overflow = 'hidden'` cuando el modal esta abierto

