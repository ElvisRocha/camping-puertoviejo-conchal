

## Plan: Cambiar formato de precios y actualizar tarifa base

### Cambios requeridos

**1. Invertir orden de monedas en `src/lib/priceFormat.ts`**

Cambiar el formato de `$X / ₡Y` a `₡Y - $X`:

```typescript
// formatDualPrice: "₡28,250 - $56.50"
return `₡${colones.toLocaleString()} - $${usd.toFixed(2)}`;

// formatDualPriceInt: "₡7,000 - $14"
return `₡${colones.toLocaleString()} - $${usd}`;
```

**2. Cambiar tarifa base de $25 a $14 en `src/types/booking.ts`**

```typescript
campsitePerPersonPerNight: 14,  // antes 25
```

**3. Actualizar cadenas estaticas en los 6 archivos de idiomas**

Dos claves por idioma: `accommodations.bringOwn.price` y `booking.step1.priceNote`. Cambiar de `$25 / ₡12,500` a `₡7,000 - $14` y ajustar el orden moneda en cada idioma:

| Idioma | `bringOwn.price` | `priceNote` |
|--------|-----------------|-------------|
| es | `"Desde ₡7,000 - $14 por noche por persona"` | `"₡7,000 - $14 por persona/noche tarifa base"` |
| en | `"From ₡7,000 - $14 per night per person"` | `"₡7,000 - $14 per person/night base rate"` |
| fr | `"A partir de ₡7,000 - $14 par nuit par personne"` | `"₡7,000 - $14 par personne/nuit tarif de base"` |
| de | `"Ab ₡7,000 - $14 pro Nacht pro Person"` | `"₡7,000 - $14 pro Person/Nacht Grundpreis"` |
| zh | `"每人每晚 ₡7,000 - $14 起"` | `"₡7,000 - $14 每人每晚基础价"` |
| ru | `"От ₡7,000 - $14 за ночь на человека"` | `"₡7,000 - $14 чел/ночь базовая ставка"` |

### Archivos a modificar (9 total)

- `src/lib/priceFormat.ts` -- formato invertido
- `src/types/booking.ts` -- precio 25 a 14
- `src/locales/es.json`, `en.json`, `fr.json`, `de.json`, `zh.json`, `ru.json` -- cadenas estaticas
