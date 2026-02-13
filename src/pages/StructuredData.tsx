import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Thermometer, Pill, Activity, Stethoscope, Hash, AlertCircle } from "lucide-react";

const extractedData = [
  { label: "Symptoms", icon: AlertCircle, value: "Frontal headache, Nausea", color: "bg-medical-red-light text-medical-red" },
  { label: "Duration", icon: Activity, value: "3 days", color: "bg-medical-orange-light text-medical-orange" },
  { label: "Medications", icon: Pill, value: "Ibuprofen 400mg PRN", color: "bg-medical-blue-light text-primary" },
  { label: "Blood Pressure", icon: Thermometer, value: "138/88 mmHg", color: "bg-medical-green-light text-medical-green" },
  { label: "Temperature", icon: Thermometer, value: "98.6°F (37°C)", color: "bg-medical-green-light text-medical-green" },
  { label: "Diagnosis", icon: Stethoscope, value: "Tension-type headache", color: "bg-medical-purple-light text-medical-purple" },
  { label: "ICD-10 Codes", icon: Hash, value: "G44.209 — Tension-type headache, unspecified\nI10 — Essential hypertension", color: "bg-accent text-accent-foreground" },
];

const StructuredData = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="flex items-center gap-3 px-5 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Extracted Data</h1>
      </div>

      <div className="px-5 space-y-3">
        {extractedData.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl bg-card p-4 shadow-card"
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-foreground whitespace-pre-line">{item.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StructuredData;
