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

  useEffect(() => {
    if (!showPrompt) {
      setTimeLeft(MODES[mode]);
    }
    setIsRunning(false);
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
  }, [mode]);

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
              if (mode === "long") {
                setCompletedSessions(0);
              }
            }

            setShowPrompt(true);
            setCountdownToAutoStart(20);
            hasStartedRef.current = false;

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

  const startSession = (nextMode: Mode) => {
    hasStartedRef.current = true;
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    clearInterval(countdownInterval.current!);
    countdownInterval.current = null;
    clearTimeout(autoStartTimeout.current!);
    autoStartTimeout.current = null;

    setShowPrompt(false);
    setMode(nextMode);
    setTimeLeft(MODES[nextMode]);

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
    <div className={`${bgColor} text-white h-screen flex flex-col`}>
      <div className="pt-8 flex justify-center">
        <div className="flex gap-4 mt-8">
          {(["pomodoro", "short", "long"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setIsRunning(false);
                clearInterval(intervalRef.current!);
                intervalRef.current = null;
                clearTimeout(autoStartTimeout.current!);
                clearInterval(countdownInterval.current!);
                setShowPrompt(false);
                setMode(m);
              }}
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
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="text-9xl font-bold font-mono">
            {formatTime(timeLeft)}
          </div>
          <div className={`text-xl font-medium mt-2 ${getStageLabel().color}`}>
            {getStageLabel().text}
          </div>

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

          {showPrompt && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="text-white text-lg font-medium">
                Start next session in {countdownToAutoStart}s?
              </div>
              <div className="flex gap-4">
                <button
                  className="bg-white text-black text-lg px-8 py-4 rounded uppercase font-bold tracking-wide cursor-pointer hover:bg-neutral-100 transition active:scale-95 active:shadow-inner"
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
                  className="border border-white text-lg px-8 py-4 rounded uppercase font-bold tracking-wide cursor-pointer hover:bg-white hover:text-black transition active:scale-95 active:shadow-inner"
                  onClick={() => {
                    clearTimeout(autoStartTimeout.current!);
                    clearInterval(countdownInterval.current!);
                    setShowPrompt(false);
                    setIsRunning(false); // Ensure timer doesn't resume
                    setTimeLeft(MODES[mode]); // Reset timer to full length
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showPrompt && (
            <div className="flex gap-4 mt-6">
              {!isRunning ? (
                <>
                  <button
                    onClick={() => setIsRunning(true)}
                    className="bg-white text-black text-lg px-8 py-4 rounded uppercase font-bold tracking-wide cursor-pointer hover:bg-neutral-100 transition active:scale-95 active:shadow-inner"
                  >
                    Start
                  </button>
                  {/* Invisible placeholder to preserve layout */}
                  <button
                    className="border border-transparent text-lg px-8 py-4 rounded uppercase font-bold tracking-wide cursor-default invisible"
                    aria-hidden="true"
                  >
                    Next
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsRunning(false)}
                    className="bg-white text-black text-lg px-8 py-4 rounded uppercase font-bold tracking-wide cursor-pointer hover:bg-neutral-100 transition active:scale-95 active:shadow-inner"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => {
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
                        if (mode === "long") setCompletedSessions(0);
                      }

                      startSession(nextMode);
                    }}
                    className="border border-white text-lg px-8 py-4 rounded uppercase font-bold tracking-wide cursor-pointer hover:bg-white hover:text-black transition active:scale-95 active:shadow-inner"
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
