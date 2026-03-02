

## Plan: Agregar tag "Agotado" a las opciones de tiendas de alquiler

### Resumen

Agregar una etiqueta visual "Agotado" en la parte inferior izquierda de cada tarjeta de tienda de alquiler (Duo Acogedor, Explorador Familiar, Campamento Base). La opcion "Traigo mi propia tienda" NO se modifica. Las tiendas marcadas como agotadas tendran sus controles (+/-) deshabilitados y una opacidad reducida.

---

### Cambios

#### 1. `src/components/booking/Step2Guests.tsx`

- Dentro del bloque de cada tienda de alquiler (lineas 120-169), agregar un tag `<span>` debajo de los controles +/- con:
  - Texto: `t('booking.step2.soldOut')` (traducido)
  - Clases: `bg-gray-200 text-gray-500 text-xs font-medium px-3 py-1 rounded-full`
  - Posicion: debajo de los botones +/-, alineado a la izquierda
- Deshabilitar los botones + y - de cada tienda (ambos `disabled={true}`)
- Agregar `opacity-60 pointer-events-none` al contenedor de cada tienda para dar efecto visual de no disponible
- No afectar la opcion "Traigo mi propia tienda"

#### 2. Archivos de idiomas (6 archivos)

Agregar clave `booking.step2.soldOut`:
- `es.json`: `"Agotado"`
- `en.json`: `"Sold out"`
- `fr.json`: `"Epuise"`
- `de.json`: `"Ausverkauft"`
- `zh.json`: `"已售罄"`
- `ru.json`: `"Распродано"`

---

### Detalle tecnico

- Se usa una variable `isSoldOut = true` (hardcodeada por ahora) para todas las tiendas. En el futuro se puede conectar a disponibilidad real desde la base de datos.
- Los botones +/- se deshabilitan cuando `isSoldOut` es true, evitando que el usuario agregue tiendas no disponibles.
- El tag se renderiza condicionalmente solo cuando `isSoldOut` es true.
