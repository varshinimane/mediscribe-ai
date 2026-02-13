import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Mic, Search, MessageCircle } from "lucide-react";

const FloatingAI = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            className="mb-3 w-56 rounded-2xl bg-card p-3 shadow-elevated border border-border"
          >
            <p className="text-xs font-semibold text-foreground mb-2.5">AI Assistant</p>
            {[
              { icon: Mic, label: "Quick Dictation" },
              { icon: Search, label: "Search Patient History" },
              { icon: MessageCircle, label: "Ask Clinical Question" },
            ].map((item) => (
              <button
                key={item.label}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full medical-gradient shadow-float"
      >
        {open ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <Bot className="h-6 w-6 text-primary-foreground" />
        )}
      </motion.button>
    </div>
  );
};

export default FloatingAI;
