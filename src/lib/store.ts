"use client";

import { useSyncExternalStore } from "react";
import { dummyAccounts, initialState } from "@/src/data/dummy";
import type {
  AlatMusik,
  BookingStatus,
  HarmoniState,
  PaymentMethod,
  PaymentStatus,
  Pembayaran,
  Pemesanan,
  Session,
  Studio,
} from "@/src/types";
import { createId } from "@/src/lib/utils";

const STATE_KEY = "harmoni_state";
const SESSION_KEY = "harmoni_session";
const STATE_EVENT = "harmoni-state-change";
const SESSION_EVENT = "harmoni-session-change";

let stateCacheRaw = "";
let stateCache: HarmoniState = initialState;
let sessionCacheRaw = "";
let sessionCache: Session | null = null;

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const getStateSnapshot = () => {
  if (typeof window === "undefined") return initialState;
  const raw = window.localStorage.getItem(STATE_KEY) ?? "";
  if (raw === stateCacheRaw) return stateCache;
  stateCacheRaw = raw;
  stateCache = raw ? readJson(STATE_KEY, initialState) : initialState;
  return stateCache;
};

const getSessionSnapshot = () => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY) ?? "";
  if (raw === sessionCacheRaw) return sessionCache;
  sessionCacheRaw = raw;
  sessionCache = raw ? readJson<Session | null>(SESSION_KEY, null) : null;
  return sessionCache;
};

const subscribeTo = (eventName: string) => (onStoreChange: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STATE_KEY || event.key === SESSION_KEY) onStoreChange();
  };
  window.addEventListener(eventName, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(eventName, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
};

const persistState = (state: HarmoniState) => {
  window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  stateCacheRaw = window.localStorage.getItem(STATE_KEY) ?? "";
  stateCache = state;
  window.dispatchEvent(new Event(STATE_EVENT));
};

const updateState = (updater: (current: HarmoniState) => HarmoniState) => {
  const next = updater(getStateSnapshot());
  persistState(next);
};

const setSession = (nextSession: Session | null) => {
  if (nextSession) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
  sessionCacheRaw = window.localStorage.getItem(SESSION_KEY) ?? "";
  sessionCache = nextSession;
  window.dispatchEvent(new Event(SESSION_EVENT));
};

export const useSession = () => {
  const session = useSyncExternalStore(
    subscribeTo(SESSION_EVENT),
    getSessionSnapshot,
    () => null,
  );

  const login = (email: string, password: string) => {
    const account = dummyAccounts.find(
      (item) => item.email === email && item.password === password,
    );
    if (!account) return null;

    const nextSession: Session = {
      email: account.email,
      nama: account.nama,
      role: account.role,
      id_pelanggan: "id_pelanggan" in account ? account.id_pelanggan : undefined,
    };
    setSession(nextSession);
    return nextSession;
  };

  return { session, ready: true, login, logout: () => setSession(null) };
};

export const useHarmoniStore = () => {
  const state = useSyncExternalStore(
    subscribeTo(STATE_EVENT),
    getStateSnapshot,
    () => initialState,
  );

  return {
    state,
    ready: true,
    addStudio: (studio: Omit<Studio, "id_studio">) => {
      let id = "";
      updateState((current) => {
        id = createId("STD", current.studios.length);
        return {
          ...current,
          studios: [...current.studios, { ...studio, id_studio: id }],
        };
      });
      return id;
    },
    updateStudio: (studio: Studio) =>
      updateState((current) => ({
        ...current,
        studios: current.studios.map((item) =>
          item.id_studio === studio.id_studio ? studio : item,
        ),
      })),
    deleteStudio: (studioId: string) =>
      updateState((current) => ({
        ...current,
        studios: current.studios.filter((item) => item.id_studio !== studioId),
      })),
    addInstrument: (instrument: Omit<AlatMusik, "id_alat">) => {
      let id = "";
      updateState((current) => {
        id = createId("ALT", current.alatMusik.length);
        return {
          ...current,
          alatMusik: [...current.alatMusik, { ...instrument, id_alat: id }],
        };
      });
      return id;
    },
    updateInstrument: (instrument: AlatMusik) =>
      updateState((current) => ({
        ...current,
        alatMusik: current.alatMusik.map((item) =>
          item.id_alat === instrument.id_alat ? instrument : item,
        ),
      })),
    deleteInstrument: (instrumentId: string) =>
      updateState((current) => ({
        ...current,
        alatMusik: current.alatMusik.filter((item) => item.id_alat !== instrumentId),
      })),
    addBooking: (
      booking: Omit<Pemesanan, "id_pemesanan" | "status_booking">,
      details: Array<{ id_alat: string; jumlah: number }>,
    ) => {
      let id = "";
      updateState((current) => {
        id = createId("BKG", current.pemesanan.length);
        return {
          ...current,
          pemesanan: [
            ...current.pemesanan,
            { ...booking, id_pemesanan: id, status_booking: "Pending" },
          ],
          detailAlat: [
            ...current.detailAlat,
            ...details.map((detail, index) => ({
              id_detail: createId("DTL", current.detailAlat.length + index),
              id_pemesanan: id,
              ...detail,
            })),
          ],
        };
      });
      return id;
    },
    updateBookingStatus: (bookingId: string, status_booking: BookingStatus) =>
      updateState((current) => ({
        ...current,
        pemesanan: current.pemesanan.map((booking) =>
          booking.id_pemesanan === bookingId ? { ...booking, status_booking } : booking,
        ),
      })),
    addPayment: (
      bookingId: string,
      payment: {
        metode_pembayaran: PaymentMethod;
        jumlah_bayar: number;
        bukti_pembayaran: string;
      },
    ) => {
      let id = "";
      updateState((current) => {
        id = createId("PAY", current.pembayaran.length);
        const nextPayment: Pembayaran = {
          id_pembayaran: id,
          id_pemesanan: bookingId,
          waktu_bayar: new Date().toISOString(),
          status_pembayaran: "Menunggu Verifikasi",
          ...payment,
        };
        const existing = current.pembayaran.some(
          (item) => item.id_pemesanan === bookingId,
        );
        return {
          ...current,
          pembayaran: existing
            ? current.pembayaran.map((item) =>
                item.id_pemesanan === bookingId ? nextPayment : item,
              )
            : [...current.pembayaran, nextPayment],
        };
      });
      return id;
    },
    updatePaymentStatus: (paymentId: string, status_pembayaran: PaymentStatus) =>
      updateState((current) => {
        const payment = current.pembayaran.find(
          (item) => item.id_pembayaran === paymentId,
        );
        return {
          ...current,
          pembayaran: current.pembayaran.map((item) =>
            item.id_pembayaran === paymentId ? { ...item, status_pembayaran } : item,
          ),
          pemesanan:
            payment && status_pembayaran === "Lunas"
              ? current.pemesanan.map((booking) =>
                  booking.id_pemesanan === payment.id_pemesanan
                    ? { ...booking, status_booking: "Confirmed" }
                    : booking,
                )
              : current.pemesanan,
        };
      }),
    resetDummyData: () => updateState(() => initialState),
  };
};
