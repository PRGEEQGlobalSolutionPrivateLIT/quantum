"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { startRoundTwo, getGameMode } from "../lib/game-engine";
import "./round-2-start.css";

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

export default function RoundTwoStartPage() {
  const router = useRouter();

  const handleStartRound2 = () => {
    if (getGameMode() !== "quick" && getGameMode() !== "full") return;
    // The mode-selection page resets new games. Never reset here.
    // This also preserves Round 1 XP when continuing a Full Quest.
    router.replace(startRoundTwo());
  };

  return (
    <main className="qc-round2-root">
      <div className="qc-round2-container">
        <div className="qc-round2-logo">
          <GameIcon name="quantum-champ-logo.png" alt="Quantum Champ" className="qc-round2-logo-img" />
        </div>

        <div className="qc-round2-top">
          <div className="qc-round2-team qc-round2-nova">
            <GameIcon name="team-nova.png" alt="Team Nova" className="qc-round2-team-img" />
          </div>

          <div className="qc-round2-heading">
            <div className="qc-round2-heading-icon">
              <GameIcon name="game-controller.png" alt="" className="qc-round2-controller-img" />
            </div>
            <h1 className="qc-round2-heading-title">GAME INSTRUCTIONS</h1>
            <div className="qc-round2-heading-subtitle">
              <span>Team up</span>
              <span className="qc-round2-dot">•</span>
              <span>Answer</span>
              <span className="qc-round2-dot">•</span>
              <span>Earn XP</span>
              <span className="qc-round2-dot">•</span>
              <span>Win!</span>
            </div>
          </div>

          <div className="qc-round2-team qc-round2-blaze">
            <GameIcon name="team-blaze.png" alt="Team Blaze" className="qc-round2-team-img" />
          </div>
        </div>

        <div className="qc-round2-cards">
          <section className="qc-round2-card qc-round2-card-one">
            <div className="qc-round2-number">1</div>
            <h2 className="qc-round2-card-title">Pick Your Team</h2>
            <p className="qc-round2-card-description">Split into Team Nova and <span>Team Blaze</span></p>
            <div className="qc-round2-team-options">
              <GameIcon name="team-nova.png" alt="Team Nova" className="qc-round2-small-shield" />
              <div className="qc-round2-vs">VS</div>
              <GameIcon name="team-blaze.png" alt="Team Blaze" className="qc-round2-small-shield" />
            </div>
          </section>

          <section className="qc-round2-card qc-round2-card-two">
            <div className="qc-round2-number">2</div>
            <h2 className="qc-round2-card-title">Earn XP</h2>
            <p className="qc-round2-card-description">Beat the Question! Boost Your <span>XP Power</span></p>
            <GameIcon name="xp-power.png" alt="XP Power" className="qc-round2-xp-img" />
          </section>

          <section className="qc-round2-card qc-round2-card-three">
            <div className="qc-round2-number">3</div>
            <h2 className="qc-round2-card-title">Lifelines</h2>
            <p className="qc-round2-card-description">Each Team Gets 3 Lifelines <span>Use Them Wisely</span></p>
            <div className="qc-round2-lifelines">
              <div className="qc-round2-lifeline"><div className="qc-round2-lifeline-circle qc-round2-life-blitz">30s</div><span className="qc-round2-life-blitz-text">Blitz</span></div>
              <div className="qc-round2-lifeline"><div className="qc-round2-lifeline-circle qc-round2-life-boost">60s</div><span className="qc-round2-life-boost-text">Boost</span></div>
              <div className="qc-round2-lifeline"><div className="qc-round2-lifeline-circle qc-round2-life-split">50:50</div><span className="qc-round2-life-split-text">Split</span></div>
            </div>
          </section>

          <section className="qc-round2-wide-card qc-round2-scenario">
            <div className="qc-round2-number">4</div>
            <div className="qc-round2-wide-content">
              <h2 className="qc-round2-wide-title">Scenario Questions</h2>
              <p className="qc-round2-wide-description">Team up! Hit key points! Earn XP</p>
            </div>
            <GameIcon name="scenario-questions.png" alt="" className="qc-round2-wide-icon" />
          </section>

          <section className="qc-round2-wide-card qc-round2-goal">
            <div className="qc-round2-number">5</div>
            <div className="qc-round2-wide-content">
              <h2 className="qc-round2-wide-title">Your Goal</h2>
              <p className="qc-round2-wide-description">Reach 10,000 XP! Become AI Champion!</p>
            </div>
            <GameIcon name="champion-trophy.png" alt="" className="qc-round2-wide-icon" />
          </section>
        </div>

        <div
          className="qc-round2-start"
          role="button"
          tabIndex={0}
          style={{ cursor: "pointer" }}
          onClick={handleStartRound2}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStartRound2();
            }
          }}
          aria-label="Start Round 2"
        >
          Start Round 2
        </div>
      </div>
    </main>
  );
}
