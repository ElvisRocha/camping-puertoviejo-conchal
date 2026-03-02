## Plan: Iniciar adultos en 0, agregar "años" y cambiar rango de ninos

### Cambios

**1. `src/store/bookingStore.ts` (linea 58)**

- Cambiar `adults: 2` a `adults: 0`

**2. `src/components/booking/Step2Guests.tsx**`

- Linea 14: Cambiar fallback `adults: 2` a `adults: 0`
- Linea 18: Cambiar minimo de adultos de `1` a `0` para permitir iniciar en 0

**3. Archivos de traducciones (es.json, en.json, fr.json, de.json, ru.json, zh.json)**

- Cambiar el texto de adultos para incluir "años": `"Adultos (18+ años)"` (y equivalentes en cada idioma)
- Cambiar el texto de ninos: `"Ninos (5-17 años)"` (antes era 4-17)
- Cambiar el texto de bebes: `"Bebes (0-4 años)"` (antes era 0-3, ajustado al nuevo rango)

### Validacion

- El boton "Siguiente" ya valida `totalGuests > 0`, asi que no se podra avanzar sin seleccionar al menos 1 huesped.