"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { getCurrentQuestion, getCurrentQuestionRoute, getCurrentTeam, getGameMode, getTeamProgress, isLifelineUsed, submitAnswer, advanceToNextQuestion, useLifeline as markLifelineUsed } from "../lib/game-engine";
import type { HiddenQuestion, Team } from "../data/questions";
import "./hidden-questions.css";

const ROOT = "/quantum-champs-player";
const ASSETS = "/assessmenticons/";
const WAIT_MS = 10000;
type LifelineType = "blitz" | "boost" | "split";

function Asset({ name, className = "", alt = "" }: { name: string; className?: string; alt?: string }) {
  return <Image src={`${ASSETS}${name}`} alt={alt} width={80} height={80} className={className} unoptimized />;
}

function HiddenQuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTeam = searchParams.get("team");
  const [team, setTeam] = useState<Team>("nova");
  const [question, setQuestion] = useState<HiddenQuestion | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [hint, setHint] = useState(false);
  const [xp, setXp] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(2);
  const [lifelines, setLifelines] = useState({ blitz: false, boost: false, split: false });
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [earned, setEarned] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);

  useEffect(() => {
    const actualTeam: Team = requestedTeam === "blaze" || requestedTeam === "nova"
      ? requestedTeam
      : getCurrentTeam();
    if (getCurrentTeam() !== actualTeam) {
      router.replace(getCurrentQuestionRoute(getCurrentTeam()));
      return;
    }
    const current = getCurrentQuestion(actualTeam);
    if (!current || current.type !== "hidden") {
      router.replace(getCurrentQuestionRoute(actualTeam));
      return;
    }
    const progress = getTeamProgress(actualTeam);
    const mode = getGameMode();
    setTeam(actualTeam);
    setQuestion(current);
    setXp(progress.xp);
    setQuestionNumber(mode === "quick" ? progress.index + 1 : (progress.index % 3) + 1);
    setLifelines({
      blitz: isLifelineUsed(actualTeam, "blitz"),
      boost: isLifelineUsed(actualTeam, "boost"),
      split: isLifelineUsed(actualTeam, "split"),
    });
    try {
      const saved = JSON.parse(localStorage.getItem(`qcSplitOptions:${actualTeam}:${current.id}`) || "[]");
      setEliminated(Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : []);
    } catch {
      setEliminated([]);
    }
    setSelected([]);
    setRevealed(false);
    setHint(false);
    setEarned(0);
    setCorrect(false);
    setFailedImages([]);
    locked.current = false;
    setReady(true);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [requestedTeam, router]);

  const choose = (id: string) => {
    if (!ready || !question || locked.current || revealed || selected.includes(id) || eliminated.includes(id)) return;
    if (getCurrentTeam() !== team || selected.length >= question.selectionLimit) return;
    const choices = [...selected, id];
    setSelected(choices);
    if (choices.length !== question.selectionLimit) return;

    locked.current = true;
    const result = submitAnswer(team, question.id, choices);
    if (result.alreadyAnswered) {
      router.replace(advanceToNextQuestion(team));
      return;
    }
    const valid = result.correct;
    setCorrect(valid);
    setEarned(result.earnedXP);
    setXp(result.totalXP);
    setRevealed(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (getCurrentTeam() !== team) return;
      router.replace(advanceToNextQuestion(team));
    }, WAIT_MS);
  };

  const activateLifeline = (type: LifelineType) => {
    if (!question || !ready || revealed || locked.current || getCurrentTeam() !== team) return;
    if (lifelines[type] || isLifelineUsed(team, type)) {
      setLifelines(prev => ({ ...prev, [type]: true }));
      return;
    }
    if (type === "split") {
      const wrong = question.tiles.filter(tile => !tile.isCorrect && !selected.includes(tile.id)).slice(0, 2).map(tile => tile.id);
      if (!wrong.length || !markLifelineUsed(team, "split")) return;
      localStorage.setItem(`qcSplitOptions:${team}:${question.id}`, JSON.stringify(wrong));
      setEliminated(wrong);
      setLifelines(prev => ({ ...prev, split: true }));
      return;
    }
    // Consume the selected lifeline before navigating so it stays locked
    // for this team on every subsequent question and after refresh.
    if (!markLifelineUsed(team, type)) return;
    setLifelines(prev => ({ ...prev, [type]: true }));
    router.push(`${ROOT}/lifeline?team=${team}&type=${type}`);
  };

  if (!question) return <main className={`hidden-root hidden-${team}`} />;

  return (
    <main className={`hidden-root hidden-${team}`}>
      <div className="hidden-shell">
        <header className="hidden-header">
          <Asset name="quantum-champ-logo.png" className="hidden-logo" alt="Quantum Champ" />
          <div className="hidden-turn">
            <span className="hidden-turn-title"><span className="hidden-spark">✧</span> Team {team === "nova" ? "Nova" : "Blaze"} Turn- <b>Round 2</b></span>
            <span className="hidden-counter">Question {questionNumber}/3</span>
          </div>
          <div className="hidden-xp"><span>✦</span> {xp}XP</div>
        </header>

        <section className="hidden-stage">
          <h1 className="hidden-question">{questionNumber}. {question.question}</h1>
          <div className="hidden-board">
            {revealed && <>
              <div className="hidden-rail hidden-rail-left">
                <div className="hidden-rail-icon cyan">☼</div>
                <div className="hidden-rail-icon blue">♙</div>
                <div className="hidden-rail-icon orange">♙</div>
                <div className="hidden-rail-icon olive">⚑<small>Total<br />{xp} XP</small></div>
              </div>
              <div className="hidden-rail hidden-rail-right">
                <div className="hidden-rail-icon pink">♨</div>
                <div className="hidden-rail-icon blue">♙<small>Elite</small></div>
                <div className="hidden-rail-icon orange">♙<small>Boost</small></div>
                <div className="hidden-rail-icon olive">⚑<small>Spark</small></div>
              </div>
            </>}

            <div className="hidden-main">
              <div className="hidden-tiles">
                {question.tiles.map((tile, i) => {
                  const imagePath = tile.image || `${ASSETS}hidden-answer-${i + 1}.png`;
                  const showImage = !revealed && !failedImages.includes(tile.id);
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      disabled={!ready || getCurrentTeam() !== team || revealed || selected.includes(tile.id) || eliminated.includes(tile.id)}
                      className={`hidden-tile ${revealed ? "is-revealed" : ""} ${selected.includes(tile.id) ? "is-selected" : ""} ${eliminated.includes(tile.id) ? "is-eliminated" : ""}`}
                      onClick={() => choose(tile.id)}
                      aria-label={revealed ? `${tile.id}: ${tile.text}` : `Select hidden answer ${i + 1}`}
                      aria-pressed={selected.includes(tile.id)}
                    >
                      {revealed ? <><span className="hidden-letter">{tile.id}</span><span className="hidden-answer">{tile.text}</span></> :
                        showImage ? <img src={imagePath} alt={`Hidden choice ${i + 1}`} className="hidden-tile-image" onError={() => setFailedImages(prev => [...prev, tile.id])} /> :
                        <span className="hidden-tile-symbol"><span>✧</span></span>}
                    </button>
                  );
                })}
              </div>
              {!revealed && <button type="button" className="hidden-hint" onClick={() => setHint(v => !v)}>◉ &nbsp;{hint ? "Hide Hint" : "Reveal Hint"}</button>}
              {hint && !revealed && <p className="hidden-hint-text">{question.hint || "Choose three correct answers."}</p>}
              {revealed && <p className="hidden-result" role="status">{correct ? `Correct! Team ${team === "nova" ? "Nova" : "Blaze"} earns ${earned} XP` : "No XP this time"} · Next team in 10 seconds</p>}
              <div className="hidden-lifelines">
                <button type="button" disabled={!ready || revealed || locked.current || getCurrentTeam() !== team || lifelines.blitz} onClick={() => activateLifeline("blitz")}><span className="hidden-life blitz">30s</span><b>Blitz</b></button>
                <button type="button" disabled={!ready || revealed || locked.current || getCurrentTeam() !== team || lifelines.boost} onClick={() => activateLifeline("boost")}><span className="hidden-life boost">60s</span><b>Boost</b></button>
                <button type="button" disabled={!ready || revealed || locked.current || getCurrentTeam() !== team || lifelines.split} onClick={() => activateLifeline("split")}><span className="hidden-life split">50:50</span><b>Split</b></button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function HiddenQuestionsPage() {
  return <Suspense fallback={null}><HiddenQuestionsContent /></Suspense>;
}
