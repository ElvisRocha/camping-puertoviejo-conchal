# Configuración de Secretos en Supabase

Para que las Edge Functions funcionen correctamente, debes configurar los siguientes secretos en Supabase Dashboard:

**Ubicación:** Settings > Edge Functions > Secrets

## Secretos Requeridos

### 1. MAPBOX_PUBLIC_TOKEN
- **Descripción:** Token público de Mapbox para mostrar mapas en la página de contacto
- **Valor:** [Obtener de Mapbox Dashboard en https://account.mapbox.com/]
- **Usado en:** `get-mapbox-token` Edge Function

### 2. SUPABASE_URL
- **Descripción:** URL del proyecto Supabase
- **Valor:** `https://yvmzzgphvfvaovlmmjsa.supabase.co`
- **Usado en:** `create-booking` Edge Function

### 3. SUPABASE_SERVICE_ROLE_KEY
- **Descripción:** Service Role Key para operaciones privilegiadas (bypasea RLS)
- **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bXp6Z3BodmZ2YW92bG1tanNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ3ODI0MSwiZXhwIjoyMDg0MDU0MjQxfQ.ytn-2906X6Oo2zIvJA2tTy9SBIawbCNyuzRVfbyMCOE`
- **Usado en:** `create-booking` Edge Function
- **⚠️ IMPORTANTE:** Nunca compartas este key públicamente. Solo debe usarse en el servidor.

### 4. SUPABASE_ANON_KEY
- **Descripción:** Anon Key para acceso público (opcional para Edge Functions)
- **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bXp6Z3BodmZ2YW92bG1tanNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzgyNDEsImV4cCI6MjA4NDA1NDI0MX0.PrHpkAE07XXiNLNoNQTxBxcmNSIjAj1t5fu13ibdjY4`
- **Usado en:** Cliente frontend (ya configurado en el código)

## Despliegue de Edge Functions

Una vez configurados los secretos, despliega las Edge Functions con los siguientes comandos:

```bash
# Desplegar Edge Function para crear reservas
supabase functions deploy create-booking

# Desplegar Edge Function para obtener token de Mapbox
supabase functions deploy get-mapbox-token
```

## Verificación

Para verificar que las Edge Functions están funcionando correctamente:

1. **Verificar que las funciones están desplegadas:**
   ```bash
   supabase functions list
   ```

2. **Probar la función create-booking:**
   - Ir a la página de reservas en tu aplicación
   - Intentar crear una reserva
   - Verificar que se crea correctamente sin errores de RLS

3. **Probar la función get-mapbox-token:**
   - Ir a la página de contacto
   - Verificar que el mapa de Mapbox se carga correctamente

## Estructura de Edge Functions

```
supabase/
└── functions/
    ├── create-booking/
    │   └── index.ts       # Crea reservas bypaseando RLS
    └── get-mapbox-token/
        └── index.ts       # Devuelve token de Mapbox de forma segura
```

## Notas Importantes

- Las Edge Functions usan Deno como runtime
- Los secretos configurados en Supabase Dashboard están disponibles vía `Deno.env.get('SECRET_NAME')`
- El Service Role Key permite a `create-booking` insertar datos sin restricciones de RLS
- Nunca expongas el Service Role Key en el código del cliente
- El token de Mapbox se obtiene vía Edge Function para evitar exponerlo en el código del cliente

## Recursos

- [Documentación de Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Configuración de Secretos](https://supabase.com/docs/guides/functions/secrets)
- [Mapbox Access Tokens](https://docs.mapbox.com/help/getting-started/access-tokens/)
