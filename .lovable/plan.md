

## Plan: Modify Cancel Booking Confirmation Buttons

Based on the screenshot, in the "confirm" step of `CancelBookingModal.tsx`:

1. **Replace "Volver" button** with "No, Reagendar reserva" — this button will close the cancel modal and open the reschedule modal instead.
2. **Add a back arrow button** in the top-right area (near the X close button) to go back to the lookup step.
3. **Update translations** in all 6 locale files for the new button label.

### Files to modify:
- `src/components/booking/CancelBookingModal.tsx` — Add back arrow icon button at top of confirm step, change "Volver" to "No, Reagendar reserva" which triggers opening the reschedule modal
- `src/components/Header.tsx` — May need to coordinate opening the RescheduleModal from CancelBookingModal (check how reschedule modal is triggered)
- `src/locales/es.json`, `en.json`, `fr.json`, `de.json`, `ru.json`, `zh.json` — Add/update the new button label

### Key detail:
- The "No, Reagendar reserva" button needs to close the cancel modal and open the reschedule modal. This requires passing an `onReschedule` callback prop from Header into CancelBookingModal.

