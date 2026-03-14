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

function getPaymentLabel(booking: Booking): string {
  if (booking.status === 'cancelled') return 'Cancelado';
  if (booking.status === 'completed' || Number(booking.balance_due) === 0) return 'Completado';
  if (booking.status === 'pending' && Number(booking.deposit_amount) > 0) return 'Pendiente';
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

  if (booking.status === 'completed' || Number(booking.balance_due) === 0) {
    return (
      <Badge className="bg-green-500/15 text-green-700 border-green-500/30 hover:bg-green-500/20">
        Completado
      </Badge>
    );
  }

  if (booking.status === 'pending' && Number(booking.deposit_amount) > 0) {
    return (
      <Badge className="bg-amber-400/15 text-amber-700 border-amber-400/30 hover:bg-amber-400/20">
        Pendiente
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
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
        });
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }

      setIsAdmin(true);
      fetchBookings();
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
        description: 'Failed to fetch bookings.',
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

    if (statusFilter === 'completado') {
      filtered = filtered.filter(
        (b) => b.status === 'completed' || Number(b.balance_due) === 0
      );
    } else if (statusFilter === 'pendiente') {
      filtered = filtered.filter(
        (b) => b.status === 'pending' && Number(b.deposit_amount) > 0
      );
    } else if (statusFilter === 'cancelado') {
      filtered = filtered.filter((b) => b.status === 'cancelled');
    }
    // 'all' and 'confirmado' show all bookings — no filter applied

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

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Booking status changed to ${newStatus}.`,
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update booking status.',
      });
    } finally {
      setIsUpdating(false);
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

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
      (b) => b.status === 'completed' || Number(b.balance_due) === 0
    ).length,
    partialPayment: filteredBookings.filter(
      (b) => b.status === 'pending' && Number(b.deposit_amount) > 0
    ).length,
    totalCollected: filteredBookings.reduce((sum, b) => sum + Number(b.deposit_amount), 0),
    totalReservas: filteredBookings.reduce((sum, b) => sum + Number(b.total), 0),
    totalPendiente: filteredBookings.reduce((sum, b) => sum + Number(b.balance_due), 0),
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
            Booking Dashboard
          </h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 border shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
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
              Refresh
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
              <p>No bookings found</p>
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
                            {format(new Date(booking.check_in), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(booking.check_out), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {fmt(booking.total)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {fmt(booking.deposit_amount)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-bold ${
                                balanceDue > 0 ? 'text-red-600' : 'text-green-600'
                              }`}
                            >
                              {fmt(booking.balance_due)}
                            </span>
                          </TableCell>
                          <TableCell>{getPaymentBadge(booking)}</TableCell>
                          <TableCell>
                            {Number(booking.balance_due) === 0 || booking.status === 'cancelled' ? (
                              <Badge className="bg-green-500/15 text-green-700 border-green-500/30 pointer-events-none">
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
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} of{' '}
                    {filteredBookings.length} bookings
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

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Booking Details - {selectedBooking?.reference_code}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Status Update */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Status:</span>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value) =>
                    handleStatusUpdate(selectedBooking.id, value)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>

              {/* Guest Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Guest Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{selectedBooking.guest_info?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedBooking.guest_info?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedBooking.guest_info?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>
                    <p className="font-medium">{selectedBooking.guest_info?.country || 'N/A'}</p>
                  </div>
                  {selectedBooking.guest_info?.arrival_time && (
                    <div>
                      <span className="text-muted-foreground">Arrival Time:</span>
                      <p className="font-medium">{selectedBooking.guest_info.arrival_time}</p>
                    </div>
                  )}
                  {selectedBooking.guest_info?.celebrating_occasion && (
                    <div>
                      <span className="text-muted-foreground">Celebrating:</span>
                      <p className="font-medium">{selectedBooking.guest_info.celebrating_occasion}</p>
                    </div>
                  )}
                </div>
                {selectedBooking.guest_info?.special_requests && (
                  <div className="mt-4">
                    <span className="text-muted-foreground text-sm">Special Requests:</span>
                    <p className="font-medium mt-1">{selectedBooking.guest_info.special_requests}</p>
                  </div>
                )}
              </div>

              {/* Booking Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Check-in:</span>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.check_in), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check-out:</span>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.check_out), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Adults:</span>
                    <p className="font-medium">{selectedBooking.adults}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Children:</span>
                    <p className="font-medium">{selectedBooking.children}</p>
                  </div>
                  {selectedBooking.infants > 0 && (
                    <div>
                      <span className="text-muted-foreground">Infants:</span>
                      <p className="font-medium">{selectedBooking.infants}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Resumen de Pago</h3>
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
