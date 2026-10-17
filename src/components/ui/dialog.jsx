import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Minimal modal dialog — no Radix dependency, just a fixed overlay + panel.
// API intentionally mirrors shadcn's Dialog enough for this app's needs:
// <Dialog open={open} onOpenChange={setOpen}><DialogContent>...</DialogContent></Dialog>

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange?.(false)}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

export function DialogContent({ className, children, onClose }) {
  return (
    <div
      className={cn(
        "relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg",
        className
      )}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ children }) {
  return <div className="mb-4 space-y-1">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="font-heading text-lg font-semibold text-foreground">{children}</h2>;
}
