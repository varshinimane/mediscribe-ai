import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, FileText, Users, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import FloatingAI from "@/components/FloatingAI";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState({ patientsToday: 0, notesGenerated: 0, avgDuration: "0m" });
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchData = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Recent consultations with patient info
      const { data: consultations } = await supabase
        .from("consultations")
        .select("id, title, status, created_at, duration_seconds, patients(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentConsultations(consultations || []);

      // Stats
      const { count: todayCount } = await supabase
        .from("consultations")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString());

      const { count: notesCount } = await supabase
        .from("soap_notes")
        .select("id", { count: "exact", head: true });

      const { data: durations } = await supabase
        .from("consultations")
        .select("duration_seconds")
        .gt("duration_seconds", 0);

      const avg = durations?.length
        ? Math.round(durations.reduce((a, b) => a + b.duration_seconds, 0) / durations.length / 60)
        : 0;

      setStats({
        patientsToday: todayCount || 0,
        notesGenerated: notesCount || 0,
        avgDuration: `${avg}m`,
      });
    };
    fetchData();
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] || "Doctor";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="text-2xl font-bold text-foreground mt-1">Hello, {firstName} 👋</h1>
        </motion.div>
      </div>

      <div className="px-5 space-y-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Button
            onClick={() => navigate("/consultation")}
            className="w-full h-16 rounded-2xl text-base font-semibold medical-gradient border-0 text-primary-foreground shadow-float gap-3"
            size="lg"
          >
            <Mic className="h-6 w-6" />
            Start New Consultation
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3">
          {[
            { label: "Patients Today", value: String(stats.patientsToday), icon: Users, color: "bg-medical-blue-light text-primary" },
            { label: "Notes Generated", value: String(stats.notesGenerated), icon: FileText, color: "bg-medical-green-light text-medical-green" },
            { label: "Avg. Duration", value: stats.avgDuration, icon: Clock, color: "bg-medical-orange-light text-medical-orange" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-card p-4 shadow-card text-center">
              <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Recent Consultations</h2>
            <button onClick={() => navigate("/patients")} className="text-xs font-medium text-primary">View All</button>
          </div>
          {recentConsultations.length === 0 ? (
            <div className="rounded-2xl bg-card p-8 shadow-card text-center">
              <p className="text-sm text-muted-foreground">No consultations yet. Start your first one!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentConsultations.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  onClick={() => navigate(`/soap-note?id=${c.id}`)}
                  className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {c.patients?.first_name} {c.patients?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.title || "Consultation"} • {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                    c.status === "completed" ? "bg-medical-green-light text-medical-green" : "bg-medical-orange-light text-medical-orange"
                  }`}>
                    {c.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <FloatingAI />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
