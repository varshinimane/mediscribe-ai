import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, Brain, ClipboardList, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    title: "Less Typing.\nMore Care.",
    subtitle: "AI-powered medical documentation assistant.",
    icon: null,
  },
  {
    title: "Powerful Features",
    subtitle: "Everything you need for clinical documentation.",
    features: [
      { icon: Mic, label: "AI Transcription", desc: "Record and transcribe patient conversations" },
      { icon: Brain, label: "Smart SOAP Notes", desc: "Auto-generate structured clinical notes" },
      { icon: ClipboardList, label: "Data Extraction", desc: "Extract symptoms, meds, vitals & diagnoses" },
      { icon: Shield, label: "Secure Records", desc: "HIPAA-compliant patient data storage" },
    ],
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-sm text-center"
          >
            {step === 0 && (
              <>
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl medical-gradient shadow-float">
                  <Mic className="h-12 w-12 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold leading-tight text-foreground whitespace-pre-line">
                  {slides[0].title}
                </h1>
                <p className="mt-3 text-base text-muted-foreground">
                  {slides[0].subtitle}
                </p>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {slides[1].title}
                </h2>
                <p className="text-sm text-muted-foreground mb-8">{slides[1].subtitle}</p>
                <div className="space-y-3">
                  {slides[1].features!.map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 rounded-xl bg-card p-4 shadow-card text-left"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                        <f.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{f.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + CTA */}
      <div className="px-6 pb-10">
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
        <Button
          onClick={handleNext}
          className="w-full h-13 rounded-xl text-base font-semibold medical-gradient border-0 text-primary-foreground shadow-float"
          size="lg"
        >
          {step === 0 ? "Get Started" : "Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
