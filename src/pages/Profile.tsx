import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, Settings, Shield, LogOut, ChevronRight, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import FloatingAI from "@/components/FloatingAI";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { profile, role, signOut, user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [hospital, setHospital] = useState(profile?.hospital || "");
  const [specialty, setSpecialty] = useState(profile?.specialty || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      hospital,
      specialty,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Profile Updated" });
      setEditing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = (profile?.full_name || "U").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="px-5 space-y-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl medical-gradient text-xl font-bold text-primary-foreground shadow-float">
              {initials}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-2">
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="h-9 rounded-lg" />
                  <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Specialty" className="h-9 rounded-lg" />
                  <Input value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="Hospital" className="h-9 rounded-lg" />
                  <Button onClick={handleSave} disabled={saving} size="sm" className="rounded-lg gap-1 medical-gradient border-0 text-primary-foreground">
                    <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-foreground">{profile?.full_name || "Doctor"}</h2>
                  <p className="text-sm text-muted-foreground">{profile?.specialty || "No specialty set"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Role: {role || "doctor"}</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="rounded-2xl bg-card shadow-card overflow-hidden">
          {[
            { icon: Building2, label: "Hospital", value: profile?.hospital || "Not set", onClick: () => setEditing(true) },
            { icon: Settings, label: "Edit Profile", value: "", onClick: () => setEditing(!editing) },
            { icon: Shield, label: "Data & Privacy", value: "", onClick: () => {} },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={item.onClick}
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

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleLogout}
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
