"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { RequireRole } from "@/src/components/auth";
import { BookingTable } from "@/src/components/booking";
import { PublicNav, UserLayout } from "@/src/components/navigation";
import {
  ButtonLink,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  buttonClass,
  inputClass,
} from "@/src/components/ui";
import { dummyAccounts } from "@/src/data/dummy";
import { useHarmoniStore, useSession } from "@/src/lib/store";
import {
  calculateBookingTotal,
  formatCurrency,
  formatDate,
  getDurationHours,
  getPaymentStatus,
  hasScheduleConflict,
} from "@/src/lib/utils";
import type { BookingStatus, PaymentMethod } from "@/src/types";

export function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [email, setEmail] = useState("user@harmoni.com");
  const [password, setPassword] = useState("user123");
  const [error, setError] = useState("");

  const submitLogin = () => {
    const session = login(email, password);
    if (!session) {
      setError("Email atau password dummy tidak sesuai.");
      return;
    }
    router.push(session.role === "admin" ? "/admin/dashboard" : "/dashboard");
  };

  const chooseAccount = (account: (typeof dummyAccounts)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <PublicNav />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
            Login dummy
          </p>
          <h1 className="mt-2 text-4xl font-black text-zinc-950">
            Masuk sebagai pelanggan atau admin.
          </h1>
          <p className="mt-4 leading-7 text-zinc-600">
            Autentikasi ini hanya simulasi. Session disimpan di `localStorage`
            agar role dan redirect bisa dipresentasikan.
          </p>
          <div className="mt-8 grid gap-3">
            {dummyAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => chooseAccount(account)}
                className="rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-sm hover:border-teal-300"
              >
                <p className="font-bold text-zinc-950">{account.nama}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {account.email} / {account.password}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase text-teal-700">
                  Role {account.role}
                </p>
              </button>
            ))}
          </div>
        </section>
        <section
          role="form"
          aria-labelledby="login-form-title"
          onKeyDown={(event) => {
            if (event.key === "Enter") submitLogin();
          }}
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <h2 id="login-form-title" className="text-2xl font-bold text-zinc-950">
            Form Login
          </h2>
          <label className="mt-6 block text-sm font-semibold text-zinc-700">
            Email
            <input
              className={`${inputClass} mt-2`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-zinc-700">
            Password
            <input
              type="password"
              className={`${inputClass} mt-2`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p> : null}
          <button
            type="button"
            onClick={submitLogin}
            className={`${buttonClass} mt-6 w-full`}
          >
            Masuk
          </button>
        </section>
      </main>
    </div>
  );
}

export function UserDashboardPage() {
  const { session } = useSession();
  const { state } = useHarmoniStore();
  const userBookings = state.pemesanan.filter(
    (booking) => booking.id_pelanggan === session?.id_pelanggan,
  );

  return (
    <RequireRole role="user">
      <UserLayout>
        <PageHeader
          eyebrow="Dashboard Pelanggan"
          title={`Halo, ${session?.nama ?? "Pelanggan"}`}
          description="Ringkasan booking dan status pembayaran milik akun pelanggan dummy."
          action={<ButtonLink href="/booking">Booking Baru</ButtonLink>}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total booking" value={userBookings.length} />
          <StatCard
            label="Pending"
            value={userBookings.filter((item) => item.status_booking === "Pending").length}
          />
          <StatCard
            label="Confirmed"
            value={
              userBookings.filter((item) => item.status_booking === "Confirmed").length
            }
          />
          <StatCard
            label="Canceled"
            value={
              userBookings.filter((item) => item.status_booking === "Canceled").length
            }
          />
        </div>
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-zinc-950">Booking terbaru</h2>
          {userBookings.length ? (
            <BookingTable state={state} bookings={userBookings.slice().reverse().slice(0, 5)} />
          ) : (
            <EmptyState>Belum ada booking.</EmptyState>
          )}
        </section>
      </UserLayout>
    </RequireRole>
  );
}

