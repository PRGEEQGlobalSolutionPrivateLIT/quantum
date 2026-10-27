
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import "./winner-slide.css";

type Team = "nova" | "blaze";

type ConfettiPiece = {
  left: string;
  top: string;
  color: string;
  rotation: string;
  delay: string;
  duration: string;
  size: string;
  shape: "piece" | "star" | "ribbon";
};

const confettiColors = [
  "#ad59e6",
  "#e4bc4a",
  "#51ca74",
  "#55b5e9",
  "#f26b72",
  "#7576d6",
  "#f39a49",
];

function WinnerContent() {
  const params = useSearchParams();

  const [stored, setStored] = useState({
    nova: 0,
    blaze: 0,
  });

  const [celebrating, setCelebrating] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const getXP = (team: Team) => {
      const prefix = team === "nova" ? "qcNova" : "qcBlaze";
      const savedXP = localStorage.getItem(`${prefix}XP`);

      if (savedXP !== null) {
        const direct = Number(savedXP);

        if (Number.isFinite(direct) && direct >= 0) {
          return direct;
        }
      }

      try {
        const progress = JSON.parse(
          localStorage.getItem(`${prefix}Progress`) || "null"
        );

        return Number.isFinite(progress?.xp)
          ? progress.xp
          : 0;
      } catch {
        return 0;
      }
    };

    setStored({
      nova: getXP("nova"),
      blaze: getXP("blaze"),
    });

    const random = (seed: number) => {
      const n = Math.sin(seed * 127.1 + 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    const fixed = (value: number) => value.toFixed(3);

    const pieces: ConfettiPiece[] = Array.from(
      { length: 160 },
      (_, i) => ({
        left: `${fixed(random(i + 1) * 100)}%`,
        top: `${fixed(random(i + 151) * 100)}%`,
        color: confettiColors[i % confettiColors.length],
        rotation: `${fixed(random(i + 301) * 360)}deg`,
        delay: `${fixed(-random(i + 451) * 9)}s`,
        duration: `${fixed(5 + random(i + 601) * 7)}s`,
        size: `${fixed(5 + random(i + 751) * 9)}px`,
        shape:
          i % 11 === 0
            ? "star"
            : i % 7 === 0
              ? "ribbon"
              : "piece",
      })
    );

    setConfetti(pieces);
    setCelebrating(true);
  }, []);

  const requested = params.get("team");

  const winner: Team =
    requested === "nova" || requested === "blaze"
      ? requested
      : stored.blaze > stored.nova
        ? "blaze"
        : "nova";

  const name = winner === "nova" ? "Nova" : "Blaze";

  const overrideXP = params.get("xp");

  const xp =
    overrideXP !== null &&
    overrideXP.trim() !== "" &&
    Number.isFinite(Number(overrideXP))
      ? Math.max(0, Number(overrideXP))
      : stored[winner];

  const burstPieces = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      angle: `${(360 / 48) * i}deg`,
      distance: `${130 + (i % 5) * 35}px`,
      delay: `${((i % 6) * 0.035).toFixed(3)}s`,
      color: confettiColors[i % confettiColors.length],
      size: `${5 + (i % 4) * 2}px`,
    }));
  }, []);

  return (
    <main
      className={`qc-winner-page qc-winner-${winner} ${
        celebrating ? "qc-winner-celebrating" : ""
      }`}
    >
      <div
        className="qc-winner-pattern"
        aria-hidden="true"
      />

      <div
        className="qc-winner-confetti"
        aria-hidden="true"
      >
        {confetti.map((piece, i) => (
          <i
            key={i}
            className={`qc-winner-piece qc-winner-${piece.shape}`}
            style={{
              left: piece.left,
              top: piece.top,
              backgroundColor:
                piece.shape === "ribbon"
                  ? "transparent"
                  : piece.color,
              borderColor: piece.color,
              width: piece.size,
              height:
                piece.shape === "ribbon"
                  ? "33px"
                  : piece.size,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              transform: `rotate(${piece.rotation})`,
            }}
          />
        ))}
      </div>

      <div
        className="qc-winner-burst"
        aria-hidden="true"
      >
        {burstPieces.map((piece, i) => (
          <span
            key={i}
            className="qc-winner-burst-piece"
            style={
              {
                "--burst-angle": piece.angle,
                "--burst-distance": piece.distance,
                "--burst-delay": piece.delay,
                "--burst-color": piece.color,
                "--burst-size": piece.size,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div
        className="qc-winner-glow"
        aria-hidden="true"
      />

      <div
        className="qc-winner-sparkles"
        aria-hidden="true"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className={`qc-winner-sparkle qc-winner-sparkle-${i + 1}`}
          >
            ✦
          </span>
        ))}
      </div>

      <section
        className="qc-winner-center"
        aria-label={`${name} wins with ${xp} XP`}
      >
        <h1>The Winner is</h1>

        <div className="qc-winner-shield-outer">
          <div className="qc-winner-shield-inner">
            <div
              className="qc-winner-symbol"
              aria-hidden="true"
            >
              {winner === "nova" ? "☼" : "♨"}
            </div>

            <strong>{name}</strong>
          </div>
        </div>

        <div className="qc-winner-xp">
          {xp.toLocaleString("en-US")} XP
        </div>

        <div className="qc-winner-rank">
          <span className="qc-winner-medal">♙</span>
          Rank Unlocked
          <strong>AI Titan</strong>
        </div>
      </section>
    </main>
  );
}

export default function WinnerSlidePage() {
  return (
    <Suspense fallback={<main className="qc-winner-page" />}>
      <WinnerContent />
    </Suspense>
  );
}
