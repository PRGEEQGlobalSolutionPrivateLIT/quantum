"use client";

import { useRouter } from "next/navigation";
import "./player.css";

export default function QuantumChampsWelcome() {
  const router = useRouter();

  return (
    <main className="qp-welcome-root">
      <section className="qp-welcome-panel" aria-label="Quantum Champs welcome">
        <div className="qp-welcome-content">
          <div className="qp-welcome-orbit" aria-label="Quantum Champ">
            <span className="qp-welcome-ring qp-welcome-ring-outer" />
            <span className="qp-welcome-ring qp-welcome-ring-middle" />
            <span className="qp-welcome-ring qp-welcome-ring-inner" />
            <span className="qp-welcome-sparkle qp-welcome-sparkle-1">✦</span>
            <span className="qp-welcome-sparkle qp-welcome-sparkle-2">✦</span>
            <span className="qp-welcome-sparkle qp-welcome-sparkle-3">✦</span>
            <span className="qp-welcome-sparkle qp-welcome-sparkle-4">✦</span>
            <span className="qp-welcome-sparkle qp-welcome-sparkle-5">✦</span>
            <div className="qp-welcome-logo">
              <svg className="qp-welcome-crown" viewBox="0 0 124 91" aria-hidden="true">
                <defs><linearGradient id="qpCrownGold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#f9d451"/><stop offset=".55" stopColor="#e6a81b"/><stop offset="1" stopColor="#bd7b0b"/></linearGradient></defs>
                <path d="M9 23 31 42 62 7 88 42 115 23 102 81H24Z" fill="url(#qpCrownGold)"/>
                <circle cx="9" cy="23" r="5" fill="#7435ba"/><circle cx="62" cy="7" r="5" fill="#7435ba"/><circle cx="115" cy="23" r="5" fill="#7435ba"/>
                <circle cx="62" cy="52" r="2.3" fill="#a20d63"/>
              </svg>
              <div className="qp-welcome-shield">Quantum<br />Champ</div>
            </div>
          </div>
          <h1 className="qp-welcome-title">Play Smart! Rise to Glory</h1>
          <button className="qp-welcome-button" type="button" onClick={() => router.push("/quantum-champs-player/access-code")}>Are you Ready?</button>
        </div>
      </section>
    </main>
  );
}
