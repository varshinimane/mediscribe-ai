import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, FileText, Users, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import FloatingAI from "@/components/FloatingAI";

const recentConsultations = [
  { id: 1, patient: "Sarah Johnson", time: "10:30 AM", type: "Follow-up", status: "Completed" },
  { id: 2, patient: "Michael Chen", time: "9:15 AM", type: "New Visit", status: "Completed" },
  { id: 3, patient: "Emily Davis", time: "Yesterday", type: "Urgent", status: "Pending Review" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="text-2xl font-bold text-foreground mt-1">Hello, Dr. Smith 👋</h1>
        </motion.div>
      </div>

      <div className="px-5 space-y-5">
        {/* Start Consultation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={() => navigate("/consultation")}
            className="w-full h-16 rounded-2xl text-base font-semibold medical-gradient border-0 text-primary-foreground shadow-float gap-3"
            size="lg"
          >
            <Mic className="h-6 w-6" />
            Start New Consultation
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Patients Today", value: "8", icon: Users, color: "bg-medical-blue-light text-primary" },
            { label: "Notes Generated", value: "6", icon: FileText, color: "bg-medical-green-light text-medical-green" },
            { label: "Avg. Duration", value: "12m", icon: Clock, color: "bg-medical-orange-light text-medical-orange" },
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

        {/* Recent Consultations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Recent Consultations</h2>
            <button className="text-xs font-medium text-primary">View All</button>
          </div>
          <div className="space-y-2.5">
            {recentConsultations.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                onClick={() => navigate("/soap-note")}
                className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.patient}</p>
                    <p className="text-xs text-muted-foreground">{c.type} • {c.time}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                    c.status === "Completed"
                      ? "bg-medical-green-light text-medical-green"
                      : "bg-medical-orange-light text-medical-orange"
                  }`}
                >
                  {c.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <FloatingAI />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
