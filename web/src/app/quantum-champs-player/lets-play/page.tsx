
"use client";

import { useRouter } from "next/navigation";
import "./lets-play.css";

export default function LetsPlay() {
  const router = useRouter();

  return (
    <main className="qc-lets-root">
      <div className="qc-lets-container">

        {/* Quantum Champ Logo */}

        <div className="qc-lets-logo">
          <svg
            className="qc-lets-crown"
            viewBox="0 0 110 75"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="qcLetsGold"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop stopColor="#ffe25b" />
                <stop offset="1" stopColor="#d89410" />
              </linearGradient>
            </defs>

            <path
              d="M8 16 32 38 55 8 77 38 102 16 91 68 19 68Z"
              fill="url(#qcLetsGold)"
            />

            <circle cx="8" cy="16" r="5" fill="#7536aa" />
            <circle cx="55" cy="8" r="5" fill="#7536aa" />
            <circle cx="102" cy="16" r="5" fill="#7536aa" />
          </svg>

          <div className="qc-lets-shield">
            Quantum
            <br />
            Champ
          </div>
        </div>

        {/* Main Hexagon */}

        <section className="qc-lets-content">
          <div className="qc-lets-hexagon">

            <button
              type="button"
              className="qc-lets-button-shell"
              onClick={() =>
                router.push("/quantum-champs-player/choose-game-mode")
              }
            >
              <span className="qc-lets-button">
                LETS PLAY
              </span>
            </button>

          </div>
        </section>

      </div>
    </main>
  );
}
