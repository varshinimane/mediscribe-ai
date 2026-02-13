import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Building2, Settings, Shield, LogOut, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import FloatingAI from "@/components/FloatingAI";

const menuItems = [
  { icon: Building2, label: "Hospital", value: "City General Hospital" },
  { icon: Settings, label: "App Settings", value: "" },
  { icon: Shield, label: "Data & Privacy", value: "" },
];

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="px-5 space-y-5">
        {/* Doctor Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-5 shadow-card"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl medical-gradient text-xl font-bold text-primary-foreground shadow-float">
              JS
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Dr. Jane Smith</h2>
              <p className="text-sm text-muted-foreground">Internal Medicine</p>
              <p className="text-xs text-muted-foreground mt-0.5">License: MD-2847391</p>
            </div>
          </div>
        </motion.div>

        {/* Menu */}
        <div className="rounded-2xl bg-card shadow-card overflow-hidden">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex w-full items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/")}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card hover:bg-destructive/5 transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-medical-red-light">
            <LogOut className="h-4 w-4 text-medical-red" />
          </div>
          <span className="text-sm font-medium text-medical-red">Log Out</span>
        </motion.button>
      </div>

      <FloatingAI />
      <BottomNav />
    </div>
  );
};

export default Profile;
