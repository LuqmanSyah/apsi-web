"use client";

import type { ReactNode } from "react";
import { buttonClass } from "@/src/components/ui";

export type FeedbackVariant = "success" | "error" | "warning" | "info";

const variantStyles: Record<FeedbackVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

const variantLabels: Record<FeedbackVariant, string> = {
  success: "Berhasil",
  error: "Gagal",
  warning: "Perhatian",
  info: "Info",
};

export function FeedbackModal({
  open,
  title,
  message,
  variant = "info",
  confirmText = "Mengerti",
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  variant?: FeedbackVariant;
  confirmText?: string;
  children?: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-2xl">
        <div
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${variantStyles[variant]}`}
        >
          {variantLabels[variant]}
        </div>
        <h2 id="feedback-modal-title" className="mt-4 text-2xl font-bold text-zinc-950">
          {title}
        </h2>
        {message ? <p className="mt-3 leading-7 text-zinc-600">{message}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <button type="button" onClick={onClose} className={`${buttonClass} mt-6 w-full`}>
          {confirmText}
        </button>
      </div>
    </div>
  );
}
