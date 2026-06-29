import { Suspense } from "react";
import { BookingFormPage } from "@/src/views/user";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-zinc-500">Memuat form booking...</div>}>
      <BookingFormPage />
    </Suspense>
  );
}
