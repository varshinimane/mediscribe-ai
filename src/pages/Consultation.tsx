import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mic, Square, Pause, Play, ArrowLeft, Brain, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Consultation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get("patientId");

  const [state, setState] = useState<"select-patient" | "idle" | "recording" | "paused" | "done" | "generating">("select-patient");
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [consultationId, setConsultationId] = useState<string | null>(null);

  // Patient selection
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>(patientIdParam || "");
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");

  useEffect(() => {
    supabase.from("patients").select("id, first_name, last_name").then(({ data }) => {
      setPatients(data || []);
      if (patientIdParam) setState("idle");
    });
  }, [patientIdParam]);

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

  const handleCreatePatient = async () => {
    if (!newFirstName || !newLastName || !user) return;
    const { data, error } = await supabase.from("patients").insert({
      doctor_id: user.id,
      first_name: newFirstName,
      last_name: newLastName,
    }).select().single();
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }
    setPatients((prev) => [...prev, data]);
    setSelectedPatient(data.id);
    setShowNewPatient(false);
    setNewFirstName("");
    setNewLastName("");
    setState("idle");
  };

  const handleSelectPatient = () => {
    if (selectedPatient) setState("idle");
  };

  const handleStopRecording = async () => {
    if (!user) return;
    setState("done");

    // For now, use a mock transcript (real transcription would use ElevenLabs)
    const mockTranscript = "Patient reports persistent headache for the past 3 days, mostly frontal. Rates pain at 6/10. Associated with mild nausea but no vomiting. No visual disturbances. Has been taking ibuprofen 400mg with partial relief. Blood pressure 138/88. Temperature 98.6°F.";
    setTranscript(mockTranscript);

    // Create consultation record
    const { data, error } = await supabase.from("consultations").insert({
      patient_id: selectedPatient,
      doctor_id: user.id,
      title: "Consultation",
      transcript: mockTranscript,
      status: "transcribed",
      duration_seconds: seconds,
    }).select().single();

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }
    setConsultationId(data.id);
  };

  const handleGenerateSOAP = async () => {
    if (!consultationId) return;
    setState("generating");

    try {
      const { data, error } = await supabase.functions.invoke("generate-soap", {
        body: { transcript, consultation_id: consultationId },
      });

      if (error) throw error;

      toast({ title: "SOAP Note Generated!", description: "AI has analyzed the transcript." });

      // Send email notification
      supabase.functions.invoke("send-consultation-email", {
        body: { consultation_id: consultationId },
      });

      navigate(`/soap-note?id=${consultationId}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "AI Error", description: e.message || "Failed to generate SOAP note" });
      setState("done");
    }
  };

  if (state === "select-patient") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-5 pt-12 pb-4">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Select Patient</h1>
        </div>
        <div className="px-5 space-y-3 flex-1">
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedPatient(p.id); setState("idle"); }}
              className={`w-full flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card text-left transition-all ${selectedPatient === p.id ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
                {p.first_name[0]}{p.last_name[0]}
              </div>
              <p className="text-sm font-semibold text-foreground">{p.first_name} {p.last_name}</p>
            </button>
          ))}

          {showNewPatient ? (
            <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">First Name</Label>
                  <Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} className="h-10 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Last Name</Label>
                  <Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} className="h-10 rounded-xl" />
                </div>
              </div>
              <Button onClick={handleCreatePatient} className="w-full rounded-xl medical-gradient border-0 text-primary-foreground">
                Add Patient
              </Button>
            </div>
          ) : (
            <button onClick={() => setShowNewPatient(true)} className="w-full flex items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 text-muted-foreground hover:border-primary transition-colors">
              <UserPlus className="h-5 w-5" />
              <span className="text-sm font-medium">Add New Patient</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">New Consultation</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {state !== "done" && state !== "generating" ? (
          <>
            <div className="relative mb-8">
              {state === "recording" && (
                <>
                  <motion.div className="absolute inset-0 rounded-full bg-primary/20" animate={{ scale: [1, 1.6], opacity: [0.4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <motion.div className="absolute inset-0 rounded-full bg-primary/10" animate={{ scale: [1, 2], opacity: [0.3, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
                </>
              )}
              <button
                onClick={() => {
                  if (state === "idle") setState("recording");
                  else if (state === "recording") setState("paused");
                  else if (state === "paused") setState("recording");
                }}
                className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full transition-all ${
                  state === "recording" ? "medical-gradient shadow-float" : state === "paused" ? "bg-medical-orange shadow-elevated" : "bg-card shadow-elevated border-2 border-primary"
                }`}
              >
                {state === "idle" && <Mic className="h-10 w-10 text-primary" />}
                {state === "recording" && <Pause className="h-10 w-10 text-primary-foreground" />}
                {state === "paused" && <Play className="h-10 w-10 text-primary-foreground" />}
              </button>
            </div>

            <p className="text-3xl font-mono font-bold text-foreground mb-2">{formatTime(seconds)}</p>
            <p className="text-sm text-muted-foreground mb-8">
              {state === "idle" && "Tap to start recording"}
              {state === "recording" && "Recording in progress..."}
              {state === "paused" && "Recording paused"}
            </p>

            {state === "recording" && (
              <div className="flex items-center gap-1 mb-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div key={i} className="w-1 rounded-full bg-primary" animate={{ height: [4, Math.random() * 28 + 4, 4] }} transition={{ duration: 0.6 + Math.random() * 0.6, repeat: Infinity, delay: i * 0.05 }} />
                ))}
              </div>
            )}

            {(state === "recording" || state === "paused") && (
              <Button onClick={handleStopRecording} variant="outline" className="rounded-xl h-12 px-8 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </>
        ) : state === "generating" ? (
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-base font-semibold text-foreground">Generating SOAP Note...</p>
            <p className="text-sm text-muted-foreground mt-1">AI is analyzing the transcript</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <h2 className="text-lg font-bold text-foreground mb-4">Transcript Preview</h2>
            <div className="rounded-2xl bg-card p-5 shadow-card mb-6">
              <p className="text-sm text-foreground leading-relaxed">{transcript}</p>
            </div>
            <Button onClick={handleGenerateSOAP} className="w-full h-14 rounded-2xl text-base font-semibold medical-gradient border-0 text-primary-foreground shadow-float gap-2" size="lg">
              <Brain className="h-5 w-5" />
              Generate SOAP Note
            </Button>
            <Button onClick={() => { setState("idle"); setSeconds(0); }} variant="outline" className="w-full mt-3 h-12 rounded-xl">
              Record Again
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Consultation;
