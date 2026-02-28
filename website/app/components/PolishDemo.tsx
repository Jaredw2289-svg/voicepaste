"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TextPart {
  text: string;
  filler: boolean;
}

interface Scenario {
  lang: string;
  flag: string;
  parts: TextPart[];
  clean: string;
}

const SCENARIOS: Scenario[] = [
  {
    lang: "English",
    flag: "\u{1F1FA}\u{1F1F8}",
    parts: [
      { text: "Um, ", filler: true },
      { text: "so ", filler: true },
      { text: "like ", filler: true },
      { text: "I was thinking ", filler: false },
      { text: "maybe ", filler: true },
      { text: "we should ", filler: false },
      { text: "uh ", filler: true },
      { text: "you know, ", filler: true },
      { text: "consider switching to a new, ", filler: false },
      { text: "like, ", filler: true },
      { text: "framework ", filler: false },
      { text: "because the current one is ", filler: false },
      { text: "uh ", filler: true },
      { text: "getting ", filler: false },
      { text: "kind of ", filler: true },
      { text: "slow ", filler: false },
      { text: "and stuff", filler: true },
    ],
    clean: "We should consider switching to a new framework because the current one is getting slow.",
  },
  {
    lang: "\u4E2D\u6587",
    flag: "\u{1F1E8}\u{1F1F3}",
    parts: [
      { text: "\u7136\u540E\u5462\uFF0C", filler: true },
      { text: "\u5C31\u662F\uFF0C", filler: true },
      { text: "\u90A3\u4E2A\uFF0C", filler: true },
      { text: "\u55EF\uFF0C", filler: true },
      { text: "\u6211\u89C9\u5F97", filler: false },
      { text: "\u5C31\u662F\u8BF4 ", filler: true },
      { text: "\u6211\u4EEC\u4E0B\u5468\u7684 ", filler: false },
      { text: "\u90A3\u4E2A ", filler: true },
      { text: "meeting \u53EF\u80FD\u8981 reschedule \u4E00\u4E0B\uFF0C", filler: false },
      { text: "\u56E0\u4E3A ", filler: false },
      { text: "\u90A3\u4E2A\uFF0C", filler: true },
      { text: "\u55EF\uFF0C", filler: true },
      { text: "client \u90A3\u8FB9\u8BF4\u4ED6\u4EEC\u90A3\u5929\u4E0D\u884C", filler: false },
    ],
    clean: "\u6211\u4EEC\u4E0B\u5468\u7684 meeting \u53EF\u80FD\u9700\u8981 reschedule\uFF0C\u56E0\u4E3A client \u90A3\u8FB9\u8BF4\u4ED6\u4EEC\u90A3\u5929\u4E0D\u884C\u3002",
  },
  {
    lang: "\u65E5\u672C\u8A9E",
    flag: "\u{1F1EF}\u{1F1F5}",
    parts: [
      { text: "\u3048\u30FC\u3063\u3068\u3001", filler: true },
      { text: "\u3042\u306E\u3001", filler: true },
      { text: "\u6765\u9031\u306E\u30DF\u30FC\u30C6\u30A3\u30F3\u30B0", filler: false },
      { text: "\u306A\u3093\u3067\u3059\u3051\u3069\u3001", filler: true },
      { text: "\u3061\u3087\u3063\u3068 ", filler: true },
      { text: "\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u3092\u5909\u66F4\u3057\u305F\u65B9\u304C", filler: false },
      { text: "\u3044\u3044\u304B\u306A\u3068\u601D\u3063\u3066\u3001", filler: false },
      { text: "\u305D\u306E\u3001", filler: true },
      { text: "\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u306E\u65B9\u304C\u90FD\u5408\u60AA\u3044", filler: false },
      { text: "\u307F\u305F\u3044\u3067", filler: false },
    ],
    clean: "\u6765\u9031\u306E\u30DF\u30FC\u30C6\u30A3\u30F3\u30B0\u306E\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u3092\u5909\u66F4\u3057\u305F\u65B9\u304C\u3044\u3044\u3068\u601D\u3044\u307E\u3059\u3002\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u306E\u65B9\u304C\u90FD\u5408\u60AA\u3044\u3088\u3046\u3067\u3059\u3002",
  },
];

