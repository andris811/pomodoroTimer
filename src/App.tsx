import { useEffect, useRef, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const MODES = {
  // pomodoro: 25 * 60,
  // short: 5 * 60,
  // long: 15 * 60,
  pomodoro: 10,
  short: 5,
  long: 15,
} as const;

type Mode = keyof typeof MODES;

export default function App() {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState<number>(MODES["pomodoro"]);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [countdownToAutoStart, setCountdownToAutoStart] = useState(20);

  const intervalRef = useRef<number | null>(null);
  const autoStartTimeout = useRef<number | null>(null);
  const countdownInterval = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  // Update timeLeft whenever mode changes
  useEffect(() => {
    if (!showPrompt) {
      setTimeLeft(MODES[mode]);
    }
    setIsRunning(false);
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
  }, [mode]);

  // Main countdown
  useEffect(() => {
    if (isRunning && intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
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

            // Show countdown prompt
            setShowPrompt(true);
            setCountdownToAutoStart(20);
            hasStartedRef.current = false;

            // Clean existing intervals before setting new
            clearInterval(countdownInterval.current!);
            clearTimeout(autoStartTimeout.current!);

            countdownInterval.current = window.setInterval(() => {
              setCountdownToAutoStart((prev) => {
                if (prev <= 1) {
                  clearInterval(countdownInterval.current!);
                  countdownInterval.current = null;
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);

            autoStartTimeout.current = window.setTimeout(() => {
              if (!hasStartedRef.current) {
                startSession(nextMode);
              }
            }, 20000);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
    };
  }, [isRunning, mode, completedSessions]);

  useEffect(() => {
    return () => {
      clearTimeout(autoStartTimeout.current!);
      clearInterval(countdownInterval.current!);
      clearInterval(intervalRef.current!);
    };
  }, []);

  // ✅ Reusable start session function
  const startSession = (nextMode: Mode) => {
    hasStartedRef.current = true;

    // 🔄 Clear everything
    clearInterval(intervalRef.current!);
    intervalRef.current = null;

    clearInterval(countdownInterval.current!);
    countdownInterval.current = null;

    clearTimeout(autoStartTimeout.current!);
    autoStartTimeout.current = null;

    // ✅ Start next session
    setShowPrompt(false);
    setMode(nextMode);
    setTimeLeft(MODES[nextMode]);

    // Delay setIsRunning until after mode updates
    setTimeout(() => {
      setIsRunning(true);
    }, 50);
  };

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
    <div
      className={`${bgColor} text-white h-screen flex flex-col items-center justify-between p-8`}
    >
      {/* Tabs */}
      <div className="flex gap-4 mt-8">
        {(["pomodoro", "short", "long"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => startSession(m)}
            className={`px-4 py-2 rounded-full text-sm font-medium uppercase tracking-widest transition cursor-pointer
  ${
    mode === m
      ? "bg-white text-black"
      : "bg-transparent border border-white hover:bg-white hover:text-black"
  }`}
          >
            {m === "pomodoro"
              ? "Pomodoro"
              : m === "short"
              ? "Short Break"
              : "Long Break"}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center">
        <div className="text-9xl font-bold font-mono">
          {formatTime(timeLeft)}
        </div>
        <div className={`text-xl font-medium mt-2 ${getStageLabel().color}`}>
          {getStageLabel().text}
        </div>

        {/* Progress */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: Math.min(completedSessions, 4) }).map(
            (_, i) => (
              <CheckCircleIcon
                key={i}
                className="text-white w-6 h-6 opacity-0 animate-fade-in"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            )
          )}
        </div>
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
                className="bg-white text-black px-4 py-2 rounded cursor-pointer"
                onClick={() => {
                  if (!hasStartedRef.current)
                    startSession(
                      mode === "pomodoro"
                        ? completedSessions % 4 === 0
                          ? "long"
                          : "short"
                        : "pomodoro"
                    );
                }}
              >
                Start Now
              </button>
              <button
                className="border border-white px-4 py-2 rounded cursor-pointer"
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
            className="border border-white px-6 py-3 rounded uppercase font-semibold tracking-wide cursor-pointer hover:bg-white hover:text-black transition"
          >
            Start
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(false)}
            className="border border-white px-6 py-3 rounded uppercase font-semibold tracking-wide cursor-pointer hover:bg-white hover:text-black transition"
          >
            Pause
          </button>
        )}
        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(MODES[mode]);
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
          }}
          className="border border-white px-6 py-3 rounded uppercase font-semibold tracking-wide cursor-pointer hover:bg-white hover:text-black transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
