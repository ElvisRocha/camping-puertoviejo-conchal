

## Plan: Corregir layout de tiendas en mobile

### Problema
En pantallas pequenas, la tarjeta de tienda usa un layout horizontal (imagen + contenido lado a lado) con el precio en la misma fila que el nombre. Esto causa que el precio se desborde del contenedor.

### Solucion

**Archivo: `src/components/booking/Step2Guests.tsx`** (lineas 130-146)

1. **Cambiar el layout de la tarjeta a vertical en mobile**: La imagen y el contenido se apilaran verticalmente en pantallas pequenas y se mantendran horizontales en pantallas grandes usando `flex-col sm:flex-row`.

2. **Mover el precio debajo del nombre en mobile**: En vez de poner nombre y precio en la misma fila con `justify-between`, el precio ira debajo del nombre en mobile y al lado en pantallas mas grandes, usando `flex-col sm:flex-row sm:justify-between`.

3. **Hacer la imagen responsiva**: Cambiar de tamano fijo `w-24 h-24` a `w-full h-40 sm:w-24 sm:h-24` para que en mobile ocupe todo el ancho.

### Cambios tecnicos

```text
Antes (linea 130):
  <div className="flex gap-4">
    <img className="w-24 h-24 ..."/>
    <div className="flex-1">
      <div className="flex items-start justify-between">
        <div>nombre</div>
        <p>precio</p>   <-- se desborda
      </div>

Despues:
  <div className="flex flex-col sm:flex-row gap-4">
    <img className="w-full h-40 sm:w-24 sm:h-24 ..."/>
    <div className="flex-1 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
        <div>nombre</div>
        <p className="text-left sm:text-right">precio</p>
      </div>
```

### Archivos a modificar
- `src/components/booking/Step2Guests.tsx` -- layout responsivo de tarjetas de tienda
