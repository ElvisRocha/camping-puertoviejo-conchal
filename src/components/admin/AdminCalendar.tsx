import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
  parseISO,
  differenceInDays,
  isWithinInterval,
  min,
  max,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, Loader2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  reference_code: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  infants: number;
  status: string;
  total: number;
  deposit_amount: number;
  balance_due: number;
  created_at: string;
  guest_info?: {
    full_name: string;
    email: string;
    phone: string;
    country: string;
    special_requests?: string;
    celebrating_occasion?: string;
    arrival_time?: string;
  } | null;
}

interface AdminCalendarProps {
  bookings: Booking[];
  onBookingUpdated: (bookingId: string, newStatus: string) => void;
  onOpenDetails: (booking: Booking) => void;
}

// Derive a payment tier from the booking figures — this drives block color
type PaymentTier = 'paid' | 'partial' | 'unpaid' | 'cancelled';

function getPaymentTier(booking: Booking): PaymentTier {
  if (booking.status === 'cancelled') return 'cancelled';
  const total = Number(booking.total);
  const deposit = Number(booking.deposit_amount);
  const pct = total > 0 ? deposit / total : 0;
  if (pct >= 1 || booking.status === 'completed') return 'paid';
  if (pct > 0) return 'partial';
  return 'unpaid';
}

