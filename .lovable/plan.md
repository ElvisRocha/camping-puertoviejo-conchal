

## Plan: Inputs de fecha editables estilo Airbnb

### Resumen

Reemplazar los botones de LLEGADA/SALIDA actuales (que solo muestran texto) por inputs de texto editables con formato `DD/MM/YYYY`, permitiendo escritura manual de fechas, borrado individual con un boton X, y validacion en tiempo real. Mantener la interaccion con el calendario sincronizada.

---

### Comportamiento objetivo (como Airbnb)

1. **Inputs editables** - El usuario puede escribir una fecha manualmente en formato `DD/MM/YYYY`
2. **Placeholder con formato** - Cuando esta vacio, muestra `DD/MM/YYYY` como placeholder
3. **Boton X individual** - Cada input tiene un icono X para borrar solo esa fecha
4. **Borde activo** - El input seleccionado tiene borde destacado (forest)
5. **Validacion al escribir** - Solo acepta numeros y `/`, auto-formatea mientras se escribe (agrega `/` automaticamente despues de DD y MM)
6. **Validacion al confirmar** - Al hacer blur o presionar Enter, valida que la fecha sea real y no este en el pasado
7. **Sincronizacion bidireccional** - Escribir una fecha valida actualiza el calendario, y clickear en el calendario actualiza el input
8. **Click en input = focus** - Al clickear LLEGADA se activa selectionPhase checkIn, al clickear SALIDA se activa checkOut

---

### Cambios por archivo

#### 1. `src/components/booking/Step1Dates.tsx`

Reemplazar los dos `<button>` (lineas 70-119) por inputs de texto con la siguiente logica:

- **Nuevo estado**: `checkInText` y `checkOutText` (strings que representan lo que el usuario escribe)
- **Funcion `formatDateInput(value)`**: Auto-inserta `/` despues de posicion 2 y 5 (DD/MM/YYYY), filtra caracteres no numericos
- **Funcion `parseDateInput(text)`**: Convierte `DD/MM/YYYY` a objeto Date, retorna null si invalida
- **Funcion `validateAndApply(phase, text)`**: Al blur/Enter, parsea la fecha, valida que no sea pasada, valida que checkOut > checkIn, y llama a `setDates()`
- **Sincronizacion**: Cuando el usuario clickea en el calendario, tambien actualiza `checkInText`/`checkOutText` con la fecha formateada
- **Boton X**: Dentro de cada input wrapper, un icono X que borra esa fecha individual (si se borra checkIn, tambien se borra checkOut)
- **Layout**: Cada input sera un `<div>` con label arriba, `<input>` con placeholder `DD/MM/YYYY`, y boton X a la derecha

Estructura del input:
```
+---------------------------+
| LLEGADA              [X]  |
| DD/MM/YYYY                |
+---------------------------+
```

- El `<input>` tendra `maxLength={10}`, `inputMode="numeric"`, `pattern="[0-9/]*"`
- Al hacer focus en un input, se cambia `selectionPhase` automaticamente
- Se mantiene el boton "Borrar fechas" general abajo del calendario

#### 2. Locale files (todos)

Agregar clave:
- `booking.step1.datePlaceholder`: `"DD/MM/YYYY"`
- `booking.step1.invalidDate`: `"Fecha invalida"` (para mostrar error visual si la fecha escrita no es valida)

---

### Detalles tecnicos

- El auto-formato funciona asi: al escribir "19" automaticamente se convierte a "19/", al escribir "1903" se convierte a "19/03/", hasta llegar a "19/03/2026"
- Al borrar con backspace, se respeta la posicion del cursor y se eliminan los `/` automaticos
- La validacion usa `parse` de date-fns para convertir el string a Date con formato `dd/MM/yyyy`
- Si la fecha parseada es invalida o esta en el pasado, el input muestra un borde rojo momentaneo y revierte al valor anterior
- `useEffect` sincroniza `checkInText`/`checkOutText` cuando `booking.checkIn`/`booking.checkOut` cambian (por clicks en calendario)

