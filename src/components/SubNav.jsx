import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SubNav({ title, maxWidth = "max-w-4xl", right = null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className={`mx-auto flex ${maxWidth} items-center justify-between px-6 py-4`}>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to practice
        </Link>
        <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
          {title}
        </span>
        <div className="flex w-24 justify-end">{right}</div>
      </div>
    </header>
  );
}
