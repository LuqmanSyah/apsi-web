import Image from "next/image";
import Link from "next/link";
import { PublicNav } from "@/src/components/navigation";
import { ButtonLink, StatusBadge } from "@/src/components/ui";
import { initialState } from "@/src/data/dummy";
import { formatCurrency } from "@/src/lib/utils";

export default function Home() {
  const featuredStudios = initialState.studios;
  const instruments = initialState.alatMusik;

  return (
    <div className="min-h-screen bg-zinc-50">
      <PublicNav />
      <main>
        <section className="relative min-h-[720px] overflow-hidden bg-zinc-950 text-white">
          <Image
            src="/images/studio-hero.png"
            alt="Interior studio musik modern Harmoni Music Studio"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/25" />
          <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">
                Booking studio musik digital
              </p>
              <h1 className="mt-4 text-5xl font-black leading-tight tracking-normal sm:text-6xl">
                Harmoni Music Studio
              </h1>
              <p className="mt-5 text-lg leading-8 text-zinc-200">
                Lihat jadwal studio, pilih alat tambahan, buat invoice otomatis,
                dan pantau status pembayaran tanpa agenda manual.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/booking">Booking Sekarang</ButtonLink>
                <ButtonLink href="/studios" variant="secondary">
                  Lihat Studio
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
                Pilihan ruang
              </p>
              <h2 className="mt-1 text-3xl font-bold text-zinc-950">Daftar Studio</h2>
            </div>
            <Link href="/studios" className="font-semibold text-teal-700">
              Lihat semua
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredStudios.map((studio) => (
              <article
                key={studio.id_studio}
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-zinc-950">
                    {studio.nama_studio}
                  </h3>
                  <StatusBadge status={studio.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {studio.deskripsi}
                </p>
                <p className="mt-4 text-lg font-bold text-zinc-950">
                  {formatCurrency(studio.harga_per_jam)}
                  <span className="text-sm font-medium text-zinc-500"> / jam</span>
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Kapasitas {studio.kapasitas} orang
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {["Ruang akustik nyaman", "Invoice otomatis", "Pembayaran terpantau"].map(
              (item, index) => (
                <div key={item}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-300 text-sm font-black text-zinc-950">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-zinc-950">{item}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Flow dibuat untuk menggantikan chat bolak-balik dan pencatatan
                    agenda manual dengan status yang bisa dicek langsung.
                  </p>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
              Cara booking
            </p>
            <h2 className="mt-1 text-3xl font-bold text-zinc-950">
              Pilih jadwal, tambah alat, bayar, lalu tunggu verifikasi.
            </h2>
            <div className="mt-8 grid gap-3">
              {["Login dummy pelanggan", "Isi form booking", "Upload bukti bayar", "Pantau status"].map(
                (step) => (
                  <div
                    key={step}
                    className="rounded-lg border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-800"
                  >
                    {step}
                  </div>
                ),
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-950">Alat musik tambahan</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {instruments.map((instrument) => (
                <div
                  key={instrument.id_alat}
                  className="rounded-lg border border-zinc-200 bg-white p-4"
                >
                  <p className="font-semibold text-zinc-950">{instrument.nama_alat}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatCurrency(instrument.harga_sewa_per_jam)} / jam
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-zinc-950 p-6 text-white">
              <h3 className="text-xl font-bold">Siap latihan minggu ini?</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Masuk sebagai pelanggan untuk mencoba flow booking end-to-end.
              </p>
              <div className="mt-5">
                <ButtonLink href="/login">Login dan Booking</ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
