"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "font-mono-label inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function FormStatus() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <span className="font-mono-label text-[0.7rem] uppercase tracking-wider text-primary">
      Guardando…
    </span>
  );
}

export { Label, FormStatus };
