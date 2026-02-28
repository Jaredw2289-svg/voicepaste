"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Scenario {
  title: string;
  icon: string;
  raw: string;
  items: string[];
}

const SCENARIOS: Scenario[] = [
  {
    title: "Sprint Planning",
    icon: "\u{1F3AF}",
    raw: "OK so for this sprint, first thing is we need to finish the API integration with the payment provider by Wednesday, and then second we should refactor the auth middleware because it's getting really messy and hard to test, third thing is the design team needs to review the new onboarding flow before we start implementing, and oh yeah fourth we have to write migration scripts for the database schema changes",
    items: [
      "Finish payment provider API integration by Wednesday",
      "Refactor auth middleware for testability",
      "Design review for new onboarding flow",
      "Write database schema migration scripts",
    ],
  },
  {
    title: "Meeting Recap",
    icon: "\u{1F4CB}",
    raw: "So the main takeaways from the meeting, first is that we're pushing the launch date to March 15th to give QA more time, second the marketing team wants all product screenshots updated before the launch announcement, and third we agreed to hire two more frontend engineers and Sarah is going to lead the interviews, and then lastly the CEO wants a weekly progress report every Friday starting next week",
    items: [
      "Launch date moved to March 15th for extended QA",
      "Update all product screenshots before launch announcement",
      "Hire 2 frontend engineers — Sarah leads interviews",
      "Weekly progress report to CEO every Friday",
    ],
  },
  {
    title: "Travel Checklist",
    icon: "\u{2708}\u{FE0F}",
    raw: "For my trip to Tokyo next week, first I need to book the hotel near Shibuya station, then second I should exchange some yen at the bank before I leave, third thing is to download offline maps and the transit app because I won't have reliable data, and fourth I need to pack the voltage adapter since Japan uses different plugs, oh and fifth I should message Yuki to confirm our dinner plans on Thursday",
    items: [
      "Book hotel near Shibuya station",
      "Exchange yen at the bank",
      "Download offline maps and transit app",
      "Pack voltage adapter for Japan",
      "Confirm Thursday dinner with Yuki",
    ],
  },
];

export default function ItemizeDemo() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "analyzing" | "itemized" | "pause">("typing");
  const [rawVisible, setRawVisible] = useState("");
  const [showItems, setShowItems] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENARIOS[idx];

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const run = useCallback(() => {
    clear();
    const s = SCENARIOS[idx];
    setPhase("typing");
    setRawVisible("");
    setShowItems(0);

    const T: ReturnType<typeof setTimeout>[] = [];
    let t = 400;

    const words = s.raw.split(" ");
    words.forEach((w, i) => {
      t += 45 + Math.random() * 25;
      T.push(
        setTimeout(
          () => setRawVisible((prev) => (prev ? prev + " " + w : w)),
          t
        )
      );
    });

    t += 600;
    T.push(
      setTimeout(() => {
        setPhase("analyzing");
      }, t)
    );

    t += 1000;
    T.push(
      setTimeout(() => {
        setPhase("itemized");
      }, t)
    );

    for (let i = 1; i <= s.items.length; i++) {
      t += 350;
      T.push(setTimeout(() => setShowItems(i), t));
    }

    t += 3200;
    T.push(
      setTimeout(() => {
        setPhase("pause");
        setIdx((p) => (p + 1) % SCENARIOS.length);
      }, t)
    );

    timers.current = T;
  }, [idx, clear]);

  useEffect(() => {
    run();
    return clear;
  }, [idx, run, clear]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#1a1a18",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid #2a2a26",
          background: "#1f1e1b",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#788c5d", opacity: 0.8 }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3a3a36" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3a3a36" }} />
          </div>
          <span
            style={{
              fontSize: 11,
              color: "#94938c",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            Smart Itemize
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            background: "rgba(120,140,93,0.08)",
            borderRadius: 12,
            border: "1px solid rgba(120,140,93,0.25)",
          }}
        >
          <span style={{ fontSize: 12 }}>{sc.icon}</span>
          <span style={{ fontSize: 10, color: "#788c5d", fontWeight: 600 }}>{sc.title}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: "14px 18px", overflow: "auto", minHeight: 0 }}>
        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background:
                  phase === "typing"
                    ? "#d97757"
                    : phase === "analyzing"
                    ? "#6a9bcc"
                    : "#788c5d",
                boxShadow:
                  phase === "typing"
                    ? "0 0 8px rgba(217,119,87,0.4)"
                    : "none",
                animation: phase === "typing" ? "pulse 1.5s infinite" : "none",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase" as const,
                color:
                  phase === "typing"
                    ? "#d97757"
                    : phase === "analyzing"
                    ? "#6a9bcc"
                    : "#788c5d",
              }}
            >
              {phase === "typing"
                ? "Listening..."
                : phase === "analyzing"
                ? "Detecting structure..."
                : "Itemized \u2713"}
            </span>
          </div>
          {/* Mini waveform */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, height: 18 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 2,
                  borderRadius: 3,
                  backgroundColor: phase === "typing" ? "#788c5d" : "#3a3a36",
                  opacity: phase === "typing" ? 0.4 + (i % 3) * 0.2 : 0.2,
                  height: phase === "typing" ? undefined : 3,
                  animation:
                    phase === "typing"
                      ? `organicWave 1.1s ease-in-out ${i * 0.07}s infinite alternate`
                      : "none",
                  transition: "background-color 0.4s, opacity 0.4s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Raw text - visible during typing and analyzing */}
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.65,
            color: phase === "analyzing" ? "#4a4940" : "#c8c5bc",
            fontStyle: "italic",
            maxHeight: phase === "itemized" ? 0 : 300,
            opacity: phase === "itemized" ? 0 : 1,
            overflow: "hidden",
            transition: "all 0.6s ease",
            marginBottom: phase === "itemized" ? 0 : 10,
          }}
        >
          {rawVisible}
          {phase === "typing" && rawVisible && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 14,
                background: "#d97757",
                marginLeft: 2,
                animation: "blink 0.8s step-end infinite",
                verticalAlign: "text-bottom",
                borderRadius: 1,
              }}
            />
          )}
        </div>

        {/* Structured list */}
        {phase === "itemized" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sc.items.slice(0, showItems).map((item, i) => (
              <div
                key={`${idx}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "9px 12px",
                  background: "rgba(120,140,93,0.05)",
                  borderLeft: "3px solid #788c5d",
                  borderRadius: 8,
                  opacity: 0,
                  animation: `termIn 0.35s ease ${i * 0.06}s forwards`,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(120,140,93,0.15)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#788c5d",
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: "#faf9f5",
                    fontStyle: "normal",
                    fontWeight: 500,
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        style={{
          padding: "7px 16px",
          borderTop: "1px solid #2a2a26",
          background: "#1f1e1b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 10, color: "#64635c" }}>
          {phase === "itemized"
            ? `\u2713 ${sc.items.length} items extracted`
            : phase === "analyzing"
            ? "Analyzing structure..."
            : "Capturing..."}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {SCENARIOS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === idx ? 14 : 5,
                height: 5,
                borderRadius: 3,
                background: i === idx ? "#788c5d" : "#3a3a36",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
