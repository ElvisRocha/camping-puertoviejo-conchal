

## Plan: Tildar la "o" en contextos de precios (₡ ó $)

### Problema
En todas las secciones donde se muestran precios duales (colones y dolares), la conjuncion "o" entre las cifras no tiene tilde. El usuario quiere que sea "o" con tilde: **ó**.

### Cambios

**1. `src/lib/priceFormat.ts` (lineas 5 y 10)**
- Cambiar `" o "` a `" ó "` en ambas funciones (`formatDualPrice` y `formatDualPriceInt`)
- Esto corrige automaticamente todos los precios generados dinamicamente en la app (tarjetas de tiendas, addons, resumen de reserva, pagos, etc.)

**2. Archivos de traducciones - textos estaticos con precios**
Cambiar `"o"` a `"ó"` en las cadenas que contienen precios en cada idioma:

- `src/locales/es.json`: "₡7,000 **ó** $14" (en `bringOwn.price` y `step1.priceNote`)
- `src/locales/en.json`: mismos campos
- `src/locales/fr.json`: mismos campos
- `src/locales/de.json`: mismos campos
- `src/locales/ru.json`: mismos campos
- `src/locales/zh.json`: mismos campos

### Alcance
- Funcion `formatDualPrice` y `formatDualPriceInt` cubren: tarjetas de alojamiento, addons, resumen de reserva (Step4), paso de pago (Step5)
- Los archivos de traduccion cubren: seccion de "Trae tu propia tienda" y nota de precio en Step1
