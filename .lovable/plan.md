

## Plan: Selector de fechas estilo Airbnb

### Resumen

Reemplazar el calendario actual (react-day-picker basico) con un selector de fechas inspirado en Airbnb, manteniendo el look and feel del proyecto. Las mejoras clave son:

1. **Inputs de fecha visibles** - Campos "LLEGADA" y "SALIDA" arriba del calendario (como en la imagen de Airbnb) que muestran la fecha seleccionada y permiten saber cual campo se esta editando
2. **Seleccion en 2 pasos** - Primero click = check-in, segundo click = check-out (UX de Airbnb)
3. **Boton "Borrar fechas"** para resetear la seleccion
4. **1 mes en mobile, 2 meses en desktop** - Responsive
5. **Highlight visual del rango** con circulos en las fechas de inicio/fin y fondo suave en los dias intermedios
6. **Celdas mas grandes** - Dias de 40px para mejor usabilidad tactil

### No se cambia

- Colores (forest green, sand, cream)
- Tipografia
- Estructura de la pagina (titulo, subtitulo, precio, boton siguiente)
- La barra de resumen de fechas inferior

---

### Cambios por archivo

#### 1. `src/components/booking/Step1Dates.tsx`
- Agregar estado `selectionPhase`: "checkIn" | "checkOut" para trackear que fecha se esta seleccionando
- Agregar inputs de fecha "LLEGADA" / "SALIDA" arriba del calendario con labels traducidos
- El input activo tendra un borde highlight (border-forest)
- Click en un input cambia el selectionPhase
- Agregar boton "Borrar fechas" / "Clear dates" abajo del calendario
- Usar `useMediaQuery` o window width para mostrar 1 o 2 meses
- Logica de seleccion Airbnb:
  - Si selectionPhase es "checkIn": el click setea checkIn y cambia a "checkOut"
  - Si selectionPhase es "checkOut": si la fecha es posterior a checkIn, setea checkOut; si es anterior, resetea y empieza de nuevo como checkIn

#### 2. `src/components/ui/calendar.tsx`
- Aumentar tamano de celdas de `w-9 h-9` a `w-10 h-10` (40px) para mejor touch target
- Mejorar estilos del rango seleccionado: circulos llenos en start/end, fondo suave en middle
- Usar colores del proyecto (bg-forest para selected, bg-forest/10 para range middle)

#### 3. Locale files (`es.json`, `en.json`, `fr.json`, `de.json`, `zh.json`, `ru.json`)
- Agregar claves:
  - `booking.step1.checkIn`: "LLEGADA" / "CHECK-IN" / etc.
  - `booking.step1.checkOut`: "SALIDA" / "CHECK-OUT" / etc.
  - `booking.step1.clearDates`: "Borrar fechas" / "Clear dates" / etc.
  - `booking.step1.selectCheckIn`: "Selecciona llegada" / "Select check-in" / etc.
  - `booking.step1.selectCheckOut`: "Selecciona salida" / "Select check-out" / etc.

---

### Detalles tecnicos

- Se reutiliza el componente `Calendar` existente (react-day-picker) sin reemplazarlo -- solo se ajustan estilos y se mejora la logica de seleccion en Step1Dates
- La deteccion de mobile para numberOfMonths usa el hook `use-mobile` que ya existe en el proyecto
- El selectionPhase permite que al hacer click en el input de "LLEGADA" se pueda re-seleccionar la fecha de inicio sin perder contexto
- Se mantiene la validacion existente: no permitir fechas pasadas, minimo 1 noche

