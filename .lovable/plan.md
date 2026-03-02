
## Plan: Limpiar estado de reserva al salir o completar

### Problema
El estado de la reserva se guarda en `localStorage` y persiste entre sesiones. Si el usuario sale del proceso sin completar, los datos (como extras seleccionados) quedan guardados y aparecen en futuras reservas.

### Solucion

**Archivo: `src/pages/BookPage.tsx`**

1. Llamar `resetBooking()` cuando el usuario **navega fuera** de `/book` (usando un `useEffect` con cleanup).
2. Llamar `resetBooking()` cuando el componente se **monta** (para limpiar datos de sesiones anteriores).
3. Despues de completar la reserva, el `resetBooking` ya se llama en `BookingConfirmation` al hacer clic en "Volver al inicio", lo cual se mantiene.

### Cambios tecnicos

- En `BookPage.tsx`, agregar un `useEffect` que:
  - Al montar: llame `resetBooking()` para empezar siempre con estado limpio
  - Al desmontar (cuando el usuario navega fuera): llame `resetBooking()` para limpiar cualquier dato parcial

```typescript
useEffect(() => {
  resetBooking();
  return () => {
    resetBooking();
  };
}, [resetBooking]);
```

### Archivos a modificar
- `src/pages/BookPage.tsx` -- agregar useEffect para limpiar estado al entrar y salir
