import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Thermometer, Pill, Activity, Stethoscope, Hash, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  symptoms: AlertCircle,
  medications: Pill,
  vitals: Thermometer,
  diagnoses: Stethoscope,
  icd_codes: Hash,
};

const colorMap: Record<string, string> = {
  symptoms: "bg-medical-red-light text-medical-red",
  medications: "bg-medical-blue-light text-primary",
  vitals: "bg-medical-green-light text-medical-green",
  diagnoses: "bg-medical-purple-light text-medical-purple",
  icd_codes: "bg-accent text-accent-foreground",
};

const StructuredData = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!consultationId) { setLoading(false); return; }
    supabase.from("structured_data")
      .select("symptoms, medications, vitals, diagnoses, icd_codes")
      .eq("consultation_id", consultationId)
      .single()
      .then(({ data: sd }) => { setData(sd); setLoading(false); });
  }, [consultationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const formatValue = (key: string, value: any): string => {
    if (!value) return "No data";
    if (key === "symptoms") return (value as any[]).map((s: any) => `${s.name}${s.duration ? ` (${s.duration})` : ""}${s.severity ? ` - ${s.severity}` : ""}`).join("\n");
    if (key === "medications") return (value as any[]).map((m: any) => `${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` ${m.frequency}` : ""}`).join("\n");
    if (key === "vitals") {
      const v = value as Record<string, string>;
      return Object.entries(v).filter(([, val]) => val).map(([k, val]) => `${k.replace(/_/g, " ")}: ${val}`).join("\n");
    }
    if (key === "diagnoses") return (value as any[]).map((d: any) => `${d.name}${d.certainty ? ` (${d.certainty})` : ""}`).join("\n");
    if (key === "icd_codes") return (value as any[]).map((c: any) => `${c.code} — ${c.description}`).join("\n");
    return JSON.stringify(value);
  };

  const items = data
    ? [
        { key: "symptoms", label: "Symptoms", value: formatValue("symptoms", data.symptoms) },
        { key: "medications", label: "Medications", value: formatValue("medications", data.medications) },
        { key: "vitals", label: "Vitals", value: formatValue("vitals", data.vitals) },
        { key: "diagnoses", label: "Diagnoses", value: formatValue("diagnoses", data.diagnoses) },
        { key: "icd_codes", label: "ICD-10 Codes", value: formatValue("icd_codes", data.icd_codes) },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="flex items-center gap-3 px-5 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Extracted Data</h1>
      </div>

      <div className="px-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 shadow-card text-center">
            <p className="text-sm text-muted-foreground">No structured data available.</p>
          </div>
        ) : (
          items.map((item, i) => {
            const Icon = iconMap[item.key] || Activity;
            return (
              <motion.div key={item.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl bg-card p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorMap[item.key]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StructuredData;
