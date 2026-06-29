"use client";

import { FormEvent, useState } from "react";
import { RequireRole } from "@/src/components/auth";
import { FeedbackModal, type FeedbackVariant } from "@/src/components/modal";
import { AdminLayout } from "@/src/components/navigation";
import {
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  buttonClass,
  inputClass,
} from "@/src/components/ui";
import { useHarmoniStore } from "@/src/lib/store";
import {
  formatCurrency,
  formatDate,
  getPopularValue,
} from "@/src/lib/utils";
import type {
  AlatMusik,
  BookingStatus,
  InstrumentStatus,
  Studio,
  StudioStatus,
} from "@/src/types";

type Notice = {
  title: string;
  message?: string;
  variant: FeedbackVariant;
};

function NoticeModal({
  notice,
  onClose,
}: {
  notice: Notice | null;
  onClose: () => void;
}) {
  return (
    <FeedbackModal
      open={Boolean(notice)}
      title={notice?.title ?? ""}
      message={notice?.message}
      variant={notice?.variant ?? "info"}
      onClose={onClose}
    />
  );
}

export function AdminDashboardPage() {
  const { state } = useHarmoniStore();
  const today = "2026-06-29";
  const waitingPayments = state.pembayaran.filter(
    (payment) => payment.status_pembayaran === "Menunggu Verifikasi",
  );
  const paidPayments = state.pembayaran.filter(
    (payment) => payment.status_pembayaran === "Lunas",
  );

  return (
    <RequireRole role="admin">
      <AdminLayout>
        <PageHeader
          eyebrow="Admin"
          title="Dashboard"
          description="Ringkasan operasional studio, booking, pembayaran, dan pendapatan dummy."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total studio" value={state.studios.length} />
          <StatCard label="Total alat musik" value={state.alatMusik.length} />
          <StatCard
            label="Booking hari ini"
            value={state.pemesanan.filter((item) => item.tanggal_sewa === today).length}
            helper={formatDate(today)}
          />
          <StatCard
            label="Booking pending"
            value={
              state.pemesanan.filter((item) => item.status_booking === "Pending").length
            }
          />
          <StatCard
            label="Pembayaran menunggu"
            value={waitingPayments.length}
          />
          <StatCard
            label="Pendapatan lunas"
            value={formatCurrency(
              paidPayments.reduce((total, payment) => total + payment.jumlah_bayar, 0),
            )}
          />
        </div>
        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {state.studios.map((studio) => (
            <div
              key={studio.id_studio}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <p className="font-bold text-zinc-950">{studio.nama_studio}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {
                  state.pemesanan.filter(
                    (booking) => booking.id_studio === studio.id_studio,
                  ).length
                }{" "}
                booking tercatat
              </p>
            </div>
          ))}
        </section>
      </AdminLayout>
    </RequireRole>
  );
}

