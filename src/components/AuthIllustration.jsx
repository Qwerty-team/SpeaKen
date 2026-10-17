import React from "react";

// Original abstract-shapes illustration for the auth screens' side panel —
// not a reproduction of any particular artwork, just warm overlapping
// blobs in the app's palette so the login/register pages don't feel bare.
export default function AuthIllustration({ className }) {
  return (
    <svg
      viewBox="0 0 600 800"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="600" height="800" fill="#f4ddd2" />
      <circle cx="140" cy="430" r="150" fill="#3c2a1e" opacity="0.9" />
      <circle cx="230" cy="470" r="95" fill="#e8c34a" />
      <path
        d="M120 620 Q260 520 420 600 Q520 660 460 760 Q360 820 240 760 Q100 700 120 620 Z"
        fill="#d9772f"
      />
      <path
        d="M340 120 Q470 90 520 220 Q560 330 460 380 Q360 410 320 310 Q280 190 340 120 Z"
        fill="#9c2f45"
      />
      <path
        d="M300 420 Q420 380 470 480 Q500 560 430 640 Q350 700 290 620 Q230 520 300 420 Z"
        fill="#e78a9c"
        opacity="0.9"
      />
      <path
        d="M250 260 Q340 240 360 330 Q375 400 300 420 Q230 430 215 350 Q205 290 250 260 Z"
        fill="#5aa3ad"
      />
      <path
        d="M400 540 Q520 560 500 670 Q485 750 390 740 Q310 725 320 630 Q335 555 400 540 Z"
        fill="#f0a8b4"
        opacity="0.85"
      />
    </svg>
  );
}
