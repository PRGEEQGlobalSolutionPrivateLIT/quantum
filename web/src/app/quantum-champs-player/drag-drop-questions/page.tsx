"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  advanceToNextQuestion,
  getCurrentQuestion,
  getCurrentQuestionRoute,
  getCurrentTeam,
  getGameMode,
  getTeamProgress,
  getTeamXP,
  isLifelineUsed,
  submitAnswer,
} from "../lib/game-engine";
import type { DragDropQuestion, Team } from "../data/questions";
import "./drag-drop-questions.css";

type Step = { id: string; label: string; icon: string };
type DragQuestion = {
  id: string;
  question: string;
  xp: number;
  steps: Step[];
  correctOrder: string[];
  hint?: string;
};
type Progress = { index: number; xp: number; answers: Record<string, string> };

const defaultQuestion: DragQuestion = {
  id: "drag-round2-4",
  question: "Provide an overview of how an AI model learns and gives an answer.",
  xp: 1600,
  steps: [
    { id: "train", label: "Train the Model", icon: "🪐" },
    { id: "test", label: "Test and Improve", icon: "📋" },
    { id: "answer", label: "Give an Answer", icon: "🤖" },
    { id: "collect", label: "Collect Data", icon: "🛢️" },
  ],
  correctOrder: ["collect", "train", "test", "answer"],
};

const storageTeam = (team: Team) => team === "nova" ? "Nova" : "Blaze";
const stepIcons: Record<string, string> = {
  train: "🪐", test: "📋", answer: "🤖", collect: "🛢️",
};

function toDisplayQuestion(question: DragDropQuestion): DragQuestion {
  return {
    id: question.id,
    question: question.question,
    xp: question.xp,
    hint: question.hint,
    steps: question.steps.map(step => ({
      id: step.id,
      label: step.text,
      icon: stepIcons[step.id] || "✧",
    })),
    correctOrder: question.correctOrder,
  };
}