export function AdminStudiosPage() {
  const { state, addStudio, updateStudio, deleteStudio } = useHarmoniStore();
  const blank: Studio = {
    id_studio: "",
    nama_studio: "",
    harga_per_jam: 100000,
    fasilitas: [],
    kapasitas: 5,
    deskripsi: "",
    status: "Tersedia",
  };
  const [form, setForm] = useState<Studio>(blank);
  const [notice, setNotice] = useState<Notice | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.nama_studio.trim()) {
      setNotice({
        title: "Studio gagal disimpan",
        message: "Nama studio wajib diisi.",
        variant: "error",
      });
      return;
    }
    const payload = {
      ...form,
      fasilitas:
        typeof form.fasilitas === "string"
          ? String(form.fasilitas).split(",").map((item) => item.trim())
          : form.fasilitas,
    };
    if (form.id_studio) {
      updateStudio(payload);
      setNotice({
        title: "Studio diperbarui",
        message: `${payload.nama_studio} berhasil disimpan.`,
        variant: "success",
      });
    } else {
      addStudio(payload);
      setNotice({
        title: "Studio ditambahkan",
        message: `${payload.nama_studio} berhasil masuk ke daftar studio.`,
        variant: "success",
      });
    }
    setForm(blank);
  };

  return (
    <RequireRole role="admin">
      <AdminLayout>
        <PageHeader eyebrow="CRUD" title="Kelola Studio" />
        <CrudShell
          form={
            <form onSubmit={submit} className="grid gap-3">
              <Input label="Nama studio" value={form.nama_studio} onChange={(value) => setForm({ ...form, nama_studio: value })} />
              <Input label="Harga per jam" type="number" value={form.harga_per_jam} onChange={(value) => setForm({ ...form, harga_per_jam: Number(value) })} />
              <Input label="Kapasitas" type="number" value={form.kapasitas} onChange={(value) => setForm({ ...form, kapasitas: Number(value) })} />
              <Input label="Fasilitas, pisahkan koma" value={form.fasilitas.join(", ")} onChange={(value) => setForm({ ...form, fasilitas: value.split(",").map((item) => item.trim()) })} />
              <label className="text-sm font-semibold text-zinc-700">
                Status
                <select className={`${inputClass} mt-1`} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as StudioStatus })}>
                  <option>Tersedia</option>
                  <option>Maintenance</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-zinc-700">
                Deskripsi
                <textarea className={`${inputClass} mt-1 min-h-24`} value={form.deskripsi} onChange={(event) => setForm({ ...form, deskripsi: event.target.value })} />
              </label>
              <button className={buttonClass}>{form.id_studio ? "Simpan Studio" : "Tambah Studio"}</button>
            </form>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Kapasitas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {state.studios.map((studio) => (
                  <tr key={studio.id_studio}>
                    <td className="px-4 py-3 font-semibold">{studio.id_studio}</td>
                    <td className="px-4 py-3">{studio.nama_studio}</td>
                    <td className="px-4 py-3">{formatCurrency(studio.harga_per_jam)}</td>
                    <td className="px-4 py-3">{studio.kapasitas}</td>
                    <td className="px-4 py-3"><StatusBadge status={studio.status} /></td>
                    <td className="px-4 py-3">
                      <button className="mr-3 font-semibold text-teal-700" onClick={() => setForm(studio)}>Edit</button>
                      <button className="font-semibold text-rose-700" onClick={() => {
                        deleteStudio(studio.id_studio);
                        setNotice({
                          title: "Studio dihapus",
                          message: `${studio.nama_studio} dihapus dari dummy data.`,
                          variant: "success",
                        });
                      }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CrudShell>
        <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      </AdminLayout>
    </RequireRole>
  );
}

export function AdminInstrumentsPage() {
  const { state, addInstrument, updateInstrument, deleteInstrument } = useHarmoniStore();
  const blank: AlatMusik = {
    id_alat: "",
    nama_alat: "",
    harga_sewa_per_jam: 25000,
    stok: 1,
    status: "Tersedia",
  };
  const [form, setForm] = useState<AlatMusik>(blank);
  const [notice, setNotice] = useState<Notice | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.nama_alat.trim()) {
      setNotice({
        title: "Alat gagal disimpan",
        message: "Nama alat musik wajib diisi.",
        variant: "error",
      });
      return;
    }
    if (form.id_alat) {
      updateInstrument(form);
      setNotice({
        title: "Alat musik diperbarui",
        message: `${form.nama_alat} berhasil disimpan.`,
        variant: "success",
      });
    } else {
      addInstrument(form);
      setNotice({
        title: "Alat musik ditambahkan",
        message: `${form.nama_alat} berhasil masuk ke daftar alat.`,
        variant: "success",
      });
    }
    setForm(blank);
  };

  return (
    <RequireRole role="admin">
      <AdminLayout>
        <PageHeader eyebrow="CRUD" title="Kelola Alat Musik" />
        <CrudShell
          form={
            <form onSubmit={submit} className="grid gap-3">
              <Input label="Nama alat" value={form.nama_alat} onChange={(value) => setForm({ ...form, nama_alat: value })} />
              <Input label="Harga sewa per jam" type="number" value={form.harga_sewa_per_jam} onChange={(value) => setForm({ ...form, harga_sewa_per_jam: Number(value) })} />
              <Input label="Stok" type="number" value={form.stok} onChange={(value) => setForm({ ...form, stok: Number(value) })} />
              <label className="text-sm font-semibold text-zinc-700">
                Status
                <select className={`${inputClass} mt-1`} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as InstrumentStatus })}>
                  <option>Tersedia</option>
                  <option>Tidak Tersedia</option>
                </select>
              </label>
              <button className={buttonClass}>{form.id_alat ? "Simpan Alat" : "Tambah Alat"}</button>
            </form>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {state.alatMusik.map((instrument) => (
                  <tr key={instrument.id_alat}>
                    <td className="px-4 py-3 font-semibold">{instrument.id_alat}</td>
                    <td className="px-4 py-3">{instrument.nama_alat}</td>
                    <td className="px-4 py-3">{formatCurrency(instrument.harga_sewa_per_jam)}</td>
                    <td className="px-4 py-3">{instrument.stok}</td>
                    <td className="px-4 py-3"><StatusBadge status={instrument.status} /></td>
                    <td className="px-4 py-3">
                      <button className="mr-3 font-semibold text-teal-700" onClick={() => setForm(instrument)}>Edit</button>
                      <button className="font-semibold text-rose-700" onClick={() => {
                        deleteInstrument(instrument.id_alat);
                        setNotice({
                          title: "Alat musik dihapus",
                          message: `${instrument.nama_alat} dihapus dari dummy data.`,
                          variant: "success",
                        });
                      }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CrudShell>
        <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      </AdminLayout>
    </RequireRole>
  );
}

export function AdminBookingsPage() {
  const { state, updateBookingStatus } = useHarmoniStore();
  const [filter, setFilter] = useState<"Semua" | BookingStatus>("Semua");
  const [notice, setNotice] = useState<Notice | null>(null);
  const bookings = state.pemesanan.filter(
    (booking) => filter === "Semua" || booking.status_booking === filter,
  );

  return (
    <RequireRole role="admin">
      <AdminLayout>
        <PageHeader eyebrow="Data Pemesanan" title="Kelola Booking" />
        <FilterTabs
          value={filter}
          values={["Semua", "Pending", "Confirmed", "Canceled"]}
          onChange={(value) => setFilter(value as "Semua" | BookingStatus)}
        />
        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3">Studio</th>
                  <th className="px-4 py-3">Jadwal</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {bookings.map((booking) => {
                  const studio = state.studios.find((item) => item.id_studio === booking.id_studio);
                  const customer = state.pelanggan.find((item) => item.id_pelanggan === booking.id_pelanggan);
                  return (
                    <tr key={booking.id_pemesanan}>
                      <td className="px-4 py-3 font-semibold">{booking.id_pemesanan}</td>
                      <td className="px-4 py-3">{customer?.nama ?? "-"}</td>
                      <td className="px-4 py-3">{studio?.nama_studio ?? "-"}</td>
                      <td className="px-4 py-3">{formatDate(booking.tanggal_sewa)}, {booking.jam_mulai}-{booking.jam_selesai}</td>
                      <td className="px-4 py-3">{formatCurrency(booking.total_biaya)}</td>
                      <td className="px-4 py-3"><StatusBadge status={booking.status_booking} /></td>
                      <td className="px-4 py-3">
                        <select className={inputClass} value={booking.status_booking} onChange={(event) => {
                          const status = event.target.value as BookingStatus;
                          updateBookingStatus(booking.id_pemesanan, status);
                          setNotice({
                            title: "Status booking diperbarui",
                            message: `${booking.id_pemesanan} sekarang berstatus ${status}.`,
                            variant: "success",
                          });
                        }}>
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Canceled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      </AdminLayout>
    </RequireRole>
  );
}

export function AdminPaymentsPage() {
  const { state, updatePaymentStatus } = useHarmoniStore();
  const [notice, setNotice] = useState<Notice | null>(null);
  const payments = state.pembayaran.slice().sort((a, b) =>
    a.status_pembayaran === "Menunggu Verifikasi" ? -1 : b.status_pembayaran === "Menunggu Verifikasi" ? 1 : 0,
  );

  return (
    <RequireRole role="admin">
      <AdminLayout>
        <PageHeader eyebrow="Pembayaran" title="Verifikasi Pembayaran" />
        <div className="grid gap-4">
          {payments.length ? payments.map((payment) => {
            const booking = state.pemesanan.find((item) => item.id_pemesanan === payment.id_pemesanan);
            const customer = state.pelanggan.find((item) => item.id_pelanggan === booking?.id_pelanggan);
            return (
              <article key={payment.id_pembayaran} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-950">{payment.id_pembayaran} - INV-{payment.id_pemesanan}</h2>
                    <p className="mt-1 text-sm text-zinc-500">{customer?.nama ?? "-"} membayar {formatCurrency(payment.jumlah_bayar)} via {payment.metode_pembayaran}</p>
                    <p className="mt-1 text-sm text-zinc-500">Bukti: {payment.bukti_pembayaran}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge status={payment.status_pembayaran} />
                      {booking ? <StatusBadge status={booking.status_booking} /> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className={buttonClass} onClick={() => {
                      updatePaymentStatus(payment.id_pembayaran, "Lunas");
                      setNotice({
                        title: "Pembayaran diverifikasi",
                        message: `${payment.id_pembayaran} menjadi Lunas dan booking terkait menjadi Confirmed.`,
                        variant: "success",
                      });
                    }}>Verifikasi</button>
                    <button className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50" onClick={() => {
                      updatePaymentStatus(payment.id_pembayaran, "Ditolak");
                      setNotice({
                        title: "Pembayaran ditolak",
                        message: `${payment.id_pembayaran} menjadi Ditolak. Status booking tetap Pending.`,
                        variant: "warning",
                      });
                    }}>Tolak</button>
                  </div>
                </div>
              </article>
            );
          }) : <EmptyState>Belum ada pembayaran.</EmptyState>}
        </div>
        <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      </AdminLayout>
    </RequireRole>
  );
}

export function AdminReportsPage() {
  const { state } = useHarmoniStore();
  const [period, setPeriod] = useState("Harian");
  const paidPayments = state.pembayaran.filter((payment) => payment.status_pembayaran === "Lunas");
  const paidBookings = paidPayments
    .map((payment) => state.pemesanan.find((booking) => booking.id_pemesanan === payment.id_pemesanan))
    .filter(Boolean);
  const popularStudioId = getPopularValue(paidBookings.map((booking) => booking!.id_studio));
  const popularStudio = state.studios.find((studio) => studio.id_studio === popularStudioId);
  const popularHour = getPopularValue(paidBookings.map((booking) => booking!.jam_mulai));

  return (
    <RequireRole role="admin">
      <AdminLayout>
        <PageHeader eyebrow="Laporan" title="Laporan Transaksi" />
        <FilterTabs value={period} values={["Harian", "Mingguan", "Bulanan"]} onChange={setPeriod} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Periode" value={period} />
          <StatCard label="Total transaksi" value={paidPayments.length} />
          <StatCard label="Total pendapatan" value={formatCurrency(paidPayments.reduce((total, payment) => total + payment.jumlah_bayar, 0))} />
          <StatCard label="Studio favorit" value={popularStudio?.nama_studio ?? "-"} helper={`Jam ramai ${popularHour}`} />
        </div>
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-zinc-950">Transaksi lunas</h2>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Pembayaran</th>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Metode</th>
                    <th className="px-4 py-3">Jumlah</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {paidPayments.map((payment) => (
                    <tr key={payment.id_pembayaran}>
                      <td className="px-4 py-3 font-semibold">{payment.id_pembayaran}</td>
                      <td className="px-4 py-3">INV-{payment.id_pemesanan}</td>
                      <td className="px-4 py-3">{payment.metode_pembayaran}</td>
                      <td className="px-4 py-3">{formatCurrency(payment.jumlah_bayar)}</td>
                      <td className="px-4 py-3"><StatusBadge status={payment.status_pembayaran} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </AdminLayout>
    </RequireRole>
  );
}

function CrudShell({
  form,
  children,
}: {
  form: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        {form}
      </aside>
      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        {children}
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm font-semibold text-zinc-700">
      {label}
      <input
        required
        type={type}
        className={`${inputClass} mt-1`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function FilterTabs({
  value,
  values,
  onChange,
}: {
  value: string;
  values: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            value === item ? "bg-zinc-950 text-white" : "bg-white text-zinc-700"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
