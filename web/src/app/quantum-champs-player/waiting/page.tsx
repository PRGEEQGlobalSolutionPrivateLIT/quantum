
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  current,
  findLobby,
  publish,
  subscribe,
  type Lobby,
} from "../lib/lobby";
import "./waiting.css";

export default function Waiting() {
  const router = useRouter();

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [teamId, setTeamId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = current();

    if (!session) {
      router.replace("/quantum-champs-player/access-code");
      return;
    }

    setTeamId(session.teamId);

    const refresh = () => {
      const next = findLobby(session.lobbyId);

      setLobby(next || null);
      setLoaded(true);

      if (!next) return;

      // The first registered team is always the lobby host.
      const firstTeam = next.hostTeam.name.trim().toLowerCase();

      if (firstTeam === "nova" || firstTeam === "blaze") {
        localStorage.setItem("qcFirstRegisteredTeam", firstTeam);
      }

      // Both teams proceed after the first team accepts.
      if (next.status === "ready") {
        const isHost = session.teamId === next.hostTeam.id;
        const isGuest = session.teamId === next.guestTeam.id;

        if (isHost || isGuest) {
          router.replace("/quantum-champs-player/game-mode");
        }
      }
    };

    refresh();

    const unsubscribe = subscribe(refresh);

    // Fallback for changes made in another browser tab.
    const interval = window.setInterval(refresh, 1000);

    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [router]);

  const host =
    !!lobby &&
    teamId === lobby.hostTeam.id;

  const guest =
    !!lobby &&
    teamId === lobby.guestTeam.id;

  const requestPending =
    lobby?.status === "request" &&
    !!lobby.guestTeam.id;

  const novaTeam =
    lobby?.hostTeam.name.toLowerCase() === "nova"
      ? lobby.hostTeam
      : lobby?.guestTeam.name.toLowerCase() === "nova"
        ? lobby.guestTeam
        : null;

  const blazeTeam =
    lobby?.hostTeam.name.toLowerCase() === "blaze"
      ? lobby.hostTeam
      : lobby?.guestTeam.name.toLowerCase() === "blaze"
        ? lobby.guestTeam
        : null;

  const novaJoined = !!novaTeam?.id;
  const blazeJoined = !!blazeTeam?.id;

  function accept() {
    if (!lobby || !host || !requestPending) return;

    const latest = findLobby(lobby.id);

    if (
      !latest ||
      latest.status !== "request" ||
      !latest.guestTeam.id ||
      latest.hostTeam.id !== teamId
    ) {
      setMessage("The join request is no longer available.");
      return;
    }

    publish({
      ...latest,
      status: "ready",
      updatedAt: Date.now(),
    });

    setMessage("");
  }

  function reject() {
    if (!lobby || !host || !requestPending) return;

    const latest = findLobby(lobby.id);

    if (
      !latest ||
      latest.status !== "request" ||
      latest.hostTeam.id !== teamId
    ) {
      setMessage("The join request is no longer available.");
      return;
    }

    const rejectedTeamName = latest.guestTeam.name;

    const otherTeamName =
      latest.hostTeam.name.trim().toLowerCase() === "nova"
        ? "Blaze"
        : "Nova";

    publish({
      ...latest,
      guestTeam: {
        id: "",
        name: otherTeamName,
        members: 0,
        code: "",
        userIds: [],
      },
      status: "waiting",
      requestedAt: undefined,
      updatedAt: Date.now(),
    });

    setMessage(`${rejectedTeamName}'s join request was declined.`);
  }

  const hostName = lobby?.hostTeam.name || "Nova";

  const guestName =
    lobby?.guestTeam.name ||
    (hostName.toLowerCase() === "nova" ? "Blaze" : "Nova");

  const heading =
    requestPending && host
      ? `${guestName} requests to join .....`
      : requestPending && guest
        ? "Waiting for team approval ....."
        : guest && !lobby?.guestTeam.id
          ? "Your join request was declined ....."
          : `Waiting for team ${guestName} to join .....`;

  const novaStatus =
    lobby?.status === "ready" && novaJoined
      ? "Joined"
      : novaJoined && novaTeam?.id === lobby?.guestTeam.id
        ? "Approval pending"
        : novaJoined
          ? `Joined - ${novaTeam?.members ?? 0} Members`
          : "Waiting...";

  const blazeStatus =
    lobby?.status === "ready" && blazeJoined
      ? "Joined"
      : blazeJoined && blazeTeam?.id === lobby?.guestTeam.id
        ? "Approval pending"
        : blazeJoined
          ? `Joined - ${blazeTeam?.members ?? 0} Members`
          : "Waiting...";

  return (
    <main className="qc-wait-root">
      <div className="qc-wait-layout">

        <div className="qc-wait-logo-wrap">
          <span className="qc-wait-ring qc-wait-ring-outer" />
          <span className="qc-wait-ring qc-wait-ring-middle" />
          <span className="qc-wait-ring qc-wait-ring-inner" />

          <span className="qc-wait-star qc-wait-star-one">✦</span>
          <span className="qc-wait-star qc-wait-star-two">✦</span>
          <span className="qc-wait-star qc-wait-star-three">✦</span>
          <span className="qc-wait-star qc-wait-star-four">✦</span>

          <div className="qc-wait-brand">
            <svg
              className="qc-wait-crown"
              viewBox="0 0 110 75"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="qcWaitGold"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop stopColor="#ffe25b" />
                  <stop offset="1" stopColor="#d89410" />
                </linearGradient>
              </defs>

              <path
                d="M8 16 32 38 55 8 77 38 102 16 91 68 19 68Z"
                fill="url(#qcWaitGold)"
              />

              <circle cx="8" cy="16" r="5" fill="#7536aa" />
              <circle cx="55" cy="8" r="5" fill="#7536aa" />
              <circle cx="102" cy="16" r="5" fill="#7536aa" />
            </svg>

            <div className="qc-wait-shield">
              Quantum
              <br />
              Champ
            </div>
          </div>
        </div>

        <h1 className="qc-wait-heading">
          {heading}
        </h1>

        <div className="qc-wait-teams">

          <div className="qc-wait-team qc-wait-team-nova">
            <div className="qc-wait-emblem qc-wait-emblem-nova">
              Nova
            </div>

            <p className="qc-wait-motto">
              <span className="qc-wait-motto-icon">
                ☼
              </span>
              Rising Fast
            </p>

            <span className="qc-wait-pill qc-wait-pill-nova">
              {novaStatus}
            </span>
          </div>

          <div className="qc-wait-vs">
            <span>VS</span>
          </div>

          <div className="qc-wait-team qc-wait-team-blaze">
            <div className="qc-wait-emblem qc-wait-emblem-blaze">
              Blaze
            </div>

            <p className="qc-wait-motto">
              <span className="qc-wait-motto-icon">
                ♨
              </span>
              Bring the Heat
            </p>

            <span className="qc-wait-pill qc-wait-pill-blaze">
              {blazeStatus}
            </span>
          </div>

        </div>

        {requestPending && host ? (
          <div className="qc-wait-actions">
            <button
              className="qc-wait-button"
              type="button"
              onClick={accept}
            >
              Accept Request
            </button>

            <button
              className="qc-wait-button"
              type="button"
              onClick={reject}
            >
              Decline
            </button>
          </div>
        ) : (
          <p className="qc-wait-status">
            {guest && requestPending
              ? "The first team must accept your request."
              : guest && !lobby?.guestTeam.id
                ? "Your request was declined. Return to the access-code page to try again."
                : "The game opens as soon as both teams are in. Stay on this screen."}
          </p>
        )}

        {message && (
          <p className="qc-wait-error" role="status">
            {message}
          </p>
        )}

        {loaded && !lobby && (
          <p className="qc-wait-error" role="alert">
            Lobby not found. Return to the access-code page.
          </p>
        )}

      </div>
    </main>
  );
}
