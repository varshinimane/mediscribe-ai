import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Pause, Play, ArrowLeft, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const Consultation = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "recording" | "paused" | "done">("idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state === "recording") {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const mockTranscript =
    "Patient reports persistent headache for the past 3 days, mostly frontal. Rates pain at 6/10. Associated with mild nausea but no vomiting. No visual disturbances. Has been taking ibuprofen 400mg with partial relief. Blood pressure 138/88. Temperature 98.6°F.";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">New Consultation</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {state !== "done" ? (
          <>
            {/* Waveform / Mic Button */}
            <div className="relative mb-8">
              {state === "recording" && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/10"
                    animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                </>
              )}
              <button
                onClick={() => {
                  if (state === "idle") setState("recording");
                  else if (state === "recording") setState("paused");
                  else if (state === "paused") setState("recording");
                }}
                className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full transition-all ${
                  state === "recording"
                    ? "medical-gradient shadow-float"
                    : state === "paused"
                    ? "bg-medical-orange shadow-elevated"
                    : "bg-card shadow-elevated border-2 border-primary"
                }`}
              >
                {state === "idle" && <Mic className="h-10 w-10 text-primary" />}
                {state === "recording" && <Pause className="h-10 w-10 text-primary-foreground" />}
                {state === "paused" && <Play className="h-10 w-10 text-primary-foreground" />}
              </button>
            </div>

            {/* Timer */}
            <p className="text-3xl font-mono font-bold text-foreground mb-2">{formatTime(seconds)}</p>
            <p className="text-sm text-muted-foreground mb-8">
              {state === "idle" && "Tap to start recording"}
              {state === "recording" && "Recording in progress..."}
              {state === "paused" && "Recording paused"}
            </p>

            {/* Waveform bars */}
            {state === "recording" && (
              <div className="flex items-center gap-1 mb-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-primary"
                    animate={{ height: [4, Math.random() * 28 + 4, 4] }}
                    transition={{ duration: 0.6 + Math.random() * 0.6, repeat: Infinity, delay: i * 0.05 }}
                  />
                ))}
              </div>
            )}

            {/* Stop button */}
            {(state === "recording" || state === "paused") && (
              <Button
                onClick={() => setState("done")}
                variant="outline"
                className="rounded-xl h-12 px-8 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </>
        ) : (
          /* Transcript Preview */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <h2 className="text-lg font-bold text-foreground mb-4">Transcript Preview</h2>
            <div className="rounded-2xl bg-card p-5 shadow-card mb-6">
              <p className="text-sm text-foreground leading-relaxed">{mockTranscript}</p>
            </div>
            <Button
              onClick={() => navigate("/soap-note")}
              className="w-full h-14 rounded-2xl text-base font-semibold medical-gradient border-0 text-primary-foreground shadow-float gap-2"
              size="lg"
            >
              <Brain className="h-5 w-5" />
              Generate SOAP Note
            </Button>
            <Button
              onClick={() => {
                setState("idle");
                setSeconds(0);
              }}
              variant="outline"
              className="w-full mt-3 h-12 rounded-xl"
            >
              Record Again
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Consultation;
