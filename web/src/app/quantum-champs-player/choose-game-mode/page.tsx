
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { getStartingTeam } from "../lib/lobby";
import { startNewGame } from "../lib/game-engine";
import type { Team } from "../data/questions";
import "./choose-game-mode.css";

const ICONS = "/assessmenticons/";

type GameMode = "full" | "quick";

export default function ChooseGameMode() {
  const router = useRouter();

  const handleSelectMode = (mode: GameMode) => {
    const registeredTeam = getStartingTeam();

    const storedTeam = localStorage.getItem("qcFirstRegisteredTeam");

    const firstTeam: Team =
      registeredTeam === "nova" || registeredTeam === "blaze"
        ? registeredTeam
        : storedTeam === "blaze"
          ? "blaze"
          : "nova";

    // Reset previous game progress, XP, answers and lifelines.
    // Preserve the first registered team.
    const nextRoute = startNewGame(mode, firstTeam);

    localStorage.setItem("qcInstructionsCompleted", "false");

    // Full Quest shows the instructions before Round 1.
    // Quick Quest skips Round 1 and starts Round 2.
    if (mode === "quick") {
      router.push(nextRoute);
      return;
    }

    router.push("/quantum-champs-player/game-instructions");
  };

  return (
    <main className="qc-mode-root">
      <div className="qc-mode-container">

        {/* Logo */}

        <div className="qc-mode-logo">
          <Image
            src={`${ICONS}quantum-champ-logo.png`}
            alt="Quantum Champ"
            width={48}
            height={55}
            className="qc-mode-logo-img"
            unoptimized
          />
        </div>

        {/* Heading */}

        <div className="qc-mode-heading">
          <span className="qc-mode-heading-text">
            CHOOSE YOUR GAME MODE
          </span>
        </div>

        {/* Game Mode Cards */}

        <div className="qc-mode-cards">

          {/* Full Quest */}

          <button
            type="button"
            className="qc-mode-card qc-mode-full"
            onClick={() => handleSelectMode("full")}
          >
            <div className="qc-mode-card-ring">
              <div className="qc-mode-card-inner">

                <div className="qc-mode-icon-circle">
                  <Image
                    src={`${ICONS}full-quest.svg`}
                    alt=""
                    width={36}
                    height={36}
                    className="qc-mode-icon-img"
                    unoptimized
                  />
                </div>

                <h2 className="qc-mode-title">
                  FULL QUEST
                </h2>

                <p className="qc-mode-description">
                  Complete the AI challenge
                </p>

                <div className="qc-mode-badges">
                  <span className="qc-mode-badge">
                    ROUND 1 + 2
                  </span>

                  <span className="qc-mode-badge">
                    9 QUESTIONS
                  </span>
                </div>

              </div>
            </div>
          </button>

          {/* Quick Quest */}

          <button
            type="button"
            className="qc-mode-card qc-mode-quick"
            onClick={() => handleSelectMode("quick")}
          >
            <div className="qc-mode-card-ring">
              <div className="qc-mode-card-inner">

                <div className="qc-mode-icon-circle">
                  <Image
                    src={`${ICONS}quick-quest.svg`}
                    alt=""
                    width={36}
                    height={36}
                    className="qc-mode-icon-img"
                    unoptimized
                  />
                </div>

                <h2 className="qc-mode-title">
                  QUICK QUEST
                </h2>

                <p className="qc-mode-description">
                  Jump straight into the action
                </p>

                <div className="qc-mode-badges">
                  <span className="qc-mode-badge">
                    ROUND 2
                  </span>

                  <span className="qc-mode-badge">
                    9 QUESTIONS
                  </span>
                </div>

              </div>
            </div>
          </button>

        </div>

      </div>
    </main>
  );
}
