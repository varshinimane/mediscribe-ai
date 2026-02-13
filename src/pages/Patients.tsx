import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import FloatingAI from "@/components/FloatingAI";

const patients = [
  { id: 1, name: "Sarah Johnson", age: 42, lastVisit: "Today", condition: "Hypertension" },
  { id: 2, name: "Michael Chen", age: 35, lastVisit: "Today", condition: "Migraine" },
  { id: 3, name: "Emily Davis", age: 58, lastVisit: "Yesterday", condition: "Type 2 Diabetes" },
  { id: 4, name: "Robert Wilson", age: 67, lastVisit: "Feb 10", condition: "COPD" },
  { id: 5, name: "Lisa Anderson", age: 29, lastVisit: "Feb 8", condition: "Anxiety" },
  { id: 6, name: "James Taylor", age: 51, lastVisit: "Feb 5", condition: "Lower back pain" },
];

const Patients = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Patients</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-10 h-11 rounded-xl bg-card border-border" />
        </div>
      </div>

      <div className="px-5 space-y-2.5">
        {patients.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate("/patient-profile")}
            className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
                {p.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">Age {p.age} • {p.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">{p.lastVisit}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </motion.div>
        ))}
      </div>

      <FloatingAI />
      <BottomNav />
    </div>
  );
};

export default Patients;
