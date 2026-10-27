
"use client";

import { useRouter } from "next/navigation";
import "./ai-essentials.css";

export default function AIEssentials() {
  const router = useRouter();

  return (
    <main className="qc-ai-root">
      <div className="qc-ai-container">

        <div className="qc-ai-logo">
          <svg
            className="qc-ai-crown"
            viewBox="0 0 110 75"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="qcAiGold" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#ffe25b" />
                <stop offset="1" stopColor="#d89410" />
              </linearGradient>
            </defs>
            <path
              d="M8 16 32 38 55 8 77 38 102 16 91 68 19 68Z"
              fill="url(#qcAiGold)"
            />
            <circle cx="8" cy="16" r="5" fill="#7536aa" />
            <circle cx="55" cy="8" r="5" fill="#7536aa" />
            <circle cx="102" cy="16" r="5" fill="#7536aa" />
          </svg>

          <div className="qc-ai-shield">
            Quantum
            <br />
            Champ
          </div>
        </div>

        <div className="qc-ai-title-wrap">
          <h1 className="qc-ai-title">
            AI Essentials at a Glance
          </h1>
        </div>

        <section className="qc-ai-card">
          <div className="qc-ai-card-content">
            <h2 className="qc-ai-card-heading">
              What makes this course different?
            </h2>

            <div className="qc-ai-points">
              <div className="qc-ai-point">
               <span className="qc-ai-check" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M9 3.5H6.5C5.4 3.5 4.5 4.4 4.5 5.5V8M15 3.5H17.5C18.6 3.5 19.5 4.4 19.5 5.5V8M19.5 15.5V18C19.5 19.1 18.6 20 17.5 20H15M9 20H6.5C5.4 20 4.5 19.1 4.5 18V15.5"
      stroke="#5361E8"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 11.5L10.8 14.7L17 8"
      stroke="#E51D82"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 6.5L9.5 4M17 17.5L14.5 20"
      stroke="#E51D82"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
</span>
                <p>
                  Learn ML, Gen AI, and prompt design in a fun team format.
                </p>
              </div>

              <div className="qc-ai-point">
               <span className="qc-ai-check" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M9 3.5H6.5C5.4 3.5 4.5 4.4 4.5 5.5V8M15 3.5H17.5C18.6 3.5 19.5 4.4 19.5 5.5V8M19.5 15.5V18C19.5 19.1 18.6 20 17.5 20H15M9 20H6.5C5.4 20 4.5 19.1 4.5 18V15.5"
      stroke="#5361E8"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 11.5L10.8 14.7L17 8"
      stroke="#E51D82"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 6.5L9.5 4M17 17.5L14.5 20"
      stroke="#E51D82"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
</span>
                <p>
                  One session builds practical AI skills for everyday use.
                </p>
              </div>

              <div className="qc-ai-point">
               <span className="qc-ai-check" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M9 3.5H6.5C5.4 3.5 4.5 4.4 4.5 5.5V8M15 3.5H17.5C18.6 3.5 19.5 4.4 19.5 5.5V8M19.5 15.5V18C19.5 19.1 18.6 20 17.5 20H15M9 20H6.5C5.4 20 4.5 19.1 4.5 18V15.5"
      stroke="#5361E8"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 11.5L10.8 14.7L17 8"
      stroke="#E51D82"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 6.5L9.5 4M17 17.5L14.5 20"
      stroke="#E51D82"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
</span>
                <p>
                  Build confidence using AI safely and effectively.
                </p>
              </div>
            </div>

            <h3 className="qc-ai-highlight">
              AI Learning! Made Fun &amp; Social
            </h3>

            <p className="qc-ai-description">
              Covers ML, GenAI, prompting &amp; responsible AI.
              Updated every 8 months.
            </p>
          </div>
        </section>

        <button
          type="button"
          className="qc-ai-next"
          onClick={() =>
            router.push("/quantum-champs-player/lets-play")
          }
        >
          Next
        </button>

      </div>
    </main>
  );
}
