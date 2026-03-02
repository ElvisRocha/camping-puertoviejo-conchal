
## Fix: Centrar el stepper de booking

### Problema
Cada step wrapper tiene `flex-1`, incluido el ultimo paso. Como el ultimo paso no tiene linea conectora despues, ese `flex-1` crea espacio vacio a la derecha, descentrando visualmente el stepper.

### Solucion
En `src/components/booking/BookingProgress.tsx`, cambiar la clase del wrapper de cada step: el ultimo paso no debe tener `flex-1`, solo los que tienen linea conectora despues.

**Archivo**: `src/components/booking/BookingProgress.tsx` (linea 40)

Cambiar:
```tsx
<div key={step.number} className="flex items-center flex-1">
```

A:
```tsx
<div key={step.number} className={cn("flex items-center", index < totalSteps - 1 && "flex-1")}>
```

Esto hace que solo los steps con linea conectora ocupen espacio flexible, y el ultimo step solo ocupe su ancho natural, eliminando el espacio extra a la derecha.
