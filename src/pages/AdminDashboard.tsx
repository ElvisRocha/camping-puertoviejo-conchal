import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  LogOut,
  Search,
  Calendar,
  CalendarDays,
  Users,
  DollarSign,
  Loader2,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  Receipt,
  Clock,
  Settings,
  Save,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminCalendar from '@/components/admin/AdminCalendar';

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
  } | null;
}

interface BookingWithGuest extends Booking {
  guest_info: {
    full_name: string;
    email: string;
    phone: string;
    country: string;
    special_requests?: string;
    celebrating_occasion?: string;
    arrival_time?: string;
  } | null;
}

const ITEMS_PER_PAGE = 10;

function fmt(value: number) {
  return `₡${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getCancellationCharge(booking: Booking): number {
  return Number(booking.total);
}

function getPaymentLabel(booking: Booking): string {
  if (booking.status === 'cancelled') return 'Cancelado';
  const total = Number(booking.total);
  const deposit = Number(booking.deposit_amount);
  const pct = total > 0 ? Math.round((deposit / total) * 100) : 0;
  if (pct >= 100) return 'Completado';
  if (pct >= 50 && pct <= 99) return `Depósito ${pct}%`;
  return 'Pendiente';
}

function getPaymentBadge(booking: Booking) {
  if (booking.status === 'cancelled') {
    return (
      <Badge className="bg-red-500/15 text-red-700 border-red-500/30 hover:bg-red-500/20">
        Cancelado
      </Badge>
    );
  }

  const total = Number(booking.total);
  const deposit = Number(booking.deposit_amount);
  const pct = total > 0 ? Math.round((deposit / total) * 100) : 0;

  if (pct >= 100 || booking.status === 'completed') {
    return (
      <Badge className="bg-green-500/15 text-green-700 border-green-500/30 hover:bg-green-500/20">
        Completado
      </Badge>
    );
  }

  if (booking.status === 'confirmed') {
    return (
      <Badge className="bg-blue-500/15 text-blue-700 border-blue-500/30 hover:bg-blue-500/20">
        Confirmado
      </Badge>
    );
  }

  if (pct >= 50 && pct <= 99) {
    return (
      <Badge className="bg-amber-400/15 text-amber-700 border-amber-400/30 hover:bg-amber-400/20">
        Depósito {pct}%
      </Badge>
    );
  }
  return null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithGuest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmPaymentBooking, setConfirmPaymentBooking] = useState<Booking | null>(null);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ bookingId: string; newStatus: string } | null>(null);

  // Settings state
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null);
  const [capacityUpdatedAt, setCapacityUpdatedAt] = useState<string | null>(null);
  const [capacityInput, setCapacityInput] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Check auth and admin status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) {
        toast({
          variant: 'destructive',
          title: 'Acceso denegado',
          description: 'No tienes privilegios de administrador.',
        });
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }

      setIsAdmin(true);
      fetchBookings();
      fetchSettings();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate('/auth');
        }
      }
    );

    checkAuth();

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const { data, error } = await supabase
        .from('camping_settings')
        .select('value, updated_at')
        .eq('key', 'max_capacity_persons')
        .single();

      if (error) throw error;

      const val = parseInt(data.value, 10);
      setMaxCapacity(val);
      setCapacityInput(String(val));
      setCapacityUpdatedAt(data.updated_at);
    } catch {
      // Table may not exist yet; leave fields empty
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    const parsed = parseInt(capacityInput, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 500) {
      toast({
        variant: 'destructive',
        title: 'Valor inválido',
        description: 'La capacidad debe ser un número entero entre 0 y 500.',
      });
      return;
    }

    setIsSavingSettings(true);
    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('camping_settings')
        .update({ value: String(parsed), updated_at: now })
        .eq('key', 'max_capacity_persons');

      if (error) throw error;

      setMaxCapacity(parsed);
      setCapacityUpdatedAt(now);
      toast({
        title: 'Configuración guardada',
        description: 'La capacidad máxima se ha actualizado correctamente.',
      });
    } catch (err: unknown) {
      console.error('[settings] save error:', err);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'No se pudo actualizar la configuración. Intente de nuevo.',
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          guest_info (
            full_name,
            email,
            phone,
            country
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las reservas.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter bookings
  useEffect(() => {
    let filtered = [...bookings];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.reference_code.toLowerCase().includes(query) ||
          b.guest_info?.full_name?.toLowerCase().includes(query) ||
          b.guest_info?.email?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => {
        switch (statusFilter) {
          case 'pending':
            return b.status !== 'cancelled' && Number(b.balance_due) > 0;
          case 'confirmed':
            return b.status === 'confirmed';
          case 'completed':
            return b.status === 'completed' || (Number(b.balance_due) === 0 && b.status !== 'cancelled');
          case 'cancelled':
            return b.status === 'cancelled';
          default:
            return true;
        }
      });
    }

    if (dateFrom) {
      filtered = filtered.filter((b) => b.created_at.slice(0, 10) >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter((b) => b.created_at.slice(0, 10) <= dateTo);
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFrom, dateTo, bookings]);

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  const requestStatusUpdate = (bookingId: string, newStatus: string) => {
    setPendingStatusChange({ bookingId, newStatus });
  };

  const confirmStatusUpdate = async () => {
    if (!pendingStatusChange) return;
    const { bookingId, newStatus } = pendingStatusChange;
    setPendingStatusChange(null);
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Estado actualizado',
        description: `El estado de la reserva cambió a ${statusLabels[newStatus] || newStatus}.`,
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }

      // Trigger n8n webhook for completed/cancelled status changes
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        try {
          const { data: bookingData } = await supabase
            .from('bookings')
            .select('reference_code, check_in, check_out, total, adults, children')
            .eq('id', bookingId)
            .single();

          const { data: guestData } = await supabase
            .from('guest_info')
            .select('full_name, email, phone')
            .eq('booking_id', bookingId)
            .single();

          if (bookingData && guestData) {
            const n8nBaseUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
            if (n8nBaseUrl) {
              const webhookPath = newStatus === 'completed' ? '/reserva-completada' : '/reserva-cancelada';
              fetch(`${n8nBaseUrl}${webhookPath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: guestData.email,
                  name: guestData.full_name,
                  phone: guestData.phone,
                  reference_code: bookingData.reference_code,
                  fecha_checkin: bookingData.check_in,
                  fecha_checkout: bookingData.check_out,
                  total: bookingData.total,
                }),
              }).catch((err) => console.error('n8n webhook error:', err));
            }
          }
        } catch (webhookError) {
          console.error('Error triggering n8n webhook:', webhookError);
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el estado de la reserva.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  const getStatusConfirmationMessage = (newStatus: string): { title: string; description: string } => {
    switch (newStatus) {
      case 'cancelled':
        return {
          title: 'Cancelar reserva',
          description: 'Esta acción cancelará la reserva y se le notificará al huésped por WhatsApp y correo electrónico sobre la cancelación y el reembolso de su depósito. ¿Estás seguro?',
        };
      case 'completed':
        return {
          title: 'Marcar como completada',
          description: 'Se marcará la reserva como completada y se le enviará al huésped un mensaje de agradecimiento por WhatsApp y correo electrónico con los enlaces para dejar una reseña. ¿Deseas continuar?',
        };
      case 'confirmed':
        return {
          title: 'Confirmar reserva',
          description: 'Se confirmará la reserva y el huésped será notificado. ¿Deseas cambiar el estado a Confirmado?',
        };
      case 'pending':
        return {
          title: 'Marcar como pendiente',
          description: 'La reserva volverá al estado Pendiente. ¿Estás seguro de que deseas revertir el estado?',
        };
      default:
        return {
          title: 'Cambiar estado',
          description: `¿Estás seguro de que deseas cambiar el estado a ${newStatus}?`,
        };
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!confirmPaymentBooking) return;
    setIsMarkingPaid(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          deposit_amount: confirmPaymentBooking.total,
          balance_due: 0,
        })
        .eq('id', confirmPaymentBooking.id);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === confirmPaymentBooking.id
            ? { ...b, deposit_amount: b.total, balance_due: 0 }
            : b
        )
      );

      toast({
        title: 'Pago actualizado',
        description: `Reserva ${confirmPaymentBooking.reference_code} marcada como completada.`,
      });

      setConfirmPaymentBooking(null);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el estado de pago.',
      });
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const viewBookingDetails = async (booking: Booking) => {
    const { data: guestData } = await supabase
      .from('guest_info')
      .select('*')
      .eq('booking_id', booking.id)
      .single();

    setSelectedBooking({
      ...booking,
      guest_info: guestData,
    });
    setIsDetailsOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      confirmed: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
      completed: 'outline',
    };

    const labels: Record<string, string> = {
      confirmed: 'Confirmado',
      pending: 'Pendiente',
      cancelled: 'Cancelado',
      completed: 'Completado',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] ?? status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats — computed from filteredBookings so they react to search/filter changes
  const stats = {
    total: filteredBookings.length,
    confirmed: filteredBookings.filter((b) => b.status === 'confirmed').length,
    paidFull: filteredBookings.filter(
      (b) => b.status === 'completed' || (Number(b.balance_due) === 0 && b.status !== 'cancelled')
    ).length,
    partialPayment: filteredBookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      const t = Number(b.total);
      const d = Number(b.deposit_amount);
      const ratio = t > 0 ? d / t : 0;
      return ratio >= 0.5 && ratio < 1.0;
    }).length,
    totalCollected: filteredBookings.reduce((sum, b) => {
      if (b.status === 'cancelled') return sum;
      return sum + Number(b.deposit_amount);
    }, 0),
    totalReservas: filteredBookings.reduce((sum, b) => {
      if (b.status === 'cancelled') return sum;
      return sum + Number(b.total);
    }, 0),
    totalPendiente: filteredBookings.reduce((sum, b) => {
      if (b.status === 'cancelled') return sum;
      return sum + Number(b.balance_due);
    }, 0),
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            Panel de Reservas
          </h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="reservas">
          <TabsList className="mb-6">
            <TabsTrigger value="reservas" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservas">
        {/* Stats Cards — Row 1: count cards (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-card rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total de Reservas</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-foreground">{stats.confirmed}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pagado al 100%</p>
                <p className="text-2xl font-bold text-foreground">{stats.paidFull}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-400/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pago Parcial</p>
                <p className="text-2xl font-bold text-foreground">{stats.partialPayment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards — Row 2: monetary totals (3 wider columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-400/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pendiente</p>
                <p className={`text-xl font-bold ${stats.totalPendiente === 0 ? 'text-green-600' : 'text-foreground'}`}>
                  {fmt(stats.totalPendiente)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Recaudado</p>
                <p className="text-xl font-bold text-foreground">
                  {fmt(stats.totalCollected)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-lg">
                <Receipt className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Reservas</p>
                <p className="text-xl font-bold text-foreground">
                  {fmt(stats.totalReservas)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 border shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por referencia, nombre o correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range (by creation date) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Creado desde</span>
                <Input
                  ref={dateFromRef}
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  onClick={() => dateFromRef.current?.showPicker()}
                  className="w-[145px] cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground whitespace-nowrap">hasta</span>
                <Input
                  ref={dateToRef}
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  onClick={() => dateToRef.current?.showPicker()}
                  className="w-[145px] cursor-pointer"
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={clearDateFilter} className="px-2">
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            <Button variant="outline" onClick={fetchBookings}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron reservas</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Huésped</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Depósito Pagado</TableHead>
                      <TableHead>Saldo Pendiente</TableHead>
                      <TableHead>Estado de Pago</TableHead>
                      <TableHead>Acciones de Pago</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookings.map((booking) => {
                      const balanceDue = Number(booking.balance_due);
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono font-medium">
                            {booking.reference_code}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {booking.guest_info?.full_name || 'N/A'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {booking.guest_info?.email || ''}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(booking.check_in + 'T12:00:00'), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(booking.check_out + 'T12:00:00'), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {fmt(booking.total)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {booking.status === 'cancelled' ? (
                              <span className="text-green-600">
                                {fmt(getCancellationCharge(booking))}
                                <span className="block text-xs text-muted-foreground font-normal">reembolso total</span>
                              </span>
                            ) : (
                              fmt(booking.deposit_amount)
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-bold ${
                                booking.status === 'cancelled' || balanceDue === 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {booking.status === 'cancelled' ? fmt(0) : fmt(booking.balance_due)}
                            </span>
                          </TableCell>
                          <TableCell>{getPaymentBadge(booking)}</TableCell>
                          <TableCell>
                            {Number(booking.balance_due) === 0 || booking.status === 'cancelled' ? (
                              <Badge className={booking.status === 'cancelled' ? 'bg-red-500/15 text-red-700 border-red-500/30 pointer-events-none' : 'bg-green-500/15 text-green-700 border-green-500/30 pointer-events-none'}>
                                {booking.status === 'cancelled' ? 'Cancelado' : 'Completado'}
                              </Badge>
                            ) : (
                              <Select
                                value="__current__"
                                onValueChange={(val) => {
                                  if (val === 'mark_complete') {
                                    setConfirmPaymentBooking(booking);
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 w-[155px] text-xs border-dashed">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__current__" disabled>
                                    {getPaymentLabel(booking)}
                                  </SelectItem>
                                  <SelectItem value="mark_complete">
                                    Marcar como Completado
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewBookingDetails(booking)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} al{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} de{' '}
                    {filteredBookings.length} reservas
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
          </TabsContent>

          <TabsContent value="calendario">
            <AdminCalendar
              bookings={bookings}
              onBookingUpdated={(bookingId, newStatus) => {
                setBookings((prev) =>
                  prev.map((b) =>
                    b.id === bookingId ? { ...b, status: newStatus } : b
                  )
                );
              }}
              onOpenDetails={(booking) => viewBookingDetails(booking)}
            />
          </TabsContent>

          <TabsContent value="configuracion">
            <div className="max-w-lg">
              <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Configuración del Camping</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ajusta los parámetros operativos del camping.
                  </p>
                </div>

                {isLoadingSettings ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Cargando configuración…</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="max-capacity" className="text-sm font-medium text-foreground">
                        Capacidad máxima de personas por noche
                      </label>
                      <div className="flex gap-3">
                        <Input
                          id="max-capacity"
                          type="number"
                          min={0}
                          max={500}
                          value={capacityInput}
                          onChange={(e) => setCapacityInput(e.target.value)}
                          placeholder="Ej. 25"
                          className="w-40"
                        />
                        <Button
                          onClick={handleSaveSettings}
                          disabled={isSavingSettings}
                          className="bg-forest hover:bg-forest-light text-white"
                        >
                          {isSavingSettings ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Guardar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Acepta valores enteros entre 0 y 500.
                      </p>
                    </div>

                    {capacityUpdatedAt && (
                      <p className="text-xs text-muted-foreground">
                        Última actualización:{' '}
                        {format(new Date(capacityUpdatedAt), "d 'de' MMMM yyyy, HH:mm")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirm Payment Dialog */}
      <Dialog
        open={!!confirmPaymentBooking}
        onOpenChange={(open) => { if (!open) setConfirmPaymentBooking(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar pago completo</DialogTitle>
            <DialogDescription>
              ¿Confirmar pago completo recibido en físico para la reserva{' '}
              <span className="font-semibold text-foreground">
                {confirmPaymentBooking?.reference_code}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmPaymentBooking(null)}
              disabled={isMarkingPaid}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleMarkAsCompleted}
              disabled={isMarkingPaid}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isMarkingPaid ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Status Change Dialog */}
      <Dialog
        open={!!pendingStatusChange}
        onOpenChange={(open) => { if (!open) setPendingStatusChange(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingStatusChange ? getStatusConfirmationMessage(pendingStatusChange.newStatus).title : ''}
            </DialogTitle>
            <DialogDescription>
              {pendingStatusChange ? getStatusConfirmationMessage(pendingStatusChange.newStatus).description : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPendingStatusChange(null)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmStatusUpdate}
              className={
                pendingStatusChange?.newStatus === 'cancelled'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : pendingStatusChange?.newStatus === 'completed'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : ''
              }
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalles de Reserva - {selectedBooking?.reference_code}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Status Update */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Estado:</span>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value) =>
                    requestStatusUpdate(selectedBooking.id, value)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>

              {/* Guest Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Información del Huésped</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nombre:</span>
                    <p className="font-medium">{selectedBooking.guest_info?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Correo:</span>
                    <p className="font-medium">{selectedBooking.guest_info?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Teléfono:</span>
                    <p className="font-medium">{selectedBooking.guest_info?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">País:</span>
                    <p className="font-medium">{selectedBooking.guest_info?.country || 'N/A'}</p>
                  </div>
                  {selectedBooking.guest_info?.arrival_time && (
                    <div>
                      <span className="text-muted-foreground">Hora de llegada:</span>
                      <p className="font-medium">{selectedBooking.guest_info.arrival_time}</p>
                    </div>
                  )}
                  {selectedBooking.guest_info?.celebrating_occasion && (
                    <div>
                      <span className="text-muted-foreground">Celebración:</span>
                      <p className="font-medium">{selectedBooking.guest_info.celebrating_occasion}</p>
                    </div>
                  )}
                </div>
                {selectedBooking.guest_info?.special_requests && (
                  <div className="mt-4">
                    <span className="text-muted-foreground text-sm">Solicitudes especiales:</span>
                    <p className="font-medium mt-1">{selectedBooking.guest_info.special_requests}</p>
                  </div>
                )}
              </div>

              {/* Booking Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Detalles de la Reserva</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Check-in:</span>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.check_in + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check-out:</span>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.check_out + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Adultos:</span>
                    <p className="font-medium">{selectedBooking.adults}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Niños:</span>
                    <p className="font-medium">{selectedBooking.children}</p>
                  </div>
                  {selectedBooking.infants > 0 && (
                    <div>
                      <span className="text-muted-foreground">Bebés:</span>
                      <p className="font-medium">{selectedBooking.infants}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Creado:</span>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Resumen de Pago</h3>
                {selectedBooking.status === 'cancelled' ? (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total</span>
                      <p className="font-bold text-lg">{fmt(selectedBooking.total)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reembolso Total (100%)</span>
                      <p className="font-bold text-lg text-green-600">{fmt(getCancellationCharge(selectedBooking))}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Saldo Pendiente</span>
                      <p className="font-bold text-lg text-green-600">{fmt(0)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total</span>
                      <p className="font-bold text-lg">{fmt(selectedBooking.total)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Depósito Pagado</span>
                      <p className="font-bold text-lg text-green-600">{fmt(selectedBooking.deposit_amount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Saldo Pendiente</span>
                      <p className={`font-bold text-lg ${Number(selectedBooking.balance_due) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {fmt(selectedBooking.balance_due)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