function getBlockStyle(booking: Booking): string {
  const tier = getPaymentTier(booking);
  switch (tier) {
    case 'paid':
      return 'bg-green-600 hover:bg-green-700 text-white';
    case 'cancelled':
      return 'bg-red-400 hover:bg-red-500 text-white opacity-70 line-through';
    case 'partial':
    case 'unpaid':
    default:
      return 'bg-amber-500 hover:bg-amber-600 text-white';
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    confirmed: 'Confirmado',
    completed: 'Completado',
    pending: 'Pendiente',
    cancelled: 'Cancelado',
  };
  return labels[status] ?? status;
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/30';
    case 'completed':
      return 'bg-green-500/15 text-green-700 border-green-500/30';
    case 'pending':
      return 'bg-amber-400/15 text-amber-700 border-amber-400/30';
    case 'cancelled':
      return 'bg-red-500/15 text-red-700 border-red-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

// Assign lanes to avoid overlapping blocks in the same week row
function assignLanes(
  weekBookings: { booking: Booking; colStart: number; colEnd: number }[]
): { booking: Booking; colStart: number; colEnd: number; lane: number }[] {
  const result: { booking: Booking; colStart: number; colEnd: number; lane: number }[] = [];
  const lanes: { end: number }[][] = [];

  for (const item of weekBookings) {
    let placed = false;
    for (let l = 0; l < lanes.length; l++) {
      const lastInLane = lanes[l][lanes[l].length - 1];
      if (!lastInLane || lastInLane.end < item.colStart) {
        lanes[l].push({ end: item.colEnd });
        result.push({ ...item, lane: l });
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push([{ end: item.colEnd }]);
      result.push({ ...item, lane: lanes.length - 1 });
    }
  }

  return result;
}

// Generate all weeks for the calendar view of a given month
function getCalendarWeeks(month: Date): Date[][] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const weeks: Date[][] = [];
  let day = calStart;

  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  return weeks;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MAX_VISIBLE_LANES = 3;

export default function AdminCalendar({
  bookings,
  onBookingUpdated,
  onOpenDetails,
}: AdminCalendarProps) {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Show all bookings (including cancelled — they appear faded/strikethrough)
  const activeBookings = useMemo(() => bookings, [bookings]);

  const weeks = useMemo(() => getCalendarWeeks(currentMonth), [currentMonth]);

  // For each week, compute booking blocks with lane assignments
  const weeklyBookings = useMemo(() => {
    return weeks.map((week) => {
      const weekStart = week[0];
      const weekEnd = week[6];

      const overlapping = activeBookings
        .filter((b) => {
          const checkIn = parseISO(b.check_in);
          const checkOut = parseISO(b.check_out);
          // check_out day is inclusive (guest still present that day)
          return checkIn <= weekEnd && checkOut >= weekStart;
        })
        .map((b) => {
          const checkIn = parseISO(b.check_in);
          const checkOut = parseISO(b.check_out);
          // Treat check_out as inclusive: use checkOut+1 as exclusive boundary
          const blockStart = max([checkIn, weekStart]);
          const blockEnd = min([addDays(checkOut, 1), addDays(weekEnd, 1)]);
          const colStart = differenceInDays(blockStart, weekStart);
          const colEnd = differenceInDays(blockEnd, weekStart) - 1;
          return { booking: b, colStart, colEnd };
        })
        .sort((a, b) => {
          const aIn = parseISO(a.booking.check_in).getTime();
          const bIn = parseISO(b.booking.check_in).getTime();
          return aIn - bIn || (a.colEnd - a.colStart) - (b.colEnd - b.colStart);
        });

      return assignLanes(overlapping);
    });
  }, [weeks, activeBookings]);

  function prevMonth() {
    setCurrentMonth((m) => subMonths(m, 1));
  }

  function nextMonth() {
    setCurrentMonth((m) => addMonths(m, 1));
  }

  function goToday() {
    setCurrentMonth(new Date());
  }

  function handleBlockClick(booking: Booking) {
    setSelectedBooking(booking);
    setIsPopoverOpen(true);
  }

  function handleEditClick() {
    if (!selectedBooking) return;
    setIsPopoverOpen(false);
    onOpenDetails(selectedBooking);
  }

  function handleCancelClick() {
    setIsCancelConfirmOpen(true);
  }

  async function confirmCancel() {
    if (!selectedBooking) return;
    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      onBookingUpdated(selectedBooking.id, 'cancelled');
      toast({
        title: 'Reserva cancelada',
        description: `La reserva ${selectedBooking.reference_code} ha sido cancelada.`,
      });
      setIsCancelConfirmOpen(false);
      setIsPopoverOpen(false);
      setSelectedBooking(null);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cancelar la reserva. Intente de nuevo.',
      });
    } finally {
      setIsCancelling(false);
    }
  }

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: es });
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday} className="ml-1">
            Hoy
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-foreground">{capitalizedMonth}</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-500" />
            Pendiente / Parcial
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-green-600" />
            Pagado
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-400 opacity-70" />
            Cancelado
          </span>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold text-muted-foreground tracking-wide uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div>
        {weeks.map((week, weekIdx) => {
          const blocks = weeklyBookings[weekIdx];
          const maxLane = blocks.length > 0 ? Math.max(...blocks.map((b) => b.lane)) : -1;

          return (
            <div key={weekIdx} className="border-b last:border-b-0">
              {/* Day numbers row */}
              <div className="grid grid-cols-7">
                {week.map((day, dayIdx) => {
                  const inMonth = isSameMonth(day, currentMonth);
                  const todayClass = isToday(day);
                  return (
                    <div
                      key={dayIdx}
                      className={`min-h-[36px] px-2 pt-1 pb-0 border-r last:border-r-0 ${
                        inMonth ? '' : 'bg-muted/30'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${
                          todayClass
                            ? 'bg-primary text-primary-foreground font-bold'
                            : inMonth
                            ? 'text-foreground'
                            : 'text-muted-foreground/50'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Booking blocks */}
              {blocks.length > 0 && (
                <div className="relative px-0 pb-1" style={{ minHeight: `${Math.min(maxLane + 1, MAX_VISIBLE_LANES) * 26 + 4}px` }}>
                  {blocks.map(({ booking, colStart, colEnd, lane }) => {
                    if (lane >= MAX_VISIBLE_LANES) return null;
                    const span = colEnd - colStart + 1;
                    const guestName = booking.guest_info?.full_name ?? booking.reference_code;
                    const isStartInWeek = differenceInDays(parseISO(booking.check_in), week[0]) >= 0;
                    // check_out is inclusive — end is in this week if checkout day ≤ last day of week
                    const isEndInWeek = parseISO(booking.check_out) <= week[6];

                    // Margins: give 2px breathing room only on sides that have a rounded end
                    const leftMargin = isStartInWeek ? 2 : 0;
                    const rightMargin = isEndInWeek ? 2 : 0;

                    return (
                      <button
                        key={`${booking.id}-w${weekIdx}`}
                        onClick={() => handleBlockClick(booking)}
                        title={`${guestName} · ${format(parseISO(booking.check_in), 'dd/MM')} – ${format(parseISO(booking.check_out), 'dd/MM')}`}
                        style={{
                          position: 'absolute',
                          top: `${lane * 26 + 2}px`,
                          left: `calc(${(colStart / 7) * 100}% + ${leftMargin}px)`,
                          width: `calc(${(span / 7) * 100}% - ${leftMargin + rightMargin}px)`,
                          height: '22px',
                          zIndex: 10,
                        }}
                        className={`flex items-center px-2 text-xs font-medium truncate transition-colors cursor-pointer ${getBlockStyle(booking)} ${
                          isStartInWeek ? 'rounded-l-full' : 'rounded-l-none'
                        } ${isEndInWeek ? 'rounded-r-full' : 'rounded-r-none'}`}
                      >
                        <span className="truncate">{guestName}</span>
                      </button>
                    );
                  })}
                  {/* "+N more" overflow indicator */}
                  {blocks.filter((b) => b.lane >= MAX_VISIBLE_LANES).length > 0 && (() => {
                    // Group overflow by starting column to show "+N" in the right cell
                    const overflowByCol: Record<number, number> = {};
                    blocks
                      .filter((b) => b.lane >= MAX_VISIBLE_LANES)
                      .forEach(({ colStart }) => {
                        overflowByCol[colStart] = (overflowByCol[colStart] ?? 0) + 1;
                      });
                    return Object.entries(overflowByCol).map(([col, count]) => (
                      <span
                        key={`overflow-${col}`}
                        style={{
                          position: 'absolute',
                          top: `${MAX_VISIBLE_LANES * 26 + 2}px`,
                          left: `calc(${(Number(col) / 7) * 100}% + 4px)`,
                        }}
                        className="text-xs text-muted-foreground"
                      >
                        +{count} más
                      </span>
                    ));
                  })()}
                </div>
              )}

              {/* Spacer for weeks with no bookings */}
              {blocks.length === 0 && (
                <div className="h-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Booking Detail Popover */}
      <Dialog open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Reserva {selectedBooking?.reference_code}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getStatusBadgeClass(selectedBooking.status)}>
                  {getStatusLabel(selectedBooking.status)}
                </Badge>
                {selectedBooking.status !== 'cancelled' && (() => {
                  const total = Number(selectedBooking.total);
                  const deposit = Number(selectedBooking.deposit_amount);
                  const pct = total > 0 ? Math.round((deposit / total) * 100) : 0;
                  if (pct >= 100 || selectedBooking.status === 'completed') {
                    return (
                      <Badge className="bg-green-500/15 text-green-700 border-green-500/30">
                        Pagado al 100%
                      </Badge>
                    );
                  }
                  if (pct > 0) {
                    return (
                      <Badge className="bg-amber-400/15 text-amber-700 border-amber-400/30">
                        Pago parcial {pct}%
                      </Badge>
                    );
                  }
                  return (
                    <Badge variant="secondary">Sin pago</Badge>
                  );
                })()}
              </div>

              {/* Guest info */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Huésped</p>
                    <p className="font-medium">{selectedBooking.guest_info?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Correo</p>
                    <p className="font-medium truncate">{selectedBooking.guest_info?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Teléfono</p>
                    <p className="font-medium">{selectedBooking.guest_info?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">País</p>
                    <p className="font-medium">{selectedBooking.guest_info?.country || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Check-in</p>
                    <p className="font-medium">
                      {format(parseISO(selectedBooking.check_in + 'T12:00:00'), "d 'de' MMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Check-out</p>
                    <p className="font-medium">
                      {format(parseISO(selectedBooking.check_out + 'T12:00:00'), "d 'de' MMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Noches</p>
                    <p className="font-medium">
                      {differenceInDays(parseISO(selectedBooking.check_out), parseISO(selectedBooking.check_in))}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Huéspedes</p>
                    <p className="font-medium">
                      {selectedBooking.adults} adultos
                      {selectedBooking.children > 0 && `, ${selectedBooking.children} niños`}
                      {selectedBooking.infants > 0 && `, ${selectedBooking.infants} bebés`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:flex-row flex-col">
            <Button
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleCancelClick}
              disabled={selectedBooking?.status === 'cancelled'}
            >
              Cancelar reserva
            </Button>
            <Button
              className="flex-1 bg-forest hover:bg-forest-light text-white"
              onClick={handleEditClick}
            >
              Editar reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Cancelar reserva?</DialogTitle>
            <DialogDescription>
              Esta acción cancelará la reserva{' '}
              <span className="font-semibold text-foreground">
                {selectedBooking?.reference_code}
              </span>
              {' '}a nombre de{' '}
              <span className="font-semibold text-foreground">
                {selectedBooking?.guest_info?.full_name ?? 'N/A'}
              </span>
              . Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelConfirmOpen(false)}
              disabled={isCancelling}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={isCancelling}
            >
              {isCancelling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
