"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getStartingTeam } from "../lib/lobby";
import { getQuestionsByTeam } from "../data/questions";
import type { MCQQuestion, GameMode } from "../data/questions";
import {
  advanceToNextQuestion,
  getCurrentQuestionRoute,
  getCurrentTeam,
  getGameMode,
  getTeamProgress,
  getTeamXP,
  isLifelineUsed,
  submitAnswer,
  useLifeline as recordLifeline,
} from "../lib/game-engine";
import "./nova-questions.css";

const ICONS = "/assessmenticons/";
const TURN_KEY = "qcCurrentTeam";
const FEEDBACK_MS = 5000;
const ROUND_ONE_COUNT = 3;
const getRound = (index: number, mode: GameMode) => mode === "quick" || index >= ROUND_ONE_COUNT ? 2 : 1;
const getRoundQuestionNumber = (index: number, mode: GameMode) => mode === "quick" ? index + 1 : index % ROUND_ONE_COUNT + 1;
const getRoundQuestionTotal = (_mode: GameMode) => ROUND_ONE_COUNT;

type View = "question" | "result";

function Asset({ name, className = "", alt = "" }: { name: string; className?: string; alt?: string }) {
  return <Image src={`${ICONS}${name}`} alt={alt} width={64} height={64} className={className} unoptimized />;
}