function DragDropQuestionsContent() {
  const router = useRouter();
  const params = useSearchParams();

  const team: Team = params.get("team") === "blaze" ? "blaze" : "nova";

  const teamName = storageTeam(team);

  const [question, setQuestion] = useState(defaultQuestion);

  const [order, setOrder] = useState<string[]>(
    defaultQuestion.steps.map(s => s.id)
  );

  const [progress, setProgress] = useState<Progress>({
    index: 3,
    xp: 0,
    answers: {},
  });

  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [earned, setEarned] = useState(0);
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState(false);

  const [used, setUsed] = useState({
    blitz: false,
    boost: false,
    split: false,
  });

  const dragged = useRef<number | null>(null);
  const locked = useRef(false);

  const [mode, setMode] = useState<"full" | "quick">("full");
  const [novaXP, setNovaXP] = useState(0);
  const [blazeXP, setBlazeXP] = useState(0);

  useEffect(() => {
    setMode(getGameMode());
    const activeTeam = getCurrentTeam();
    const activeQuestion = getCurrentQuestion(activeTeam);
    if (activeTeam !== team || !activeQuestion || activeQuestion.type !== "drag-drop") {
      router.replace(getCurrentQuestionRoute(activeTeam));
      return;
    }

    const data = toDisplayQuestion(activeQuestion);
    const savedProgress = getTeamProgress(team);
    setQuestion(data);
    setOrder(data.steps.map(step => step.id));
    setProgress(savedProgress);
    setNovaXP(getTeamXP("nova"));
    setBlazeXP(getTeamXP("blaze"));
    setUsed({
      blitz: isLifelineUsed(team, "blitz"),
      boost: isLifelineUsed(team, "boost"),
      split: isLifelineUsed(team, "split"),
    });
    setRevealed(false);
    setCorrect(false);
    setEarned(0);
    setHint(false);
    setReady(true);
    locked.current = false;
  }, [router, team]);

  const move = (from: number, to: number) => {
    if (
      !ready ||
      getCurrentTeam() !== team ||
      revealed ||
      from === to ||
      from < 0 ||
      to < 0 ||
      to >= order.length
    ) {
      return;
    }

    setOrder(previous => {
      const copy = [...previous];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const submit = () => {
    if (!ready || revealed || locked.current || getCurrentTeam() !== team) return;
    const active = getCurrentQuestion(team);
    if (!active || active.type !== "drag-drop" || active.id !== question.id) return;

    locked.current = true;
    const result = submitAnswer(team, question.id, order);
    if (result.alreadyAnswered) {
      locked.current = false;
      return;
    }

    setCorrect(result.correct);
    setEarned(result.earnedXP);
    setRevealed(true);
    setProgress(getTeamProgress(team));
    setNovaXP(getTeamXP("nova"));
    setBlazeXP(getTeamXP("blaze"));
    // Keep result visible until Next Question is clicked.
  };

  const handleNextQuestion = () => {
    if (!revealed || !locked.current || getCurrentTeam() !== team) return;
    router.replace(advanceToNextQuestion(team));
  };

  const activate = (type: "blitz" | "boost" | "split") => {
    if (!ready || revealed || used[type] || getCurrentTeam() !== team) return;

    if (type === "split") {
      // Split is not meaningful for an ordering question.
      // Do not consume the lifeline.
      setHint(true);
      return;
    }

    router.push(
      `/quantum-champs-player/lifeline?team=${team}&type=${type}`
    );
  };

  return (
    <main className={`qc-drag-root qc-drag-${team}`}>
      <div className="qc-drag-shell">
        <div className="qc-drag-logo">
          <Image
            src="/assessmenticons/quantum-champ-logo.png"
            alt="Quantum Champ"
            width={65}
            height={65}
            unoptimized
          />
        </div>

        <div className="qc-drag-status">
          <span className="qc-drag-turn">
            ✧ &nbsp;Team {teamName} Turn- <b>Round 2</b>
          </span>

          <span className="qc-drag-count">
            Question {mode === "quick" ? progress.index + 1 : progress.index % 3 + 1}/3
          </span>
        </div>

        <div className="qc-drag-xp">
          ✦ &nbsp;{progress.xp}XP
        </div>

        <div className="qc-drag-question">
          {mode === "quick" ? progress.index + 1 : progress.index % 3 + 1}. {question.question}
        </div>

        <div className="qc-drag-board">
          <div className="qc-drag-rail qc-drag-left">
            <div className="qc-drag-rail-item cyan">
              ☼
            </div>

            <div className="qc-drag-rail-item blue">
              ♙
            </div>

            <div className="qc-drag-rail-item orange">
              ♙
            </div>

            <div className="qc-drag-rail-item olive">
              ⚑
              <small>
                Total
                <br />
                {novaXP} XP
              </small>
            </div>
          </div>

          <div className="qc-drag-rail qc-drag-right">
            <div className="qc-drag-rail-item red">
              ♨
            </div>

            <div className="qc-drag-rail-item blue">
              ♙
              <small>
                Total
                <br />
                {blazeXP} XP
              </small>
            </div>

            <div className="qc-drag-rail-item orange">
              ⚑
              <small>Boost</small>
            </div>

            <div className="qc-drag-rail-item olive">
              ⚑
              <small>Spark</small>
            </div>
          </div>

          <div className="qc-drag-content">
            <div className="qc-drag-grid">
              {order.map((id, index) => {
                const step = question.steps.find(
                  s => s.id === id
                )!;

                return (
                  <div
                    key={id}
                    className={`qc-drag-tile ${
                      revealed
                        ? correct
                          ? "qc-drag-correct"
                          : "qc-drag-wrong"
                        : ""
                    }`}
                    draggable={!revealed && ready && getCurrentTeam() === team}
                    onDragStart={event => {
                      dragged.current = index;
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={event => {
                      if (!revealed) {
                        event.preventDefault();
                      }
                    }}
                    onDrop={event => {
                      event.preventDefault();

                      if (dragged.current !== null) {
                        move(dragged.current, index);
                      }

                      dragged.current = null;
                    }}
                    onDragEnd={() => {
                      dragged.current = null;
                    }}
                  >
                    <span className="qc-drag-number">
                      {index + 1}
                    </span>

                    <span className="qc-drag-inner">
                      <span className="qc-drag-icon">
                        {step.icon}
                      </span>

                      <span>{step.label}</span>
                    </span>

                    {!revealed && (
                      <span className="qc-drag-mobile-controls">
                        <button
                          type="button"
                          aria-label={`Move ${step.label} earlier`}
                          disabled={index === 0}
                          onClick={() =>
                            move(index, index - 1)
                          }
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          aria-label={`Move ${step.label} later`}
                          disabled={
                            index === order.length - 1
                          }
                          onClick={() =>
                            move(index, index + 1)
                          }
                        >
                          ↓
                        </button>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {revealed ? (
              <>
                <div
                  role="status"
                  className={`qc-drag-result ${
                    correct ? "success" : "failure"
                  }`}
                >
                  <span>
                    {correct ? "✿" : "✖"}
                  </span>

                  {correct
                    ? `Great Work Team ${teamName} Earns ${earned} XP`
                    : `No XP this time for Team ${teamName}`}
                </div>

                <div className="qc-drag-actions">
                  <button
                    className="qc-drag-submit"
                    type="button"
                    onClick={handleNextQuestion}
                  >
                    Next Question
                  </button>
                </div>
              </>
            ) : (
              <div className="qc-drag-actions">
                <button
                  className="qc-drag-submit"
                  type="button"
                  onClick={submit}
                  disabled={!ready || getCurrentTeam() !== team}
                >
                  Check Answer
                </button>

                <button
                  className="qc-drag-hint"
                  type="button"
                  onClick={() =>
                    setHint(value => !value)
                  }
                >
                  Reveal Hint
                </button>

                {hint && (
                  <p className="qc-drag-hint-text">
                    Arrange the steps in the order an AI
                    system learns and responds.
                  </p>
                )}
              </div>
            )}

            {!revealed && (
              <div className="qc-drag-lifelines">
                <button
                  type="button"
                  disabled={used.blitz}
                  onClick={() => activate("blitz")}
                >
                  <span className="blitz">
                    30s
                  </span>
                  <b>Blitz</b>
                </button>

                <button
                  type="button"
                  disabled={used.boost}
                  onClick={() => activate("boost")}
                >
                  <span className="boost">
                    60s
                  </span>
                  <b>Boost</b>
                </button>

                <button
                  type="button"
                  disabled={used.split}
                  onClick={() => activate("split")}
                >
                  <span className="split">
                    50:50
                  </span>
                  <b>Split</b>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DragDropQuestionsPage() {
  return (
    <Suspense fallback={null}>
      <DragDropQuestionsContent />
    </Suspense>
  );
}
