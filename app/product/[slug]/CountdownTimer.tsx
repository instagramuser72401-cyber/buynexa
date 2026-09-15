"use client";

import { useEffect, useState } from "react";

export default function CountdownTimer({
  durationHours,
  startedAt,
}: {
  durationHours: number | null;
  startedAt: string | null;
}) {
  const durationMs = Math.max(1, Number(durationHours || 15)) * 60 * 60 * 1000;

  const getRemaining = () => {
    if (!startedAt) return durationMs;

    const elapsed = Date.now() - new Date(startedAt).getTime();
    const cycleElapsed = ((elapsed % durationMs) + durationMs) % durationMs;

    return durationMs - cycleElapsed;
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [durationMs, startedAt]);

  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-700">
        🔥 Discount Ends In
      </p>
      <div className="mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-wider text-red-600">
        <span>{String(hours).padStart(2, "0")}</span>
        <span>:</span>
        <span>{String(minutes).padStart(2, "0")}</span>
        <span>:</span>
        <span>{String(seconds).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
