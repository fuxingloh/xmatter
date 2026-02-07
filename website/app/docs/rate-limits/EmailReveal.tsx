"use client";
import { useState } from "react";

export function EmailReveal() {
  const email = "eG1hdHRlckBmdXhpbmcuZGV2";
  const [reveal, setReveal] = useState(false);

  return (
    <span>
      {!reveal ? (
        <button
          className="hover:text-mono-700 shrink-0 cursor-pointer transition-colors"
          onClick={() => setReveal(true)}
        >
          &lt;reveal email&gt;
        </button>
      ) : (
        <a href={`mailto:${atob(email)}`}>{atob(email)}</a>
      )}
    </span>
  );
}