export default function NovaQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [view, setView] = useState<View>("question");
  const [selected, setSelected] = useState<string | null>(null);
  const [lifelines, setLifelines] = useState({ blitz: false, boost: false, split: false });
  const [hidden, setHidden] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mode, setMode] = useState<GameMode>("full");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerLocked = useRef(false);

  useEffect(() => {
    const selectedMode = getGameMode();
    const allQuestions = getQuestionsByTeam("nova", selectedMode);
    const progress = getTeamProgress("nova");
    const current = allQuestions[progress.index];
    const mcqQuestions = allQuestions.filter((q): q is MCQQuestion => q.type === "mcq");

    setMode(selectedMode);
    setQuestions(mcqQuestions);
    setIndex(progress.index);
    setXp(getTeamXP("nova"));
    setFinished(progress.index >= allQuestions.length);

    // Follow the lobby's first registered team when no turn has been stored.
    const savedTurn = localStorage.getItem(TURN_KEY);
    if (savedTurn !== "nova" && savedTurn !== "blaze") {
      const first = getStartingTeam() || "nova";
      localStorage.setItem(TURN_KEY, first);
      localStorage.setItem("qcFirstRegisteredTeam", first);
    }

    if (getCurrentTeam() !== "nova") {
      router.replace(getCurrentQuestionRoute());
      return;
    }

    // MCQ is rendered here; other question types have their own existing pages.
    if (current && current.type !== "mcq") {
      router.replace(getCurrentQuestionRoute("nova"));
      return;
    }

    if (selectedMode === "full" && progress.index >= ROUND_ONE_COUNT &&
        localStorage.getItem("qcRound2Started") !== "true") {
      router.replace("/quantum-champs-player/round-2-start");
      return;
    }

    setLifelines({
      blitz: isLifelineUsed("nova", "blitz") || localStorage.getItem("qcLifelineUsed:nova:blitz") === "1",
      boost: isLifelineUsed("nova", "boost") || localStorage.getItem("qcLifelineUsed:nova:boost") === "1",
      split: isLifelineUsed("nova", "split") || localStorage.getItem("qcLifelineUsed:nova:split") === "1",
    });

    try {
      const savedHidden = JSON.parse(sessionStorage.getItem(`qcLifelineHidden:nova:${current?.id}`) || "[]");
      setHidden(Array.isArray(savedHidden) ? savedHidden.filter((id): id is string => typeof id === "string") : []);
    } catch {
      setHidden([]);
    }

    setSelected(null);
    setNotice("");
    setView("question");
    setReady(true);
    answerLocked.current = false;

    // Recover an answered question after a refresh without awarding XP twice.
    if (current && Object.prototype.hasOwnProperty.call(progress.answers, current.id)) {
      let savedAnswer: string | null = null;
      try {
        const record = JSON.parse(progress.answers[current.id]);
        savedAnswer = typeof record?.answer === "string" ? record.answer : null;
      } catch {
        savedAnswer = progress.answers[current.id];
      }
      if (savedAnswer !== null) {
        setSelected(savedAnswer);
        setView("result");
        setReady(false);
        answerLocked.current = true;
        timer.current = setTimeout(() => {
          if (getCurrentTeam() === "nova") {
            router.replace(advanceToNextQuestion("nova"));
          }
        }, FEEDBACK_MS);
      }
    }

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [router]);

  const question = questions.find(q => q.id === getQuestionsByTeam("nova", mode)[index]?.id);
  const total = getRoundQuestionTotal(mode);
  const round = getRound(index, mode);
  const roundQuestion = getRoundQuestionNumber(index, mode);
  const isCorrect = Boolean(question && selected === question.correctAnswer);
  const earned = isCorrect ? (question?.xp ?? 1000) : 0;

  const choose = (id: string) => {
    if (!question || view !== "question" || !ready || finished ||
        answerLocked.current || hidden.includes(id) ||
        getCurrentTeam() !== "nova") return;

    answerLocked.current = true;
    const result = submitAnswer("nova", question.id, id);
    if (result.alreadyAnswered) return;

    setSelected(id);
    setXp(result.totalXP);
    setView("result");
    setNotice("");
    setReady(false);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (getCurrentTeam() !== "nova") return;
      router.replace(advanceToNextQuestion("nova"));
    }, FEEDBACK_MS);
  };

  const useLifeline = (type: "blitz" | "boost" | "split") => {
    if (!question || view !== "question" || !ready || finished ||
        answerLocked.current || lifelines[type] ||
        localStorage.getItem(TURN_KEY) !== "nova") return;

    const usedKey = `qcLifelineUsed:nova:${type}`;
    if (isLifelineUsed("nova", type) || localStorage.getItem(usedKey) === "1") return;
    if (!recordLifeline("nova", type)) return;

    setLifelines(prev => ({ ...prev, [type]: true }));

    if (type === "split") {
      const incorrect = question.options.filter(o => o.id !== question.correctAnswer);
      const shuffled = [...incorrect];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const removed = shuffled.slice(0, 2).map(o => o.id);
      sessionStorage.setItem(`qcLifelineHidden:nova:${question.id}`, JSON.stringify(removed));
      setHidden(removed);
      setNotice("50:50 activated — two incorrect options removed.");
    } else {
      router.push(`/quantum-champs-player/lifeline?team=nova&type=${type}`);
    }
  };

  return (
    <main className="qc-nova-root">
      <div className="qc-nova-shell">
        <div className="qc-nova-logo"><Asset name="quantum-champ-logo.png" alt="Quantum Champ" /></div>

        {view === "question" && <div className="qc-nova-status">
          <span>✧ &nbsp;Team Nova Turn- Round {round}</span>
          <span className="qc-nova-count">Question <strong>{Math.min(roundQuestion, total)}/{total}</strong></span>
        </div>}

        {view === "question" && <div className="qc-nova-xp-pill">✦ &nbsp;{xp}XP</div>}

        {finished && <div className="qc-nova-question">Team Nova has completed its questions.</div>}

        {question && <>
          <div className="qc-nova-question">{roundQuestion}. {question.question}</div>

          <div className={`qc-nova-board ${view === "result" ? "qc-nova-board-result" : ""}`}>
            {view === "question" ? <>
              <div className="qc-nova-options">
                {question.options.map(option => <button
                  key={option.id}
                  className={`qc-nova-option ${hidden.includes(option.id) ? "qc-nova-option-eliminated" : ""}`}
                  type="button"
                  disabled={!ready || finished || hidden.includes(option.id)}
                  onClick={() => choose(option.id)}
                ><span className="qc-nova-option-letter">{option.id}</span><span>{option.text}</span>{hidden.includes(option.id) && <span className="qc-nova-option-cross" aria-label="Eliminated">✕</span>}</button>)}
              </div>

              <div className="qc-nova-lifelines">
                <button disabled={lifelines.blitz || !ready || finished} onClick={() => useLifeline("blitz")} type="button"><span className="qc-nova-life qc-nova-life-blitz">30s</span><b>Blitz</b></button>
                <button disabled={lifelines.boost || !ready || finished} onClick={() => useLifeline("boost")} type="button"><span className="qc-nova-life qc-nova-life-boost">60s</span><b>Boost</b></button>
                <button disabled={lifelines.split || !ready || finished} onClick={() => useLifeline("split")} type="button"><span className="qc-nova-life qc-nova-life-split">50:50</span><b>Split</b></button>
              </div>

              {notice && <p className="qc-nova-notice" role="status">{notice}</p>}
            </> : <>
              <div className="qc-nova-score-rail qc-nova-score-rail-left"><span>☼</span><span>♙</span><span>♙</span><span>⚑</span></div>
              <div className="qc-nova-score-rail qc-nova-score-rail-right"><span>♨</span><span>♙</span><span>♙</span><span>♙</span></div>

              <div className="qc-nova-result-center">
                <div className="qc-nova-selected"><span className="qc-nova-option-letter">{selected}</span>{question.options.find(o => o.id === selected)?.text}</div>
                <div className="qc-nova-fact"><div>DID YOU KNOW ?</div><p>{question.explanation}</p></div>

                <div className={`qc-nova-result-label ${isCorrect ? "qc-nova-success" : "qc-nova-failure"}`}>
                  <span>{isCorrect ? "✔" : "✖"}</span>
                  {isCorrect ? `Great Work Team Nova Earns ${earned} XP` : "No XP this time for Team Nova"}
                </div>
              </div>

              <div className="qc-nova-total">⚑ <span>Total<br />{xp} XP</span></div>
            </>}
          </div>
        </>}
      </div>
    </main>
  );
}
