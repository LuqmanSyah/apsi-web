import { notFound } from "next/navigation";
import { PublicNav } from "@/src/components/navigation";
import { ButtonLink, PageHeader, StatusBadge } from "@/src/components/ui";
import { initialState } from "@/src/data/dummy";
import { formatCurrency, formatDate } from "@/src/lib/utils";

export function generateStaticParams() {
  return initialState.studios.map((studio) => ({ id: studio.id_studio }));
}

export default async function StudioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studio = initialState.studios.find((item) => item.id_studio === id);
  if (!studio) notFound();

  const bookings = initialState.pemesanan.filter(
    (booking) => booking.id_studio === id && booking.status_booking !== "Canceled",
  );
  const slots = ["09:00-11:00", "11:00-13:00", "13:00-15:00", "15:00-17:00", "19:00-21:00"];

  return (
    <div className="min-h-screen bg-zinc-50">
      <PublicNav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Detail Studio"
          title={studio.nama_studio}
          description={studio.deskripsi}
          action={<ButtonLink href={`/booking?studio=${studio.id_studio}`}>Booking</ButtonLink>}
        />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl font-bold text-zinc-950">
                {formatCurrency(studio.harga_per_jam)}
                <span className="text-sm font-medium text-zinc-500"> / jam</span>
              </p>
              <StatusBadge status={studio.status} />
            </div>
            <p className="mt-4 text-sm text-zinc-600">
              Kapasitas {studio.kapasitas} orang
            </p>
            <h2 className="mt-6 font-bold text-zinc-950">Fasilitas</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {studio.fasilitas.map((facility) => (
                <span
                  key={facility}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                >
                  {facility}
                </span>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-950">Jadwal booking dummy</h2>
            <div className="mt-4 grid gap-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id_pemesanan}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-zinc-950">
                      {formatDate(booking.tanggal_sewa)}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {booking.jam_mulai} - {booking.jam_selesai}
                    </p>
                  </div>
                  <StatusBadge status={booking.status_booking} />
                </div>
              ))}
            </div>
            <h3 className="mt-6 font-bold text-zinc-950">Slot contoh hari ini</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {slots.map((slot) => {
                const [start, end] = slot.split("-");
                const booked = bookings.some(
                  (booking) =>
                    booking.tanggal_sewa === "2026-06-29" &&
                    start < booking.jam_selesai &&
                    end > booking.jam_mulai,
                );
                return (
                  <div
                    key={slot}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                      booked
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {slot} {booked ? "Sudah dibooking" : "Tersedia"}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
