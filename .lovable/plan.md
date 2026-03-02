

## Plan: Cambiar valor inicial de adultos a 0

### Problema
El estado inicial de la reserva tiene `adults: 2` por defecto. El usuario quiere que siempre inicie en 0 para que el usuario elija cuantos adultos necesita.

### Cambios

**Archivo: `src/store/bookingStore.ts`**
- Cambiar `adults: 2` a `adults: 0` en el objeto `initialBooking` (linea ~56)

**Archivo: `src/components/booking/Step2Guests.tsx`**
- Cambiar el fallback `adults: 2` a `adults: 0` en la linea del guest default (linea ~15)
- Cambiar el minimo de adultos de `1` a `0` para permitir que el campo inicie en 0

### Validacion
- El boton "Siguiente" ya esta protegido con `canContinue = totalGuests > 0`, asi que el usuario no podra avanzar sin seleccionar al menos 1 huesped.