export function BookingFormPage() {
  const { session } = useSession();
  const { state, addBooking } = useHarmoniStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultStudio = searchParams.get("studio") ?? state.studios[0]?.id_studio ?? "";
  const [studioId, setStudioId] = useState(defaultStudio);
  const [date, setDate] = useState("2026-07-03");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("12:00");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  const selectedStudio = state.studios.find((studio) => studio.id_studio === studioId);
  const duration = getDurationHours(start, end);
  const selectedInstruments = state.alatMusik
    .map((instrument) => ({ instrument, jumlah: quantities[instrument.id_alat] ?? 0 }))
    .filter((item) => item.jumlah > 0);
  const total = selectedStudio
    ? calculateBookingTotal(selectedStudio.harga_per_jam, duration, selectedInstruments)
    : 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!session?.id_pelanggan) {
      router.push("/login");
      return;
    }
    if (!selectedStudio) return setError("Pilih studio terlebih dahulu.");
    if (duration <= 0) return setError("Jam selesai harus lebih besar dari jam mulai.");
    if (hasScheduleConflict(state.pemesanan, studioId, date, start, end)) {
      return setError("Slot waktu sudah dibooking");
    }

    const bookingId = addBooking(
      {
        id_pelanggan: session.id_pelanggan,
        id_studio: studioId,
        tanggal_sewa: date,
        jam_mulai: start,
        jam_selesai: end,
        total_biaya: total,
      },
      selectedInstruments.map((item) => ({
        id_alat: item.instrument.id_alat,
        jumlah: item.jumlah,
      })),
    );

    router.push(`/invoice/${bookingId}`);
  };

  return (
    <RequireRole role="user">
      <UserLayout>
        <PageHeader
          eyebrow="Booking"
          title="Buat booking studio"
          description="Total dihitung dari durasi studio ditambah alat tambahan yang dipilih."
        />
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <label className="block text-sm font-semibold text-zinc-700">
              Pilih Studio
              <select
                className={`${inputClass} mt-2`}
                value={studioId}
                onChange={(event) => setStudioId(event.target.value)}
              >
                {state.studios.map((studio) => (
                  <option key={studio.id_studio} value={studio.id_studio}>
                    {studio.nama_studio} - {formatCurrency(studio.harga_per_jam)}/jam
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-semibold text-zinc-700">
                Tanggal
                <input
                  type="date"
                  className={`${inputClass} mt-2`}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </label>
              <label className="block text-sm font-semibold text-zinc-700">
                Jam Mulai
                <input
                  type="time"
                  className={`${inputClass} mt-2`}
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
              </label>
              <label className="block text-sm font-semibold text-zinc-700">
                Jam Selesai
                <input
                  type="time"
                  className={`${inputClass} mt-2`}
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                />
              </label>
            </div>
            <h2 className="mt-6 text-lg font-bold text-zinc-950">Alat tambahan</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {state.alatMusik.map((instrument) => (
                <label
                  key={instrument.id_alat}
                  className="rounded-lg border border-zinc-200 p-4"
                >
                  <span className="block font-semibold text-zinc-950">
                    {instrument.nama_alat}
                  </span>
                  <span className="block text-sm text-zinc-500">
                    {formatCurrency(instrument.harga_sewa_per_jam)} / jam, stok{" "}
                    {instrument.stok}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={instrument.stok}
                    className={`${inputClass} mt-3`}
                    value={quantities[instrument.id_alat] ?? 0}
                    onChange={(event) =>
                      setQuantities((current) => ({
                        ...current,
                        [instrument.id_alat]: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            {error ? <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p> : null}
          </section>
          <aside className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-xl font-bold text-zinc-950">Ringkasan biaya</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Durasi</dt>
                <dd className="font-semibold text-zinc-950">{duration} jam</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Studio</dt>
                <dd className="font-semibold text-zinc-950">
                  {selectedStudio ? formatCurrency(selectedStudio.harga_per_jam) : "-"}
                </dd>
              </div>
              <div className="border-t border-zinc-200 pt-3 text-lg">
                <div className="flex justify-between">
                  <dt className="font-bold text-zinc-950">Total</dt>
                  <dd className="font-black text-zinc-950">{formatCurrency(total)}</dd>
                </div>
              </div>
            </dl>
            <button className={`${buttonClass} mt-6 w-full`}>Buat Booking</button>
          </aside>
        </form>
      </UserLayout>
    </RequireRole>
  );
}

function useBookingDetail() {
  const params = useParams<{ id?: string; bookingId?: string }>();
  const { state } = useHarmoniStore();
  const id = params.id ?? params.bookingId ?? "";
  const booking = state.pemesanan.find((item) => item.id_pemesanan === id);
  const studio = state.studios.find((item) => item.id_studio === booking?.id_studio);
  const customer = state.pelanggan.find(
    (item) => item.id_pelanggan === booking?.id_pelanggan,
  );
  const details = state.detailAlat
    .filter((detail) => detail.id_pemesanan === id)
    .map((detail) => ({
      ...detail,
      instrument: state.alatMusik.find((item) => item.id_alat === detail.id_alat),
    }));
  const payment = state.pembayaran.find((item) => item.id_pemesanan === id);

  return { state, id, booking, studio, customer, details, payment };
}

export function InvoicePage() {
  const { booking, studio, customer, details, payment } = useBookingDetail();

  return (
    <RequireRole role="user">
      <UserLayout>
        {!booking || !studio ? (
          <EmptyState>Invoice tidak ditemukan.</EmptyState>
        ) : (
          <InvoiceContent
            booking={booking}
            studioName={studio.nama_studio}
            customerName={customer?.nama ?? "-"}
            details={details}
            paymentStatus={payment?.status_pembayaran ?? "Belum Bayar"}
            paymentProof={payment?.bukti_pembayaran}
          />
        )}
      </UserLayout>
    </RequireRole>
  );
}

function InvoiceContent({
  booking,
  studioName,
  customerName,
  details,
  paymentStatus,
  paymentProof,
}: {
  booking: NonNullable<ReturnType<typeof useBookingDetail>["booking"]>;
  studioName: string;
  customerName: string;
  details: ReturnType<typeof useBookingDetail>["details"];
  paymentStatus: string;
  paymentProof?: string;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Invoice"
        title={`INV-${booking.id_pemesanan}`}
        action={
          paymentStatus === "Belum Bayar" || paymentStatus === "Ditolak" ? (
            <ButtonLink href={`/payment/${booking.id_pemesanan}`}>
              Upload Bukti Pembayaran
            </ButtonLink>
          ) : null
        }
      />
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Nama pelanggan" value={customerName} />
          <Info label="Studio" value={studioName} />
          <Info label="Tanggal" value={formatDate(booking.tanggal_sewa)} />
          <Info label="Jam" value={`${booking.jam_mulai} - ${booking.jam_selesai}`} />
          <Info
            label="Durasi"
            value={`${getDurationHours(booking.jam_mulai, booking.jam_selesai)} jam`}
          />
          <Info label="Total biaya" value={formatCurrency(booking.total_biaya)} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <StatusBadge status={booking.status_booking} />
          <StatusBadge status={paymentStatus} />
        </div>
        <h2 className="mt-6 font-bold text-zinc-950">Alat tambahan</h2>
        <div className="mt-2 text-sm text-zinc-600">
          {details.length
            ? details.map((detail) => (
                <p key={detail.id_detail}>
                  {detail.instrument?.nama_alat ?? "-"} x {detail.jumlah}
                </p>
              ))
            : "Tidak ada alat tambahan."}
        </div>
        {paymentProof ? (
          <p className="mt-4 text-sm text-zinc-600">Bukti pembayaran: {paymentProof}</p>
        ) : null}
        <div className="mt-6 rounded-lg bg-zinc-950 p-5 text-white">
          <p className="font-bold">Instruksi pembayaran</p>
          <p className="mt-2 text-sm text-zinc-300">
            Transfer ke Bank Dummy 123456789 a.n Harmoni Music Studio
          </p>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

export function PaymentPage() {
  const router = useRouter();
  const { booking, payment } = useBookingDetail();
  const { addPayment } = useHarmoniStore();
  const [method, setMethod] = useState<PaymentMethod>("Transfer Bank");
  const [amount, setAmount] = useState(booking?.total_biaya ?? 0);
  const [proof, setProof] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!booking) return;
    addPayment(booking.id_pemesanan, {
      metode_pembayaran: method,
      jumlah_bayar: amount,
      bukti_pembayaran: proof || "bukti-pembayaran-dummy.jpg",
    });
    router.push(`/my-bookings/${booking.id_pemesanan}`);
  };

  return (
    <RequireRole role="user">
      <UserLayout>
        {!booking ? (
          <EmptyState>Booking tidak ditemukan.</EmptyState>
        ) : (
          <form
            onSubmit={submit}
            className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h1 className="text-2xl font-bold text-zinc-950">Upload bukti pembayaran</h1>
            <p className="mt-2 text-sm text-zinc-500">INV-{booking.id_pemesanan}</p>
            {payment ? (
              <p className="mt-4 text-sm text-zinc-600">
                Status saat ini: <StatusBadge status={payment.status_pembayaran} />
              </p>
            ) : null}
            <label className="mt-6 block text-sm font-semibold text-zinc-700">
              Metode pembayaran
              <select
                className={`${inputClass} mt-2`}
                value={method}
                onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              >
                <option>Transfer Bank</option>
                <option>E-Wallet</option>
                <option>QRIS</option>
              </select>
            </label>
            <label className="mt-4 block text-sm font-semibold text-zinc-700">
              Jumlah bayar
              <input
                type="number"
                className={`${inputClass} mt-2`}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
            </label>
            <label className="mt-4 block text-sm font-semibold text-zinc-700">
              Upload file bukti bayar dummy
              <input
                type="file"
                className={`${inputClass} mt-2`}
                onChange={(event) =>
                  setProof(event.target.files?.[0]?.name ?? "bukti-pembayaran-dummy.jpg")
                }
              />
            </label>
            <button className={`${buttonClass} mt-6 w-full`}>
              Simpan Pembayaran
            </button>
          </form>
        )}
      </UserLayout>
    </RequireRole>
  );
}

export function MyBookingsPage() {
  const { session } = useSession();
  const { state, updateBookingStatus } = useHarmoniStore();
  const [filter, setFilter] = useState<"Semua" | BookingStatus>("Semua");
  const bookings = state.pemesanan.filter(
    (booking) =>
      booking.id_pelanggan === session?.id_pelanggan &&
      (filter === "Semua" || booking.status_booking === filter),
  );

  return (
    <RequireRole role="user">
      <UserLayout>
        <PageHeader eyebrow="Booking Saya" title="Daftar booking pelanggan" />
        <div className="mb-5 flex flex-wrap gap-2">
          {(["Semua", "Pending", "Confirmed", "Canceled"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                filter === item ? "bg-zinc-950 text-white" : "bg-white text-zinc-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid gap-4">
          {bookings.length ? (
            bookings.map((booking) => {
              const studio = state.studios.find(
                (item) => item.id_studio === booking.id_studio,
              );
              const paymentStatus = getPaymentStatus(state, booking.id_pemesanan);
              return (
                <article
                  key={booking.id_pemesanan}
                  className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-950">
                        INV-{booking.id_pemesanan} - {studio?.nama_studio}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        {formatDate(booking.tanggal_sewa)}, {booking.jam_mulai}-
                        {booking.jam_selesai}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge status={booking.status_booking} />
                        <StatusBadge status={paymentStatus} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ButtonLink href={`/my-bookings/${booking.id_pemesanan}`} variant="secondary">
                        Detail
                      </ButtonLink>
                      {paymentStatus === "Belum Bayar" || paymentStatus === "Ditolak" ? (
                        <ButtonLink href={`/payment/${booking.id_pemesanan}`}>
                          Bayar
                        </ButtonLink>
                      ) : null}
                      {booking.status_booking === "Pending" ? (
                        <button
                          className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                          onClick={() =>
                            updateBookingStatus(booking.id_pemesanan, "Canceled")
                          }
                        >
                          Batalkan
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <EmptyState>Tidak ada booking untuk filter ini.</EmptyState>
          )}
        </div>
      </UserLayout>
    </RequireRole>
  );
}

export function MyBookingDetailPage() {
  const { booking, studio, customer, details, payment } = useBookingDetail();

  return (
    <RequireRole role="user">
      <UserLayout>
        {!booking || !studio ? (
          <EmptyState>Booking tidak ditemukan.</EmptyState>
        ) : (
          <>
            <InvoiceContent
              booking={booking}
              studioName={studio.nama_studio}
              customerName={customer?.nama ?? "-"}
              details={details}
              paymentStatus={payment?.status_pembayaran ?? "Belum Bayar"}
              paymentProof={payment?.bukti_pembayaran}
            />
            {payment?.status_pembayaran === "Lunas" ? (
              <section className="mx-auto mt-6 max-w-4xl rounded-lg border border-emerald-200 bg-emerald-50 p-6">
                <h2 className="text-xl font-bold text-emerald-800">E-nota</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  Pembayaran sudah diverifikasi. Tunjukkan e-nota ini saat datang
                  ke Harmoni Music Studio.
                </p>
              </section>
            ) : null}
          </>
        )}
      </UserLayout>
    </RequireRole>
  );
}

export function UserBookingsSummary() {
  const { session } = useSession();
  const { state } = useHarmoniStore();
  const bookings = useMemo(
    () =>
      state.pemesanan.filter((booking) => booking.id_pelanggan === session?.id_pelanggan),
    [session?.id_pelanggan, state.pemesanan],
  );

  return <BookingTable state={state} bookings={bookings} />;
}
