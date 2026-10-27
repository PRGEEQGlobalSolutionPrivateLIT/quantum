
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  readLobbies,
  publish,
  setCurrent,
  type Team,
} from "../lib/lobby";
import "./access-code.css";

const DEMO = {
  accessCode: "QC7-XXXX",
  assessmentId: "QC-ASM-001",
  batchId: "QC-BATCH-001",
  title: "Quantum Champ",
  teams: [
    {
      id: "QC-TEAM-001",
      userId: "QC-USER-001",
      name: "Nova",
      members: 12,
    },
    {
      id: "QC-TEAM-002",
      userId: "QC-USER-002",
      name: "Blaze",
      members: 1,
    },
  ],
} as const;

type FieldName = "code" | "userId";
type FieldErrors = Partial<Record<FieldName, string>>;

export default function AccessCode() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [userId, setUserId] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function clearError(field: FieldName) {
    setErrors(previous => ({
      ...previous,
      [field]: undefined,
    }));
  }

  function saveFirstRegisteredTeam(teamName: string, firstTeamName: string) {
    const team = teamName.trim().toLowerCase();
    const firstTeam = firstTeamName.trim().toLowerCase();

    if (
      (team !== "nova" && team !== "blaze") ||
      (firstTeam !== "nova" && firstTeam !== "blaze")
    ) {
      return;
    }

    // Always use the lobby host as the first registered team.
    localStorage.setItem("qcFirstRegisteredTeam", firstTeam);

    // Track the team belonging to this browser session.
    sessionStorage.setItem("qcJoinedTeam", team);

    localStorage.setItem(`qcTeamRegistered_${team}`, "true");
  }

  function join() {
    const nextErrors: FieldErrors = {};

    const enteredCode = code.trim().toUpperCase();
    const enteredUserId = userId.trim().toUpperCase();

    if (!enteredCode) {
      nextErrors.code = "Please enter your assessment access code.";
    } else if (enteredCode !== DEMO.accessCode) {
      nextErrors.code = "Enter the assessment access code QC7-XXXX.";
    }

    if (!enteredUserId) {
      nextErrors.userId = "Please enter your User ID.";
    } else if (
      !DEMO.teams.some(team => team.userId === enteredUserId)
    ) {
      nextErrors.userId = "Enter QC-USER-001 or QC-USER-002.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const identity = DEMO.teams.find(
      team => team.userId === enteredUserId
    );

    if (!identity) return;

    const lobbies = readLobbies();

    // Find the active lobby, regardless of which team created it.
    const existing = lobbies.find(
      lobby =>
        lobby.assessmentId === DEMO.assessmentId &&
        lobby.batchId === DEMO.batchId &&
        lobby.status !== "ready"
    );

    const team: Team = {
      id: identity.id,
      name: identity.name,
      members: identity.members,
      code: DEMO.accessCode,
      userIds: [identity.userId],
    };

    let lobbyId = "";
    let firstTeamName = "";

    if (!existing) {
      // The first team to join creates the lobby.
      // Nova or Blaze can become the host.
      lobbyId = `QC-GAME-${crypto.randomUUID()}`;
      firstTeamName = identity.name;

      const otherTeam = DEMO.teams.find(
        item => item.id !== identity.id
      );

      publish({
        id: lobbyId,
        assessmentId: DEMO.assessmentId,
        batchId: DEMO.batchId,
        assessmentTitle: DEMO.title,
        hostTeam: team,
        guestTeam: {
          id: "",
          name: otherTeam?.name || "",
          members: 0,
          code: "",
          userIds: [],
        },
        status: "waiting",
        firstRegisteredTeam: identity.name.toLowerCase() as "nova" | "blaze",
        firstRegisteredTeamId: identity.id,
        firstRegisteredAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      lobbyId = existing.id;
      firstTeamName = existing.hostTeam.name;

      if (existing.hostTeam.id === identity.id) {
        // The first team is returning to its existing lobby.
      } else {
        if (
          existing.guestTeam.id &&
          existing.guestTeam.id !== identity.id
        ) {
          setErrors({
            userId: "The second team slot is already occupied.",
          });
          return;
        }

        if (existing.status === "request") {
          if (existing.guestTeam.id !== identity.id) {
            setErrors({
              userId: "Another team request is already pending.",
            });
            return;
          }

          // Rejoin the same pending request without duplicating it.
        } else {
          // The second team requests approval from the first team.
          publish({
            ...existing,
            guestTeam: team,
            status: "request",
            requestedAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }
    }

    setCurrent({
      lobbyId,
      teamId: identity.id,
      userId: identity.userId,
      assessmentId: DEMO.assessmentId,
      batchId: DEMO.batchId,
    });

    // Save the first team only after joining successfully.
    saveFirstRegisteredTeam(identity.name, firstTeamName);

    setErrors({});
    router.push("/quantum-champs-player/waiting");
  }

  return (
    <main className="qc-access-root">
      <div className="qc-access-layout">

        <div className="qc-access-logo" aria-label="Quantum Champ">
          <svg
            className="qc-access-crown"
            viewBox="0 0 110 75"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="qcGold"
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
              fill="url(#qcGold)"
            />

            <circle cx="8" cy="16" r="5" fill="#7536aa" />
            <circle cx="55" cy="8" r="5" fill="#7536aa" />
            <circle cx="102" cy="16" r="5" fill="#7536aa" />
          </svg>

          <div className="qc-access-shield">
            Quantum
            <br />
            Champ
          </div>
        </div>

        <h1 className="qc-access-heading">
          Enter your Team’s access Code
        </h1>

        <form
          className="qc-access-form"
          onSubmit={event => {
            event.preventDefault();
            join();
          }}
          noValidate
        >
          <div className="qc-access-fields">

            <div className="qc-access-field">
              <label htmlFor="qc-access-code">
                Team Access Code
              </label>

              <input
                id="qc-access-code"
                className="qc-access-input qc-access-code"
                placeholder="QC7-XXXX"
                value={code}
                aria-invalid={!!errors.code}
                onChange={event => {
                  setCode(event.target.value);
                  clearError("code");
                }}
                autoComplete="off"
              />

              {errors.code && (
                <span
                  className="qc-access-field-error"
                  role="alert"
                >
                  {errors.code}
                </span>
              )}
            </div>

            <div className="qc-access-field">
              <label htmlFor="qc-user-id">
                User ID
              </label>

              <input
                id="qc-user-id"
                className="qc-access-input qc-access-code"
                placeholder="QC-USER-001"
                value={userId}
                aria-invalid={!!errors.userId}
                onChange={event => {
                  setUserId(event.target.value);
                  clearError("userId");
                }}
                autoComplete="off"
              />

              {errors.userId && (
                <span
                  className="qc-access-field-error"
                  role="alert"
                >
                  {errors.userId}
                </span>
              )}

            </div>

          </div>

          <p className="qc-access-hint">
            Your teacher shared this code. Each team has its own.
          </p>

          <button
            className="qc-access-button"
            type="submit"
          >
            Join Game
          </button>
        </form>
      </div>
    </main>
  );
}
