"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#0ca898] px-5 text-xs font-extrabold text-white transition hover:bg-[#098f82] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Veuillez patienter…" : label}
    </button>
  );
}
