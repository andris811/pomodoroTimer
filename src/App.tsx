import { useEffect, useRef, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const MODES = {
  // pomodoro: 25 * 60,
  // short: 5 * 60,
  // long: 15 * 60,
  pomodoro: 10 * 1,
  short: 5 * 1,
  long: 15 * 1,
} as const;

type Mode = keyof typeof MODES;

export default function App() {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(MODES[mode]);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [countdownToAutoStart, setCountdownToAutoStart] = useState(20);

  const intervalRef = useRef<number | null>(null);
  const autoStartTimeout = useRef<number | null>(null);
  const countdownInterval = useRef<number | null>(null);

  useEffect(() => {
    setTimeLeft(MODES[mode]);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [mode]);

  useEffect(() => {
    if (isRunning && intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setIsRunning(false);

            let nextMode: Mode;
            let nextSessions = completedSessions;

            if (mode === "pomodoro") {
              nextSessions += 1;
              setCompletedSessions(nextSessions);
              nextMode = nextSessions % 4 === 0 ? "long" : "short";
            } else {
              nextMode = "pomodoro";
            }

            // Show auto-start prompt
            setShowPrompt(true);
            setCountdownToAutoStart(20);

            // Start countdown
            countdownInterval.current = window.setInterval(() => {
              setCountdownToAutoStart(prev => {
                if (prev <= 1) {
                  clearInterval(countdownInterval.current!);
                  countdownInterval.current = null;
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);

            // Delay mode switch by 20000ms to show ✔️ first
            autoStartTimeout.current = window.setTimeout(() => {
              setShowPrompt(false);
              setMode(nextMode);
              setTimeLeft(MODES[nextMode]);
              setIsRunning(true);
            }, 20000);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, mode, completedSessions]);

  useEffect(() => {
    return () => {
      if (autoStartTimeout.current) clearTimeout(autoStartTimeout.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  const getStageLabel = () => {
    switch (mode) {
      case "pomodoro":
        return { text: "Focus Time", color: "text-white/90" };
      case "short":
        return { text: "Short Break", color: "text-green-200" };
      case "long":
        return { text: "Long Break", color: "text-blue-200" };
    }
  };

  const bgColor =
    mode === "pomodoro"
      ? "bg-[#BA4949]"
      : mode === "short"
      ? "bg-[#38858A]"
      : "bg-[#397097]";

  return (
    <div className={`${bgColor} text-white h-screen flex flex-col items-center justify-between p-8`}>
      {/* Top Tabs */}
      <div className="flex gap-4 mt-8">
        {(["pomodoro", "short", "long"] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-medium uppercase tracking-widest transition ${
              mode === m ? "bg-white text-black" : "bg-transparent border border-white"
            }`}
          >
            {m === "pomodoro" ? "Pomodoro" : m === "short" ? "Short Break" : "Long Break"}
          </button>
        ))}
      </div>

      {/* Timer and Info */}
      <div className="flex flex-col items-center">
        <div className="text-9xl font-bold font-mono">{formatTime(timeLeft)}</div>
        <div className={`text-xl font-medium mt-2 ${getStageLabel().color}`}>
          {getStageLabel().text}
        </div>

        {/* Checkmarks */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: Math.min(completedSessions, 4) }).map((_, i) => (
            <CheckCircleIcon
              key={i}
              className="text-white w-6 h-6 opacity-0 animate-fade-in"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Session count (optional) */}
        <div className="text-sm text-white/60 mt-1">
          Pomodoros completed: {completedSessions}
        </div>

        {/* Prompt */}
        {showPrompt && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="text-white text-lg font-medium">
              Start next session in {countdownToAutoStart}s?
            </div>
            <div className="flex gap-4">
              <button
                className="bg-white text-black px-4 py-2 rounded"
                onClick={() => {
                  clearTimeout(autoStartTimeout.current!);
                  clearInterval(countdownInterval.current!);
                  const next = mode === "pomodoro"
                    ? (completedSessions) % 4 === 0 ? "long" : "short"
                    : "pomodoro";
                  setShowPrompt(false);
                  setMode(next);
                  setTimeLeft(MODES[next]);
                  setIsRunning(true);
                }}
              >
                Start Now
              </button>
              <button
                className="border border-white px-4 py-2 rounded"
                onClick={() => {
                  clearTimeout(autoStartTimeout.current!);
                  clearInterval(countdownInterval.current!);
                  setShowPrompt(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-8">
        {!isRunning ? (
          <button
            onClick={() => setIsRunning(true)}
            className="bg-white text-black px-6 py-3 rounded uppercase font-semibold tracking-wide"
          >
            Start
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(false)}
            className="bg-white text-black px-6 py-3 rounded uppercase font-semibold tracking-wide"
          >
            Pause
          </button>
        )}
        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(MODES[mode]);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }}
          className="border border-white px-6 py-3 rounded uppercase font-semibold tracking-wide"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
