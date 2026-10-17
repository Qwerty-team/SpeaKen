import React from "react";
import AuthIllustration from "@/components/AuthIllustration";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 text-center">
            {Icon && (
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
            <p className="font-heading text-lg font-semibold text-foreground/80">SpeaKen</p>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">{children}</div>

          {footer && (
            <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
          )}
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2">
        <img src="IMG_8097.JPG" alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
