import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import FloatingAI from "@/components/FloatingAI";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Patients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newDob, setNewDob] = useState("");
  const [newGender, setNewGender] = useState("");

  const fetchPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("id, first_name, last_name, date_of_birth, gender, created_at")
      .order("created_at", { ascending: false });
    setPatients(data || []);
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = patients.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newFirst || !newLast || !user) return;
    const { error } = await supabase.from("patients").insert({
      doctor_id: user.id,
      first_name: newFirst,
      last_name: newLast,
      date_of_birth: newDob || null,
      gender: newGender || null,
    });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }
    setShowAdd(false);
    setNewFirst(""); setNewLast(""); setNewDob(""); setNewGender("");
    fetchPatients();
    toast({ title: "Patient Added" });
  };

  const getAge = (dob: string | null) => {
    if (!dob) return null;
    const age = Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
    return age;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="rounded-xl gap-1 medical-gradient border-0 text-primary-foreground">
            <UserPlus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-10 h-11 rounded-xl bg-card border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {showAdd && (
        <div className="px-5 mb-4">
          <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">First Name</Label><Input value={newFirst} onChange={(e) => setNewFirst(e.target.value)} className="h-10 rounded-xl" /></div>
              <div><Label className="text-xs">Last Name</Label><Input value={newLast} onChange={(e) => setNewLast(e.target.value)} className="h-10 rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Date of Birth</Label><Input type="date" value={newDob} onChange={(e) => setNewDob(e.target.value)} className="h-10 rounded-xl" /></div>
              <div><Label className="text-xs">Gender</Label><Input value={newGender} onChange={(e) => setNewGender(e.target.value)} placeholder="M/F/Other" className="h-10 rounded-xl" /></div>
            </div>
            <Button onClick={handleAdd} className="w-full rounded-xl medical-gradient border-0 text-primary-foreground">Add Patient</Button>
          </div>
        </div>
      )}

      <div className="px-5 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 shadow-card text-center">
            <p className="text-sm text-muted-foreground">{patients.length === 0 ? "No patients yet. Add your first patient!" : "No matching patients."}</p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/patient-profile/${p.id}`)}
              className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
                  {p.first_name[0]}{p.last_name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getAge(p.date_of_birth) !== null && `Age ${getAge(p.date_of_birth)} • `}
                    {p.gender || ""}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          ))
        )}
      </div>

      <FloatingAI />
      <BottomNav />
    </div>
  );
};

export default Patients;
