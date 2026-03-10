

## Diagnóstico

El problema es claro: en producción, `bookingApi.ts` construye la URL de las Edge Functions usando `VITE_SUPABASE_URL`, que en el build de producción resuelve a `https://yvmzzgphvfvaovlmmjsa.supabase.co` (tu Supabase externo). Pero las Edge Functions **no están desplegadas ahí**, solo existen en Lovable Cloud. Tu Supabase externo no reconoce esas rutas y falla con CORS.

## Plan: Migrar Edge Functions a tu Supabase externo

### Cambios necesarios

**1. Adaptar las 4 Edge Functions para que usen las variables nativas de Supabase**

Actualmente las funciones usan `EXTERNAL_SUPABASE_URL` y `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` porque corrían en Lovable Cloud y necesitaban apuntar a tu proyecto externo. Cuando corran **dentro** de tu propio Supabase, deben usar las variables nativas `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` que Supabase provee automáticamente.

Funciones a modificar:
- `create-booking/index.ts`
- `lookup-booking/index.ts`
- `update-booking/index.ts`
- `cancel-booking/index.ts`

En cada una, cambiar:
```typescript
// Antes (apuntando a proyecto externo)
const supabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
const serviceRoleKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_ROLE_KEY');

// Después (variables nativas de Supabase)
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
```

**2. Actualizar `src/lib/bookingApi.ts` para apuntar a tu Supabase**

Cambiar las constantes de URL para que siempre apunten a tu proyecto externo:

```typescript
const API_URL = 'https://yvmzzgphvfvaovlmmjsa.supabase.co';
const API_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bXp6Z3BodmZ2YW92bG1tanNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzgyNDEsImV4cCI6MjA4NDA1NDI0MX0.PrHpkAE07XXiNLNoNQTxBxcmNSIjAj1t5fu13ibdjY4';
```

**3. Despliegue manual requerido**

Después de hacer estos cambios, tú necesitarás desplegar las Edge Functions en tu Supabase externo usando la CLI de Supabase:

```bash
supabase functions deploy create-booking --project-ref yvmzzgphvfvaovlmmjsa
supabase functions deploy lookup-booking --project-ref yvmzzgphvfvaovlmmjsa
supabase functions deploy update-booking --project-ref yvmzzgphvfvaovlmmjsa
supabase functions deploy cancel-booking --project-ref yvmzzgphvfvaovlmmjsa
```

### Archivos a modificar
- `supabase/functions/create-booking/index.ts` — cambiar env vars a nativas
- `supabase/functions/lookup-booking/index.ts` — cambiar env vars a nativas
- `supabase/functions/update-booking/index.ts` — cambiar env vars a nativas
- `supabase/functions/cancel-booking/index.ts` — cambiar env vars a nativas
- `src/lib/bookingApi.ts` — apuntar URL y anon key al proyecto externo

