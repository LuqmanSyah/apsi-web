import Link from "next/link";
import type { ReactNode } from "react";
import type { BookingStatus, PaymentStatus } from "@/src/types";
import { bookingStatusClass, paymentStatusClass } from "@/src/lib/utils";

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-teal-500 text-zinc-950 shadow-sm shadow-teal-500/20 hover:bg-teal-400",
        variant === "secondary" &&
          "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100",
        variant === "ghost" && "text-zinc-700 hover:bg-zinc-100",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Link>
  );
}

export function StatusBadge({
  status,
}: {
  status: BookingStatus | PaymentStatus | string;
}) {
  const className =
    status in bookingStatusClass
      ? bookingStatusClass[status as BookingStatus]
      : status in paymentStatusClass
        ? paymentStatusClass[status as PaymentStatus]
        : "border-zinc-200 bg-zinc-50 text-zinc-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: ReactNode;
  helper?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <div className="mt-2 text-2xl font-bold text-zinc-950">{value}</div>
      {helper ? <p className="mt-1 text-sm text-zinc-500">{helper}</p> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-3xl font-bold tracking-normal text-zinc-950 sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 gap-2">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

export const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50";
