import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, AlertTriangle, Users } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import FloatingAI from "@/components/FloatingAI";
import { supabase } from "@/integrations/supabase/client";

const Analytics = () => {
  const [totalPatients, setTotalPatients] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; count: number }[]>([]);
  const [diagnosisData, setDiagnosisData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { count: pCount } = await supabase.from("patients").select("id", { count: "exact", head: true });
      setTotalPatients(pCount || 0);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const { count: mCount } = await supabase.from("consultations").select("id", { count: "exact", head: true }).gte("created_at", monthStart.toISOString());
      setThisMonth(mCount || 0);

      // Monthly data - last 6 months
      const months: { month: string; count: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
        const { count } = await supabase.from("consultations").select("id", { count: "exact", head: true }).gte("created_at", start).lte("created_at", end);
        months.push({ month: d.toLocaleDateString("en-US", { month: "short" }), count: count || 0 });
      }
      setMonthlyData(months);

      // Diagnosis breakdown from structured_data
      const { data: sdList } = await supabase.from("structured_data").select("diagnoses");
      const diagCounts: Record<string, number> = {};
      (sdList || []).forEach((sd: any) => {
        ((sd.diagnoses as any[]) || []).forEach((d: any) => {
          const name = d.name || "Unknown";
          diagCounts[name] = (diagCounts[name] || 0) + 1;
        });
      });
      const colors = ["hsl(210, 100%, 56%)", "hsl(145, 60%, 45%)", "hsl(30, 95%, 55%)", "hsl(260, 60%, 55%)", "hsl(210, 20%, 80%)"];
      const sorted = Object.entries(diagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      setDiagnosisData(sorted.map(([name, value], i) => ({ name, value, color: colors[i % colors.length] })));
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Clinical insights overview</p>
      </div>

      <div className="px-5 space-y-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Patients", value: String(totalPatients), icon: Users, color: "bg-medical-blue-light text-primary" },
            { label: "This Month", value: String(thisMonth), icon: TrendingUp, color: "bg-medical-green-light text-medical-green" },
            { label: "Diagnoses", value: String(diagnosisData.length), icon: AlertTriangle, color: "bg-medical-red-light text-medical-red" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-card p-4 shadow-card text-center">
              <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Consultations</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 15%, 50%)" }} />
              <YAxis hide />
              <Bar dataKey="count" fill="hsl(210, 100%, 56%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {diagnosisData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Top Diagnoses</h3>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={diagnosisData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="value" strokeWidth={0}>
                      {diagnosisData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {diagnosisData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-foreground">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <FloatingAI />
      <BottomNav />
    </div>
  );
};

export default Analytics;
