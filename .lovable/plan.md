

## Plan: Corregir la pre-carga de datos al reagendar con código de referencia

### Problema raíz
Hay **dos problemas** que impiden que los datos se pre-carguen correctamente:

**1. RLS bloquea las consultas de datos relacionados**
La función `lookupBookingByReference` usa el RPC `get_booking_by_reference` (SECURITY DEFINER) para obtener la reserva principal — esto funciona. Pero luego hace consultas directas a `booking_tents`, `booking_addons` y `guest_info`, y estas tablas solo permiten SELECT a **admins**. Un usuario anónimo no puede leer esos datos, así que las consultas retornan vacío silenciosamente. Resultado: la reserva se encuentra pero sin tiendas, addons ni info del huésped.

**2. Serialización de fechas en localStorage**
Zustand persist serializa las fechas como strings. Cuando se rehidrata el store, `checkIn` y `checkOut` son strings en vez de objetos `Date`, lo que puede causar problemas en el calendario y en cálculos.

### Solución

**1. Crear una Edge Function `lookup-booking` que centralice toda la consulta** (alternativa preferida)
- Mover toda la lógica de `lookupBookingByReference` a una Edge Function que use el `service_role` key
- La Edge Function consulta `bookings`, `booking_tents`, `booking_addons` y `guest_info` sin restricciones de RLS
- Retorna todos los datos consolidados al cliente
- El cliente solo invoca `supabase.functions.invoke('lookup-booking', { body: { referenceCode } })`

**2. Actualizar `src/lib/bookingApi.ts`**
- Reemplazar la implementación actual de `lookupBookingByReference` para que llame a la nueva Edge Function en vez de hacer queries directas
- Parsear las fechas como `new Date()` al recibir la respuesta

**3. Crear `supabase/functions/lookup-booking/index.ts`**
- Recibe `referenceCode` en el body
- Usa `createClient` con `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS
- Busca en `bookings` por `reference_code`
- Consulta `booking_tents`, `booking_addons`, `guest_info` por `booking_id`
- Retorna el objeto consolidado con toda la info de la reserva

### Archivos a crear/modificar
- **Crear**: `supabase/functions/lookup-booking/index.ts`
- **Modificar**: `src/lib/bookingApi.ts` — simplificar `lookupBookingByReference` para usar la Edge Function

