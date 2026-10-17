import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Minimal native <select> styled to match the rest of the inputs — no need
// for a full Radix Select just for a handful of simple dropdowns.
export const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "w-full appearance-none rounded-xl border border-border bg-card px-3 py-2 pr-9 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  </div>
));
Select.displayName = "Select";
