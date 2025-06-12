import { useEffect, useRef, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const MODES = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
} as const;

type Mode = keyof typeof MODES;

export default function App() {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(MODES[mode]);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);

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

            if (mode === "pomodoro") {
              setCompletedSessions(prev => {
                const next = prev + 1;
                if (next % 4 === 0) {
                  setMode("long");
                } else {
                  setMode("short");
                }
                return next;
              });
            } else {
              setMode("pomodoro");
            }

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
  }, [isRunning, mode]);

  const formatTime = (s: number) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
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

      {/* Timer */}
      <div className="text-9xl font-bold font-mono">{formatTime(timeLeft)}</div>

      {/* Session Tracker */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: Math.min(completedSessions, 4) }).map((_, i) => (
          <CheckCircleIcon
            key={i}
            className="text-white w-6 h-6 opacity-0 animate-fade-in"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
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
