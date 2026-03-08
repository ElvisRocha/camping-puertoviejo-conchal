

## Diagnóstico

El problema es que la función `lookupBookingByReference` consulta la tabla `bookings` directamente (línea 46-50), pero la política RLS solo permite SELECT a administradores. Un usuario anónimo no puede leer la tabla, así que la consulta devuelve 0 filas y el error `PGRST116` ("Cannot coerce to single object"), que el código interpreta como "no encontrado".

Ya existe una función de base de datos `get_booking_by_reference` con `SECURITY DEFINER` que sí puede leer la tabla sin importar RLS. El código debería usarla.

## Cambios

**Archivo: `src/lib/bookingApi.ts` (líneas 45-50)**

Reemplazar la consulta directa a la tabla `bookings`:
```typescript
const { data: bookingRow, error: bookingError } = await supabase
  .from('bookings')
  .select('*')
  .eq('reference_code', trimmedCode)
  .single();
```

Por una llamada a la función RPC existente:
```typescript
const { data: rows, error: bookingError } = await supabase
  .rpc('get_booking_by_reference', { ref_code: trimmedCode });

const bookingRow = rows?.[0] ?? null;
```

Y ajustar la validación de error para manejar el caso de arreglo vacío en lugar de `PGRST116`:
- Si `bookingError` → error general
- Si `!bookingRow` (arreglo vacío) → not_found
- Si `bookingRow.status === 'cancelled'` → cancelled

Las consultas paralelas de `booking_tents`, `booking_addons` y `guest_info` también usan SELECT directo con RLS que solo permite admins. Hay que cambiarlas igualmente. Opciones:
1. Agregar políticas RLS permisivas de lectura en esas tablas (riesgo de exponer PII en `guest_info`)
2. Crear funciones SECURITY DEFINER adicionales para cada tabla
3. Usar la Edge Function `lookup-booking` que ya existe y usa service_role

Dado que ya existe una Edge Function `lookup-booking` diseñada para esto, lo más limpio es que `lookupBookingByReference` invoque esa Edge Function en lugar de hacer queries directas. Pero veo en los network requests que esa Edge Function falló con "Failed to fetch", así que primero verificaré su estado y luego decidiré el enfoque.

**Enfoque propuesto**: Usar `rpc('get_booking_by_reference')` para el booking principal, y agregar políticas RLS de lectura pública en `booking_tents` y `booking_addons` (no contienen PII). Para `guest_info` (contiene PII), crear una función SECURITY DEFINER similar.

### Cambios detallados:

**1. `src/lib/bookingApi.ts`**
- Líneas 45-50: Reemplazar query directa por `supabase.rpc('get_booking_by_reference', { ref_code: trimmedCode })`
- Líneas 52-57: Ajustar manejo de errores (ya no habrá PGRST116, sino arreglo vacío)
- Línea 71: Cambiar `guest_info` query por una función RPC nueva

**2. Migración SQL**: Crear función `get_guest_info_by_booking(booking_uuid uuid)` con SECURITY DEFINER para acceder a guest_info sin RLS. Agregar políticas SELECT públicas en `booking_tents` y `booking_addons` para permitir lectura por booking_id.

**3. Alternativa más simple**: Agregar políticas RLS de SELECT público en `booking_tents`, `booking_addons` y `guest_info` — pero esto expondría PII de guest_info a cualquier usuario que conozca un booking_id.

**Recomendación final**: Crear una sola función SECURITY DEFINER `get_booking_details_by_reference(ref_code text)` que retorne toda la info necesaria en un JSON, similar a lo que hace la Edge Function. Esto es más seguro y eficiente.

