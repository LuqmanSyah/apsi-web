export type UserRole = "admin" | "user";
export type StudioStatus = "Tersedia" | "Maintenance";
export type InstrumentStatus = "Tersedia" | "Tidak Tersedia";
export type BookingStatus = "Pending" | "Confirmed" | "Canceled";
export type PaymentStatus =
  | "Belum Bayar"
  | "Menunggu Verifikasi"
  | "Lunas"
  | "Ditolak";
export type PaymentMethod = "Transfer Bank" | "E-Wallet" | "QRIS";

export type Pelanggan = {
  id_pelanggan: string;
  nama: string;
  email: string;
  no_telp: string;
  password: string;
};

export type Studio = {
  id_studio: string;
  nama_studio: string;
  harga_per_jam: number;
  fasilitas: string[];
  kapasitas: number;
  deskripsi: string;
  status: StudioStatus;
};

export type AlatMusik = {
  id_alat: string;
  nama_alat: string;
  harga_sewa_per_jam: number;
  stok: number;
  status: InstrumentStatus;
};

export type Pemesanan = {
  id_pemesanan: string;
  id_pelanggan: string;
  id_studio: string;
  tanggal_sewa: string;
  jam_mulai: string;
  jam_selesai: string;
  total_biaya: number;
  status_booking: BookingStatus;
};

export type DetailAlat = {
  id_detail: string;
  id_pemesanan: string;
  id_alat: string;
  jumlah: number;
};

export type Pembayaran = {
  id_pembayaran: string;
  id_pemesanan: string;
  waktu_bayar: string;
  metode_pembayaran: PaymentMethod;
  jumlah_bayar: number;
  status_pembayaran: PaymentStatus;
  bukti_pembayaran: string;
};

export type Session = {
  email: string;
  nama: string;
  role: UserRole;
  id_pelanggan?: string;
};

export type HarmoniState = {
  pelanggan: Pelanggan[];
  studios: Studio[];
  alatMusik: AlatMusik[];
  pemesanan: Pemesanan[];
  detailAlat: DetailAlat[];
  pembayaran: Pembayaran[];
};
