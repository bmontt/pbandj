"use client";

// The next event's countdown, kept current while the page stays open: the
// server renders the words (lib/dates.ts countdown, Eastern time) and this
// recomputes them once a minute. No seconds ticking: calm, not a clock.

import { useEffect, useState } from "react";
import { countdown } from "@/lib/dates";

export default function Countdown({ date, initial }: { date: string; initial: string }) {
  const [text, setText] = useState(initial);
  useEffect(() => {
    const update = () => setText(countdown(date));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [date]);
  return <span suppressHydrationWarning>{text}</span>;
}
