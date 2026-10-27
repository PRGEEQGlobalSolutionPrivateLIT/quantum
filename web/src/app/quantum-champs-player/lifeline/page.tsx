
"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import "./lifeline.css";

type Team = "nova" | "blaze";
type Lifeline = "blitz" | "boost";

function Countdown() {
  const router = useRouter();
  const params = useSearchParams();
  const team: Team = params.get("team") === "blaze" ? "blaze" : "nova";
  const type: Lifeline = params.get("type") === "boost" ? "boost" : "blitz";
  const duration = type === "boost" ? 60 : 30;
  const [remaining, setRemaining] = useState(duration);
  const destination = `/quantum-champs-player/${team}-questions`;

  useEffect(() => {
    const usedKey = `qcLifelineUsed:${team}:${type}`;
    const deadlineKey = `qcLifelineDeadline:${team}:${type}`;
    const activeTeam = localStorage.getItem("qcCurrentTeam");

    if (activeTeam !== team) {
      router.replace(
        `/quantum-champs-player/${activeTeam === "blaze" ? "blaze" : "nova"}-questions`
      );
      return;
    }

    const existingDeadline = Number(sessionStorage.getItem(deadlineKey));

    if (localStorage.getItem(usedKey) === "1" && !existingDeadline) {
      router.replace(destination);
      return;
    }

    const deadline = existingDeadline > 0
      ? existingDeadline
      : Date.now() + duration * 1000;

    sessionStorage.setItem(deadlineKey, String(deadline));
    localStorage.setItem(usedKey, "1");

    const tick = () => {
      const seconds = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000)
      );

      setRemaining(seconds);

      if (seconds === 0) {
        sessionStorage.removeItem(deadlineKey);
        router.replace(destination);
      }
    };

    tick();

    const interval = window.setInterval(tick, 200);

    return () => window.clearInterval(interval);
  }, [destination, duration, router, team, type]);

  return (
    <main className={`qc-timer-page qc-timer-${team}`}>
      <div className="qc-timer-logo">
        <Image
          src="/assessmenticons/quantum-champ-logo.png"
          alt="Quantum Champ"
          width={50}
          height={55}
          unoptimized
        />
      </div>

      <section
        className="qc-timer-panel"
        aria-label={`${duration} second ${type} countdown`}
      >
        <div
          className="qc-timer-ring"
          role="timer"
          aria-live="off"
          aria-label={`${remaining} seconds remaining`}
        >
          <span>{remaining} Sec</span>
        </div>
      </section>
    </main>
  );
}

export default function LifelinePage() {
  return (
    <Suspense fallback={<main className="qc-timer-page" />}>
      <Countdown />
    </Suspense>
  );
}
