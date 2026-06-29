import Link from "next/link";
import type { HarmoniState, Pemesanan } from "@/src/types";
import { formatCurrency, formatDate, getPaymentStatus } from "@/src/lib/utils";
import { StatusBadge } from "@/src/components/ui";

export function BookingTable({
  state,
  bookings,
  detailBasePath = "/my-bookings",
  showCustomer = false,
}: {
  state: HarmoniState;
  bookings: Pemesanan[];
  detailBasePath?: string;
  showCustomer?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              {showCustomer ? <th className="px-4 py-3">Pelanggan</th> : null}
              <th className="px-4 py-3">Studio</th>
              <th className="px-4 py-3">Jadwal</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Bayar</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {bookings.map((booking) => {
              const studio = state.studios.find(
                (item) => item.id_studio === booking.id_studio,
              );
              const customer = state.pelanggan.find(
                (item) => item.id_pelanggan === booking.id_pelanggan,
              );
              const paymentStatus = getPaymentStatus(state, booking.id_pemesanan);

              return (
                <tr key={booking.id_pemesanan}>
                  <td className="px-4 py-3 font-semibold text-zinc-950">
                    INV-{booking.id_pemesanan}
                  </td>
                  {showCustomer ? (
                    <td className="px-4 py-3 text-zinc-600">{customer?.nama ?? "-"}</td>
                  ) : null}
                  <td className="px-4 py-3 text-zinc-600">
                    {studio?.nama_studio ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {formatDate(booking.tanggal_sewa)}, {booking.jam_mulai}-
                    {booking.jam_selesai}
                  </td>
                  <td className="px-4 py-3 font-semibold text-zinc-900">
                    {formatCurrency(booking.total_biaya)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.status_booking} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`${detailBasePath}/${booking.id_pemesanan}`}
                      className="font-semibold text-teal-700 hover:text-teal-600"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
