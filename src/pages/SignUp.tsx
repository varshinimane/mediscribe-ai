import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Stethoscope, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"doctor" | "admin">("doctor");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-auto"
      >
        <h2 className="text-2xl font-bold text-foreground mb-1">Create Account</h2>
        <p className="text-sm text-muted-foreground mb-8">Join MediScribe AI</p>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dr. Jane Smith"
                className="pl-10 h-12 rounded-xl bg-card border-border"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="doctor@hospital.com"
                className="pl-10 h-12 rounded-xl bg-card border-border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-10 h-12 rounded-xl bg-card border-border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Role</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                  role === "doctor"
                    ? "border-primary bg-accent"
                    : "border-border bg-card"
                }`}
              >
                <Stethoscope className={`h-5 w-5 ${role === "doctor" ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${role === "doctor" ? "text-primary" : "text-muted-foreground"}`}>
                  Doctor
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                  role === "admin"
                    ? "border-primary bg-accent"
                    : "border-border bg-card"
                }`}
              >
                <ShieldCheck className={`h-5 w-5 ${role === "admin" ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${role === "admin" ? "text-primary" : "text-muted-foreground"}`}>
                  Admin
                </span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-13 rounded-xl text-base font-semibold medical-gradient border-0 text-primary-foreground shadow-float mt-2"
            size="lg"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
