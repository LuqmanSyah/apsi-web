import Link from "next/link";
import { PublicNav } from "@/src/components/navigation";
import { ButtonLink, PageHeader, StatusBadge } from "@/src/components/ui";
import { initialState } from "@/src/data/dummy";
import { formatCurrency } from "@/src/lib/utils";

export default function StudiosPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <PublicNav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Studio"
          title="Pilih ruang latihan"
          description="Setiap studio menampilkan harga, kapasitas, fasilitas, dan status agar pelanggan bisa memilih ruang yang sesuai."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {initialState.studios.map((studio) => (
            <article
              key={studio.id_studio}
              className="flex rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-zinc-950">
                    {studio.nama_studio}
                  </h2>
                  <StatusBadge status={studio.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {studio.deskripsi}
                </p>
                <ul className="mt-4 grid gap-2 text-sm text-zinc-600">
                  <li>{formatCurrency(studio.harga_per_jam)} / jam</li>
                  <li>Kapasitas {studio.kapasitas} orang</li>
                  <li>{studio.fasilitas.join(", ")}</li>
                </ul>
                <div className="mt-5 flex gap-2">
                  <Link
                    href={`/studios/${studio.id_studio}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
                  >
                    Lihat Detail
                  </Link>
                  <ButtonLink href={`/booking?studio=${studio.id_studio}`}>
                    Booking
                  </ButtonLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
