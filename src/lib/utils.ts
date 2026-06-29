import type {
  AlatMusik,
  BookingStatus,
  HarmoniState,
  PaymentStatus,
  Pemesanan,
} from "@/src/types";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const getDurationHours = (start: string, end: string) =>
  Math.max(0, (timeToMinutes(end) - timeToMinutes(start)) / 60);

export const hasScheduleConflict = (
  bookings: Pemesanan[],
  studioId: string,
  date: string,
  start: string,
  end: string,
  ignoredBookingId?: string,
) => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  return bookings.some((booking) => {
    if (booking.id_pemesanan === ignoredBookingId) return false;
    if (booking.id_studio !== studioId || booking.tanggal_sewa !== date) return false;
    if (!["Confirmed", "Pending"].includes(booking.status_booking)) return false;

    return (
      startMinutes < timeToMinutes(booking.jam_selesai) &&
      endMinutes > timeToMinutes(booking.jam_mulai)
    );
  });
};

export const calculateBookingTotal = (
  studioPrice: number,
  duration: number,
  selectedInstruments: Array<{ instrument: AlatMusik; jumlah: number }>,
) => {
  const instrumentTotal = selectedInstruments.reduce(
    (total, item) => total + item.instrument.harga_sewa_per_jam * item.jumlah,
    0,
  );

  return duration * studioPrice + duration * instrumentTotal;
};

export const getPaymentStatus = (state: HarmoniState, bookingId: string) =>
  state.pembayaran.find((payment) => payment.id_pemesanan === bookingId)
    ?.status_pembayaran ?? "Belum Bayar";

export const bookingStatusClass: Record<BookingStatus, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Canceled: "border-rose-200 bg-rose-50 text-rose-700",
};

export const paymentStatusClass: Record<PaymentStatus, string> = {
  "Belum Bayar": "border-zinc-200 bg-zinc-50 text-zinc-700",
  "Menunggu Verifikasi": "border-sky-200 bg-sky-50 text-sky-700",
  Lunas: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Ditolak: "border-rose-200 bg-rose-50 text-rose-700",
};

export const getPopularValue = (values: string[]) => {
  const counts = values.reduce<Record<string, number>>((memo, value) => {
    memo[value] = (memo[value] ?? 0) + 1;
    return memo;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
};

export const createId = (prefix: string, count: number) =>
  `${prefix}-${String(count + 1).padStart(3, "0")}`;
