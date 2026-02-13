import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Activity } from "lucide-react";

const visits = [
  { date: "Feb 13, 2026", type: "Follow-up", notes: "Headache follow-up. BP improved." },
  { date: "Jan 28, 2026", type: "New Visit", notes: "Initial assessment for persistent headaches." },
  { date: "Dec 15, 2025", type: "Annual Check", notes: "Annual physical. All labs within normal limits." },
];

const PatientProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Patient Profile</h1>
      </div>

      <div className="px-5">
        {/* Patient Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-5 shadow-card mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full medical-gradient text-lg font-bold text-primary-foreground">
              SJ
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Sarah Johnson</h2>
              <p className="text-sm text-muted-foreground">Female • Age 42 • DOB: 05/14/1983</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Blood Type", value: "O+" },
              { label: "Allergies", value: "Penicillin" },
              { label: "Insurance", value: "BlueCross" },
              { label: "MRN", value: "#2847391" },
            ].map((d) => (
              <div key={d.label} className="rounded-xl bg-muted p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{d.label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{d.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Visit History */}
        <h3 className="text-base font-semibold text-foreground mb-3">Visit History</h3>
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
          {visits.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative mb-4 last:mb-0"
            >
              <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
              <div className="rounded-2xl bg-card p-4 shadow-card">
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{v.date}</span>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">{v.type}</span>
                </div>
                <p className="text-sm text-foreground">{v.notes}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
