

## Plan: Mostrar precios en dolares y colones (1$ = 500 colones)

### Enfoque

Crear una funcion helper `formatDualPrice(amount)` que devuelve `"$X / Y₡"` y usarla en todos los lugares donde se muestran precios. Ademas, actualizar las cadenas de texto estaticas en los archivos de idiomas.

---

### 1. Crear helper de formato dual de precios

**Archivo nuevo**: `src/lib/priceFormat.ts`

```typescript
const CRC_RATE = 500;

export function formatDualPrice(usd: number): string {
  const colones = Math.round(usd * CRC_RATE);
  return `$${usd.toFixed(2)} / ${colones.toLocaleString()}₡`;
}

export function formatDualPriceInt(usd: number): string {
  const colones = Math.round(usd * CRC_RATE);
  return `$${usd} / ${colones.toLocaleString()}₡`;
}
```

- `formatDualPrice` para totales con decimales (ej: `$56.50 / 28250₡`)
- `formatDualPriceInt` para precios unitarios enteros (ej: `$25 / 12500₡`)

---

### 2. Archivos a modificar

#### `src/components/sections/AccommodationsSection.tsx` (2 lugares)
- **Linea 42**: Precio "bring your own" -- ya viene de traduccion, se actualiza en locales
- **Linea 102-105**: Precio por noche de cada tienda -- cambiar `${tent.pricePerNight}` a `formatDualPriceInt(tent.pricePerNight)`

#### `src/components/booking/Step1Dates.tsx` (1 lugar)
- **Linea 172**: Nota de precio -- viene de traduccion `booking.step1.priceNote`, actualizar en locales

#### `src/components/booking/Step2Guests.tsx` (2 lugares)
- **Linea 81**: Tarifa campsite `$PRICING.campsitePerPersonPerNight` -- usar `formatDualPriceInt`
- **Linea 143**: Precio por noche de tiendas `$tent.pricePerNight` -- usar `formatDualPriceInt`

#### `src/components/booking/Step3Addons.tsx` (1 lugar)
- **Lineas 16-27**: Funcion `getPriceLabel` -- cambiar a usar `formatDualPriceInt` con el addon.price

#### `src/components/booking/Step4Summary.tsx` (6 lugares)
- **Linea 234**: Campsite fee
- **Linea 239**: Tent rental
- **Linea 245**: Add-ons
- **Linea 250**: Subtotal
- **Linea 254**: Taxes
- **Linea 258**: Total
- Todos usan `$pricing.X.toFixed(2)` -- cambiar a `formatDualPrice(pricing.X)`

#### `src/components/booking/Step5Payment.tsx` (1 lugar)
- **Linea 81**: Total grande `$pricing.total.toFixed(2)` -- usar `formatDualPrice`

#### `src/components/booking/BookingConfirmation.tsx` (1 lugar)
- **Linea 101**: Total `$pricing.total.toFixed(2)` -- usar `formatDualPrice`

---

### 3. Actualizacion de cadenas en locales (6 archivos)

Actualizar las claves que contienen precios en texto estatico en `es.json`, `en.json`, `fr.json`, `de.json`, `zh.json`, `ru.json`:

- `accommodations.bringOwn.price`: Cambiar de `"From $25/night per person"` a `"From $25 / 12500₡ per night per person"` (y equivalentes en cada idioma)
- `booking.step1.priceNote`: Cambiar de `"$25/person/night base rate"` a `"$25 / 12500₡ per person/night base rate"` (y equivalentes)

---

### Resumen de archivos tocados

| Archivo | Cambio |
|---------|--------|
| `src/lib/priceFormat.ts` | Nuevo - funciones helper |
| `src/components/sections/AccommodationsSection.tsx` | Precios de tiendas |
| `src/components/booking/Step2Guests.tsx` | Tarifa campsite + tiendas |
| `src/components/booking/Step3Addons.tsx` | Precios de add-ons |
| `src/components/booking/Step4Summary.tsx` | Desglose de precios |
| `src/components/booking/Step5Payment.tsx` | Total de pago |
| `src/components/booking/BookingConfirmation.tsx` | Total en confirmacion |
| `src/locales/*.json` (x6) | Cadenas estaticas de precios |

