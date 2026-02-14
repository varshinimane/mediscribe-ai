import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const PatientProfile = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    const fetch = async () => {
      const { data: p } = await supabase.from("patients")
        .select("*").eq("id", patientId).single();
      setPatient(p);

      const { data: c } = await supabase.from("consultations")
        .select("id, title, status, created_at, duration_seconds")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });
      setConsultations(c || []);
      setLoading(false);
    };
    fetch();
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!patient) return null;

  const age = patient.date_of_birth
    ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / 31557600000)
    : null;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Patient Profile</h1>
      </div>

      <div className="px-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-5 shadow-card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full medical-gradient text-lg font-bold text-primary-foreground">
              {patient.first_name[0]}{patient.last_name[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{patient.first_name} {patient.last_name}</h2>
              <p className="text-sm text-muted-foreground">
                {patient.gender && `${patient.gender} • `}
                {age !== null && `Age ${age} • `}
                {patient.date_of_birth && `DOB: ${new Date(patient.date_of_birth).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          {(patient.phone || patient.email) && (
            <div className="grid grid-cols-2 gap-3">
              {patient.phone && (
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{patient.phone}</p>
                </div>
              )}
              {patient.email && (
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{patient.email}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Visit History</h3>
          <Button onClick={() => navigate(`/consultation?patientId=${patientId}`)} size="sm" className="rounded-xl gap-1 medical-gradient border-0 text-primary-foreground">
            <Mic className="h-4 w-4" /> New Visit
          </Button>
        </div>

        {consultations.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 shadow-card text-center">
            <p className="text-sm text-muted-foreground">No consultations yet.</p>
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
            {consultations.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative mb-4 last:mb-0">
                <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                <div onClick={() => navigate(`/soap-note?id=${c.id}`)} className="rounded-2xl bg-card p-4 shadow-card cursor-pointer hover:shadow-elevated transition-shadow">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      c.status === "completed" ? "bg-medical-green-light text-medical-green" : "bg-medical-orange-light text-medical-orange"
                    }`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-foreground">{c.title || "Consultation"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
