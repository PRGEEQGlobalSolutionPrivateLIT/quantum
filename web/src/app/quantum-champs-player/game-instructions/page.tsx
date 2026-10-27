
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getStartingTeam } from "../lib/lobby";
import { startNewGame, startRoundTwo } from "../lib/game-engine";
import type { Team } from "../data/questions";
import "./game-instructions.css";

const ICONS = "/assessmenticons/";

function GameIcon({
  name,
  alt = "",
  className = "",
}: {
  name: string;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={`${ICONS}${name}`}
      alt={alt}
      width={100}
      height={100}
      className={className}
      unoptimized
    />
  );
}

export default function GameInstructions() {
  const router = useRouter();
  const [showInstructions, setShowInstructions] = useState(false);

  const quickStartHandled = useRef(false);

  const normalizeTeam = (value: string | null): Team | null => {
    const team = value?.trim().toLowerCase();
    if (team === "nova" || team === "team nova" || team === "qc-team-001") return "nova";
    if (team === "blaze" || team === "team blaze" || team === "qc-team-002") return "blaze";
    return null;
  };

  const getRegisteredFirstTeam = (): Team | null =>
    normalizeTeam(getStartingTeam()) ??
    normalizeTeam(localStorage.getItem("qcFirstRegisteredTeam")) ??
    normalizeTeam(localStorage.getItem("qcCurrentTeam"));

  useEffect(() => {
    if (localStorage.getItem("qcGameMode") !== "quick") {
      setShowInstructions(true);
      return;
    }

    // Run only once when entering the new Quick Quest flow.
    if (quickStartHandled.current) return;
    quickStartHandled.current = true;

    const firstTeam = getRegisteredFirstTeam();
    if (!firstTeam) {
      router.replace("/quantum-champs-player/choose-game-mode");
      return;
    }

    resetLifelinesForNewGame();
    startNewGame("quick", firstTeam);
    localStorage.setItem("qcInstructionsCompleted", "true");
    // Begin Round 2 immediately, with fresh indexes, scores and answers.
    router.replace(startRoundTwo());
  }, [router]);

  const resetLifelinesForNewGame = () => {
    const teams = ["nova", "blaze"];
    const lifelines = ["blitz", "boost", "split"];

    teams.forEach(team => {
      lifelines.forEach(lifeline => {
        localStorage.removeItem(
          `qcLifelineUsed:${team}:${lifeline}`
        );

        sessionStorage.removeItem(
          `qcLifelineDeadline:${team}:${lifeline}`
        );
      });
    });

    const prefixes = [
      "qcLifelineHidden:",
      "qcSplitOptions:",
    ];

    [localStorage, sessionStorage].forEach(storage => {
      const keysToRemove: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);

        if (
          key &&
          prefixes.some(prefix => key.startsWith(prefix))
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        storage.removeItem(key);
      });
    });
  };

  const handleStartGame = () => {
    const selectedMode = localStorage.getItem("qcGameMode");

    if (selectedMode !== "full" && selectedMode !== "quick") {
      router.push("/quantum-champs-player/choose-game-mode");
      return;
    }

    const firstTeam = getRegisteredFirstTeam();

    if (!firstTeam) {
      alert(
        "Team registration information was not found. Please complete team registration before starting the game."
      );
      return;
    }

    // Reset all three lifelines for both teams in the new game.
    resetLifelinesForNewGame();

    startNewGame(selectedMode, firstTeam);
    localStorage.setItem("qcInstructionsCompleted", "true");

    if (selectedMode === "quick") {
      router.push(startRoundTwo());
      return;
    }

    // Full Quest begins at Round 1; the engine handles Round 2 automatically.
    router.push(
      firstTeam === "nova"
        ? "/quantum-champs-player/nova-questions"
        : "/quantum-champs-player/blaze-questions"
    );
  };

  if (!showInstructions) return null;

  return (
    <main className="qc-instructions-root">
      <div className="qc-instructions-container">

        {/* Logo */}

        <div className="qc-instructions-logo">
          <GameIcon
            name="quantum-champ-logo.png"
            alt="Quantum Champ"
            className="qc-instructions-logo-img"
          />
        </div>

        {/* Top Section */}

        <div className="qc-instructions-top">

          {/* Team Nova */}

          <div className="qc-instructions-team qc-instructions-nova">
            <GameIcon
              name="team-nova.png"
              alt="Team Nova"
              className="qc-instructions-team-img"
            />
          </div>

          {/* Main Heading */}

          <div className="qc-instructions-heading">
            <div className="qc-instructions-heading-icon">
              <GameIcon
                name="game-controller.png"
                alt=""
                className="qc-instructions-controller-img"
              />
            </div>

            <h1 className="qc-instructions-heading-title">
              GAME INSTRUCTIONS
            </h1>

            <div className="qc-instructions-heading-subtitle">
              <span>Team up</span>
              <span className="qc-instructions-dot">•</span>
              <span>Answer</span>
              <span className="qc-instructions-dot">•</span>
              <span>Earn XP</span>
              <span className="qc-instructions-dot">•</span>
              <span>Win!</span>
            </div>
          </div>

          {/* Team Blaze */}

          <div className="qc-instructions-team qc-instructions-blaze">
            <GameIcon
              name="team-blaze.png"
              alt="Team Blaze"
              className="qc-instructions-team-img"
            />
          </div>
        </div>

        {/* Instructions Cards */}

        <div className="qc-instructions-cards">

          {/* Card 1 */}

          <section className="qc-instructions-card qc-instructions-card-one">
            <div className="qc-instructions-number">1</div>

            <h2 className="qc-instructions-card-title">
              Pick Your Team
            </h2>

            <p className="qc-instructions-card-description">
              Split into Team Nova and
              <span>Team Blaze</span>
            </p>

            <div className="qc-instructions-team-options">
              <GameIcon
                name="team-nova.png"
                alt="Team Nova"
                className="qc-instructions-small-shield"
              />

              <div className="qc-instructions-vs">
                VS
              </div>

              <GameIcon
                name="team-blaze.png"
                alt="Team Blaze"
                className="qc-instructions-small-shield"
              />
            </div>
          </section>

          {/* Card 2 */}

          <section className="qc-instructions-card qc-instructions-card-two">
            <div className="qc-instructions-number">2</div>

            <h2 className="qc-instructions-card-title">
              Earn XP
            </h2>

            <p className="qc-instructions-card-description">
              Beat the Question! Boost Your
              <span>XP Power</span>
            </p>

            <GameIcon
              name="xp-power.png"
              alt="XP Power"
              className="qc-instructions-xp-img"
            />
          </section>

          {/* Card 3 */}

          <section className="qc-instructions-card qc-instructions-card-three">
            <div className="qc-instructions-number">3</div>

            <h2 className="qc-instructions-card-title">
              Lifelines
            </h2>

            <p className="qc-instructions-card-description">
              Each Team Gets 3 Lifelines
              <span>Use Them Wisely</span>
            </p>

            <div className="qc-instructions-lifelines">
              <div className="qc-instructions-lifeline">
                <div className="qc-instructions-lifeline-circle qc-lifeline-blitz">
                  30s
                </div>
                <span className="qc-lifeline-blitz-text">Blitz</span>
              </div>

              <div className="qc-instructions-lifeline">
                <div className="qc-instructions-lifeline-circle qc-lifeline-boost">
                  60s
                </div>
                <span className="qc-lifeline-boost-text">Boost</span>
              </div>

              <div className="qc-instructions-lifeline">
                <div className="qc-instructions-lifeline-circle qc-lifeline-split">
                  50:50
                </div>
                <span className="qc-lifeline-split-text">Split</span>
              </div>
            </div>
          </section>

          {/* Card 4 */}

          <section className="qc-instructions-wide-card qc-instructions-scenario">
            <div className="qc-instructions-number">4</div>

            <div className="qc-instructions-wide-content">
              <h2 className="qc-instructions-wide-title">
                Scenario Questions
              </h2>

              <p className="qc-instructions-wide-description">
                Split into Team Nova and Team Blaze
              </p>
            </div>

            <GameIcon
              name="scenario-questions.png"
              alt=""
              className="qc-instructions-wide-icon"
            />
          </section>

          {/* Card 5 */}

          <section className="qc-instructions-wide-card qc-instructions-goal">
            <div className="qc-instructions-number">5</div>

            <div className="qc-instructions-wide-content">
              <h2 className="qc-instructions-wide-title">
                Your Goal
              </h2>

              <p className="qc-instructions-wide-description">
                Reach 10,000 XP! Become AI Champion!
              </p>
            </div>

            <GameIcon
              name="champion-trophy.png"
              alt=""
              className="qc-instructions-wide-icon"
            />
          </section>
        </div>

        {/* Start Button */}

        <button
          type="button"
          className="qc-instructions-start"
          onClick={handleStartGame}
        >
          <span>Start the Game</span>
        </button>

      </div>
    </main>
  );
}