export default function PolishDemo() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "highlighting" | "clean" | "pause">("typing");
  const [visCount, setVisCount] = useState(0);
  const [showStrike, setShowStrike] = useState(false);
  const [showClean, setShowClean] = useState(false);
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
    setVisCount(0);
    setShowStrike(false);
    setShowClean(false);

    const T: ReturnType<typeof setTimeout>[] = [];
    let t = 400;

    for (let i = 1; i <= s.parts.length; i++) {
      t += 130 + Math.random() * 70;
      T.push(setTimeout(() => setVisCount(i), t));
    }

    t += 500;
    T.push(setTimeout(() => {
      setPhase("highlighting");
      setShowStrike(true);
    }, t));

    t += 900;
    T.push(setTimeout(() => {
      setPhase("clean");
      setShowClean(true);
    }, t));

    t += 3000;
    T.push(setTimeout(() => {
      setPhase("pause");
      setIdx((p) => (p + 1) % SCENARIOS.length);
    }, t));

    timers.current = T;
  }, [idx, clear]);

  useEffect(() => {
    run();
    return clear;
  }, [idx, run, clear]);

  /* waveform bars for "listening" */
  const bars = 12;

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
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#d97757", opacity: 0.8 }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3a3a36" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3a3a36" }} />
          </div>
          <span style={{ fontSize: 11, color: "#94938c", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontWeight: 500 }}>
            AI Polish
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            background: "rgba(217,119,87,0.08)",
            borderRadius: 12,
            border: "1px solid rgba(217,119,87,0.2)",
          }}
        >
          <span style={{ fontSize: 13 }}>{sc.flag}</span>
          <span style={{ fontSize: 10, color: "#d97757", fontWeight: 600 }}>{sc.lang}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: "16px 18px", overflow: "auto", minHeight: 0 }}>
        {/* Status + waveform row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: phase === "typing" ? "#d97757" : "#788c5d",
                boxShadow: phase === "typing" ? "0 0 8px rgba(217,119,87,0.4)" : "none",
                animation: phase === "typing" ? "pulse 1.5s infinite" : "none",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase" as const,
                color: phase === "typing" ? "#d97757" : phase === "highlighting" ? "#6a9bcc" : "#788c5d",
              }}
            >
              {phase === "typing"
                ? "Listening..."
                : phase === "highlighting"
                ? "Processing..."
                : "Polished \u2713"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 2, height: 18 }}>
            {Array.from({ length: bars }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 2,
                  borderRadius: 3,
                  backgroundColor: phase === "typing" ? "#d97757" : "#3a3a36",
                  opacity: phase === "typing" ? 0.4 + (i % 3) * 0.2 : 0.2,
                  height: phase === "typing" ? undefined : 3,
                  animation:
                    phase === "typing"
                      ? `organicWave 1s ease-in-out ${i * 0.06}s infinite alternate`
                      : "none",
                  transition: "background-color 0.4s, opacity 0.4s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Raw text */}
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: showClean ? "#4a4940" : "#c8c5bc",
            fontStyle: "italic",
            transition: "color 0.5s",
          }}
        >
          {sc.parts.slice(0, visCount).map((part, i) => (
            <span
              key={`${idx}-${i}`}
              style={{
                color: part.filler && showStrike ? "#d97757" : undefined,
                textDecoration: part.filler && showStrike ? "line-through" : "none",
                textDecorationColor: "#d97757",
                opacity: part.filler && showClean ? 0.2 : 1,
                transition: "all 0.4s ease",
              }}
            >
              {part.text}
            </span>
          ))}
          {phase === "typing" && visCount > 0 && (
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

        {/* Clean text */}
        {showClean && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              background: "rgba(120,140,93,0.06)",
              borderLeft: "3px solid #788c5d",
              borderRadius: 8,
              fontSize: 14,
              fontStyle: "normal",
              lineHeight: 1.6,
              color: "#faf9f5",
              fontWeight: 500,
              opacity: 0,
              animation: "slideIn 0.5s ease forwards",
            }}
          >
            {sc.clean}
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
          {showClean
            ? `\u2713 ${sc.parts.filter((p) => p.filler).length} filler words removed`
            : phase === "typing"
            ? `${visCount}/${sc.parts.length} segments`
            : "Analyzing..."}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {SCENARIOS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === idx ? 14 : 5,
                height: 5,
                borderRadius: 3,
                background: i === idx ? "#d97757" : "#3a3a36",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
