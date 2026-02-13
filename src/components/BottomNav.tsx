import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, BarChart3, User } from "lucide-react";

const tabs = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/patients", icon: Users, label: "Patients" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-elevated">
      <div className="flex items-center justify-around py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
