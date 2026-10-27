"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getStartingTeam } from "../lib/lobby";
import { getQuestionRoute } from "../data/questions";
import type { GameMode, MCQQuestion } from "../data/questions";
import {
  advanceToNextQuestion,
  getCurrentQuestion,
  getCurrentQuestionRoute,
  getCurrentTeam,
  getGameMode,
  getTeamProgress,
  getTeamXP,
  isLifelineUsed,
  setCurrentTeam,
  submitAnswer,
  useLifeline as recordLifeline,
} from "../lib/game-engine";
import "./blaze-questions.css";

const ICONS = "/assessmenticons/";
const FEEDBACK_MS = 5000;
const ROUND_SIZE = 3;
const roundNumber = (mode: GameMode, index: number) => mode === "quick" || index >= ROUND_SIZE ? 2 : 1;
const roundQuestionNumber = (_mode: GameMode, index: number) => (index % ROUND_SIZE) + 1;

type View = "question" | "result";
type Lifeline = "blitz" | "boost" | "split";

function Asset({
  name,
  className = "",
  alt = "",
}: {
  name: string;
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      src={`${ICONS}${name}`}
      alt={alt}
      width={64}
      height={64}
      className={className}
      unoptimized
    />
  );
}

export default function BlazeQuestionsPage() {
  const router = useRouter();

  const [question, setQuestion] = useState<MCQQuestion | null>(null);
  const [index, setIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [view, setView] = useState<View>("question");
  const [selected, setSelected] = useState<string | null>(null);
  const [earned, setEarned] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lifelines, setLifelines] = useState({
    blitz: false,
    boost: false,
    split: false,
  });
  const [hidden, setHidden] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mode, setMode] = useState<GameMode>("full");

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerLocked = useRef(false);

  useEffect(() => {
    const selectedMode = getGameMode();
    const firstTeam = getStartingTeam() || "nova";
    const savedTurn = localStorage.getItem("qcCurrentTeam");

    if (savedTurn !== "nova" && savedTurn !== "blaze") {
      setCurrentTeam(firstTeam);
    }

    if (getCurrentTeam() !== "blaze") {
      const other = getCurrentQuestion("nova");
      router.replace(other ? getQuestionRoute(other) : "/quantum-champs-player/nova-questions");
      return;
    }

    const progress = getTeamProgress("blaze");
    const current = getCurrentQuestion("blaze");

    if (selectedMode === "full" && progress.index >= ROUND_SIZE &&
        localStorage.getItem("qcRound2Started") !== "true") {
      router.replace(getCurrentQuestionRoute(getCurrentTeam()));
      return;
    }

    if (!current) {
      setFinished(true);
      router.replace(advanceToNextQuestion("blaze"));
      return;
    }

    if (current.type !== "mcq") {
      router.replace(getQuestionRoute(current));
      return;
    }

    // An already submitted question must never award XP a second time.
    if (Object.prototype.hasOwnProperty.call(progress.answers, current.id)) {
      router.replace(advanceToNextQuestion("blaze"));
      return;
    }

    setMode(selectedMode);
    setIndex(progress.index);
    setXp(getTeamXP("blaze"));
    setQuestion(current);
    setFinished(false);
    setSelected(null);
    setEarned(0);
    setIsCorrect(false);
    setView("question");
    setNotice("");
    setLifelines({
      blitz: isLifelineUsed("blaze", "blitz"),
      boost: isLifelineUsed("blaze", "boost"),
      split: isLifelineUsed("blaze", "split"),
    });

    try {
      const savedHidden = JSON.parse(
        localStorage.getItem(`qcSplitOptions:blaze:${current.id}`) || "[]"
      );
      setHidden(Array.isArray(savedHidden) ? savedHidden.filter((id): id is string => typeof id === "string") : []);
    } catch {
      setHidden([]);
    }

    answerLocked.current = false;
    setReady(true);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [router]);

  const optionOrder = question
    ? [...question.options].sort((a, b) => {
        const order: Record<string, number> = {
          a: 0,
          c: 1,
          b: 2,
          d: 3,
        };

        return (
          (order[a.id.toLowerCase()] ?? 10) -
          (order[b.id.toLowerCase()] ?? 10)
        );
      })
    : [];

  const choose = (id: string) => {
    if (
      !ready ||
      !question ||
      view !== "question" ||
      finished ||
      answerLocked.current ||
      hidden.includes(id) ||
      getCurrentTeam() !== "blaze"
    ) {
      return;
    }

    answerLocked.current = true;
    const result = submitAnswer("blaze", question.id, id);

    if (result.alreadyAnswered) {
      router.replace(advanceToNextQuestion("blaze"));
      return;
    }

    // A failed submission must not advance the game.
    if (!getTeamProgress("blaze").answers[question.id]) {
      answerLocked.current = false;
      return;
    }

    setSelected(id);
    setIsCorrect(result.correct);
    setEarned(result.earnedXP);
    setXp(result.totalXP);
    setNotice("");
    setView("result");
    setReady(false);

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      if (getCurrentTeam() !== "blaze") return;
      router.replace(advanceToNextQuestion("blaze"));
    }, FEEDBACK_MS);
  };

  const useLifeline = (type: Lifeline) => {
    if (
      !question ||
      view !== "question" ||
      !ready ||
      finished ||
      answerLocked.current ||
      lifelines[type] ||
      getCurrentTeam() !== "blaze"
    ) {
      return;
    }

    if (isLifelineUsed("blaze", type)) {
      setLifelines(prev => ({ ...prev, [type]: true }));
      return;
    }

    if (!recordLifeline("blaze", type)) return;
    setLifelines(prev => ({ ...prev, [type]: true }));

    if (type === "split") {
      const incorrect = question.options.filter(o => o.id !== question.correctAnswer);
      const shuffled = [...incorrect];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const removed = shuffled.slice(0, Math.min(2, shuffled.length)).map(o => o.id);
      setHidden(removed);
      localStorage.setItem(`qcSplitOptions:blaze:${question.id}`, JSON.stringify(removed));
      setNotice("50:50 activated — two incorrect options removed.");
    } else {
      router.push(`/quantum-champs-player/lifeline?team=blaze&type=${type}`);
    }
  };

  return (
    <main className="qc-blaze-root">
      <div className="qc-blaze-shell">
        <div className="qc-blaze-logo">
          <Asset
            name="quantum-champ-logo.png"
            alt="Quantum Champ"
          />
        </div>

        {view === "question" && <>
          <div className="qc-blaze-status">
            <span className="qc-blaze-status-label">
              <span className="qc-blaze-sparkle">✧</span> Team Blaze Turn- Round {roundNumber(mode, index)}
            </span>
            <span className="qc-blaze-count">
              Question <strong>{Math.min(roundQuestionNumber(mode, index), ROUND_SIZE)}/{ROUND_SIZE}</strong>
            </span>
          </div>

          <div className="qc-blaze-xp-pill">
            ✦ &nbsp;{xp}XP
          </div>
        </>}

        {finished && (
          <div className="qc-blaze-question">
            Team Blaze has completed its Round {roundNumber(mode, index)} questions.
          </div>
        )}

        {question && !finished && <>
          <div className="qc-blaze-question">
            {roundQuestionNumber(mode, index)}. {question.question}
          </div>

          <div
            className={`qc-blaze-board ${
              view === "result"
                ? "qc-blaze-board-result"
                : ""
            }`}
          >
            {view === "question" ? <>
              <div className="qc-blaze-options">
                {optionOrder.map(option => (
                  <button
                    key={option.id}
                    className={`qc-blaze-option ${hidden.includes(option.id) ? "qc-blaze-option-eliminated" : ""}`}
                    type="button"
                    disabled={
                      !ready ||
                      finished ||
                      hidden.includes(option.id)
                    }
                    onClick={() => choose(option.id)}
                  >
                    <span className="qc-blaze-option-letter">
                      {option.id}
                    </span>
                    <span>{option.text}</span>
                    {hidden.includes(option.id) && <span className="qc-blaze-option-cross" aria-label="Incorrect option eliminated">✕</span>}
                  </button>
                ))}
              </div>

              <div className="qc-blaze-lifelines">
                <button
                  type="button"
                  disabled={lifelines.blitz || !ready || finished}
                  onClick={() => useLifeline("blitz")}
                >
                  <span className="qc-blaze-life qc-blaze-life-blitz">
                    30s
                  </span>
                  <b>Blitz</b>
                </button>

                <button
                  type="button"
                  disabled={lifelines.boost || !ready || finished}
                  onClick={() => useLifeline("boost")}
                >
                  <span className="qc-blaze-life qc-blaze-life-boost">
                    60s
                  </span>
                  <b>Boost</b>
                </button>

                <button
                  type="button"
                  disabled={lifelines.split || !ready || finished}
                  onClick={() => useLifeline("split")}
                >
                  <span className="qc-blaze-life qc-blaze-life-split">
                    50:50
                  </span>
                  <b>Split</b>
                </button>
              </div>

              {notice && (
                <p className="qc-blaze-notice" role="status">
                  {notice}
                </p>
              )}
            </> : <>
              <div className="qc-blaze-score-rail qc-blaze-score-rail-left">
                <span className="qc-blaze-rail-item rail-cyan">☼</span>
                <span className="qc-blaze-rail-item rail-blue">♙</span>
                <span className="qc-blaze-rail-item rail-orange">♙</span>
                <span className="qc-blaze-rail-item rail-olive">
                  ⚑<small>Spark</small>
                </span>
              </div>

              <div className="qc-blaze-score-rail qc-blaze-score-rail-right">
                <span className="qc-blaze-rail-item rail-red">♨</span>
                <span className="qc-blaze-rail-item rail-blue">
                  ♙<small>Elite</small>
                </span>
                <span className="qc-blaze-rail-item rail-orange">
                  ♙<small>Boost</small>
                </span>
                <span className="qc-blaze-rail-item rail-olive">
                  ⚑<small>Spark</small>
                </span>
              </div>

              <div className="qc-blaze-result-center">
                <div className="qc-blaze-selected">
                  <span className="qc-blaze-option-letter">
                    {selected}
                  </span>
                  <span>
                    {question.options.find(
                      o => o.id === selected
                    )?.text}
                  </span>
                </div>

                <div className="qc-blaze-fact">
                  <div>DID YOU KNOW ?</div>
                  <p>{question.explanation}</p>
                </div>

                <div
                  className={`qc-blaze-result-label ${
                    isCorrect
                      ? "qc-blaze-success"
                      : "qc-blaze-failure"
                  }`}
                >
                  <span>{isCorrect ? "✔" : "✖"}</span>
                  {isCorrect
                    ? `Great Work Team Blaze Earns ${earned} XP`
                    : "No XP this time for Team Blaze"}
                </div>
              </div>

              <div className="qc-blaze-total qc-blaze-total-left">
                <span>
                  ⚑<small>Spark</small>
                </span>
                <strong>
                  Total<br />{xp} XP
                </strong>
              </div>

              <div className="qc-blaze-total qc-blaze-total-right">
                <strong>
                  Total<br />{xp} XP
                </strong>
                <span>
                  ⚑<small>Elite</small>
                </span>
              </div>
            </>}
          </div>
        </>}
      </div>
    </main>
  );
}
