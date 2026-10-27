
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  current,
  findLobby,
  subscribe,
  type Lobby,
} from "../lib/lobby";
import "./game-mode.css";

type Topic = "Prompting" | "Machine Learning" | "Responsible AI";

const TOPICS: Topic[] = [
  "Prompting",
  "Machine Learning",
  "Responsible AI",
];

const LEVELS = [
  { number: "1", title: "AI Spark", xp: "0 XP", icon: "✧" },
  { number: "2", title: "AI Boost", xp: "4,000 XP" },
  { number: "3", title: "AI Elite", xp: "7,000 XP" },
  { number: "4", title: "AI Titan", xp: "10,000 XP", icon: "🏆" },
];

export default function GameMode() {
  const router = useRouter();

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic>("Machine Learning");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const session = current();

    if (!session) {
      router.replace("/quantum-champs-player/access-code");
      return;
    }

    const refresh = () => {
      const next = findLobby(session.lobbyId);

      if (!next) {
        router.replace("/quantum-champs-player/access-code");
        return;
      }

      const allowed =
        session.teamId === next.hostTeam.id ||
        session.teamId === next.guestTeam.id;

      if (!allowed) {
        router.replace("/quantum-champs-player/access-code");
        return;
      }

      if (next.status !== "ready") {
        router.replace("/quantum-champs-player/waiting");
        return;
      }

      setLobby(next);
      setLoaded(true);
    };

    refresh();

    return subscribe(refresh);
  }, [router]);

  const novaName = lobby?.hostTeam.name || "Nova";
  const blazeName = lobby?.guestTeam.name || "Blaze";

  function getStarted() {
    // Connect this button to your next gameplay route.
    router.push("/quantum-champs-player/ai-essentials");
  }

  if (!loaded) {
    return <main className="qc-gm-root" />;
  }

  return (
    <main className="qc-gm-root">
      <div className="qc-gm-container">

        <header className="qc-gm-header">
          <div className="qc-gm-logo" aria-label="Quantum Champ">
            <svg
              className="qc-gm-crown"
              viewBox="0 0 110 75"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="gmGold" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#ffe25b" />
                  <stop offset="1" stopColor="#d89410" />
                </linearGradient>
              </defs>
              <path
                d="M8 16 32 38 55 8 77 38 102 16 91 68 19 68Z"
                fill="url(#gmGold)"
              />
              <circle cx="8" cy="16" r="5" fill="#7536aa" />
              <circle cx="55" cy="8" r="5" fill="#7536aa" />
              <circle cx="102" cy="16" r="5" fill="#7536aa" />
            </svg>
            <div className="qc-gm-shield">
              Quantum
              <br />
              Champ
            </div>
          </div>

          <nav className="qc-gm-topics" aria-label="Game topics">
            {TOPICS.map(topic => (
              <button
                key={topic}
                type="button"
                className={`qc-gm-topic ${activeTopic === topic ? "qc-gm-topic-active" : ""}`}
                onClick={() => setActiveTopic(topic)}
                aria-pressed={activeTopic === topic}
              >
                {topic}
              </button>
            ))}
          </nav>
        </header>

        <section className="qc-gm-hero">
          <div className="qc-gm-intro">
            <h1 className="qc-gm-heading">
              <span>Neural</span>
              <span className="qc-gm-gradient-text">Knockout</span>
            </h1>

            <div className="qc-gm-tagline">
              <span><b className="qc-gm-tag-icon qc-gm-pink">♧</b> Outsmart</span>
              <span><b className="qc-gm-tag-icon qc-gm-purple">♙</b> Outscore</span>
              <span><b className="qc-gm-tag-icon qc-gm-orange">✧</b> Out Level</span>
            </div>

            <button
              type="button"
              className="qc-gm-start"
              onClick={getStarted}
            >
              <span className="qc-gm-play">▶</span>
              Get Started
            </button>
          </div>

          <div className="qc-gm-board">
            <div className="qc-gm-match">
              <div className="qc-gm-team qc-gm-team-nova">
                <div className="qc-gm-hex qc-gm-hex-nova">
                  {novaName}
                </div>
                <div className="qc-gm-motto">
                  <span className="qc-gm-motto-nova">☼</span>
                  Rising Fast
                </div>
                <span className="qc-gm-ready qc-gm-ready-nova">
                  READY
                </span>
              </div>

              <div className="qc-gm-vs">
                <span>VS</span>
              </div>

              <div className="qc-gm-team qc-gm-team-blaze">
                <div className="qc-gm-hex qc-gm-hex-blaze">
                  {blazeName}
                </div>
                <div className="qc-gm-motto">
                  <span className="qc-gm-motto-blaze">♨</span>
                  Bring the Heat
                </div>
                <span className="qc-gm-ready qc-gm-ready-blaze">
                  READY
                </span>
              </div>
            </div>

            <div className="qc-gm-stats">
              <div className="qc-gm-stat">
                <div className="qc-gm-stat-inner">
                  <strong className="qc-gm-stat-blue">9</strong>
                  <span>Questions</span>
                </div>
              </div>

              <div className="qc-gm-stat">
                <div className="qc-gm-stat-inner">
                  <strong className="qc-gm-stat-purple">2</strong>
                  <span>Teams</span>
                </div>
              </div>

              <div className="qc-gm-stat">
                <div className="qc-gm-stat-inner">
                  <strong className="qc-gm-stat-pink">10k+</strong>
                  <span>XP to Win</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="qc-gm-champion">
          <h2>Your Climb To Champion</h2>
          <p>Every Correct Answer pushes the meter forward</p>

          <div className="qc-gm-progress">
            <div className="qc-gm-track">
              <div className="qc-gm-track-fill" />
            </div>

            {LEVELS.map((level, index) => (
              <div
                key={level.number}
                className={`qc-gm-level qc-gm-level-${index + 1}`}
              >
                <div className={`qc-gm-level-circle ${index === 0 || index === 3 ? "qc-gm-level-special" : ""}`}>
                  {level.icon ? (
                    <span>{level.icon}</span>
                  ) : (
                    level.number
                  )}
                </div>
                <strong>{level.title}</strong>
                <small>{level.xp}</small>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
