import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Download, Edit3, Check, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const sections = [
  { key: "subjective", label: "Subjective", color: "bg-medical-blue-light text-primary" },
  { key: "objective", label: "Objective", color: "bg-medical-green-light text-medical-green" },
  { key: "assessment", label: "Assessment", color: "bg-medical-orange-light text-medical-orange" },
  { key: "plan", label: "Plan", color: "bg-medical-purple-light text-medical-purple" },
] as const;

const SOAPNote = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("id");

  const [editing, setEditing] = useState<string | null>(null);
  const [data, setData] = useState({ subjective: "", objective: "", assessment: "", plan: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!consultationId) { setLoading(false); return; }
    supabase.from("soap_notes").select("subjective, objective, assessment, plan")
      .eq("consultation_id", consultationId).single()
      .then(({ data: soap }) => {
        if (soap) setData(soap);
        setLoading(false);
      });
  }, [consultationId]);

  const handleSave = async () => {
    if (!consultationId) return;
    setSaving(true);
    const { error } = await supabase.from("soap_notes")
      .update(data)
      .eq("consultation_id", consultationId);
    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Saved!", description: "SOAP note updated successfully." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-card">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">SOAP Note</h1>
        </div>
        {consultationId && (
          <button onClick={() => navigate(`/structured-data?id=${consultationId}`)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
            <ClipboardList className="h-5 w-5 text-primary" />
          </button>
        )}
      </div>

      <div className="px-5 space-y-4">
        {sections.map((section, i) => (
          <motion.div key={section.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between p-4 pb-2">
              <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${section.color}`}>{section.label}</span>
              <button onClick={() => setEditing(editing === section.key ? null : section.key)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                {editing === section.key ? <Check className="h-4 w-4 text-medical-green" /> : <Edit3 className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
            <div className="px-4 pb-4">
              {editing === section.key ? (
                <Textarea value={data[section.key]} onChange={(e) => setData({ ...data, [section.key]: e.target.value })} className="min-h-[100px] text-sm border-0 p-0 focus-visible:ring-0 resize-none bg-transparent" />
              ) : (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {data[section.key] || <span className="text-muted-foreground italic">No data yet</span>}
                </p>
              )}
            </div>
          </motion.div>
        ))}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving} className="h-13 rounded-xl gap-2 medical-gradient border-0 text-primary-foreground shadow-float">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" className="h-13 rounded-xl gap-2 border-primary text-primary">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SOAPNote;
