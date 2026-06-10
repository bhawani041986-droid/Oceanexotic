// @ts-nocheck
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-10 right-10 z-[200] flex flex-col gap-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "w-80 p-4 rounded-[14px] bg-bg-card border border-[var(--foreground)]/10 shadow-premium flex items-start gap-4",
                t.type === "success" && "shadow-glow-purple/20 border-success/20"
              )}
            >
              <div className="mt-0.5">
                {t.type === "success" && <CheckCircle className="w-5 h-5 text-success" />}
                {t.type === "error" && <AlertCircle className="w-5 h-5 text-danger" />}
                {t.type === "info" && <Info className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-[var(--foreground)] leading-tight">{t.message}</p>
                <p className="text-[10px] text-text-secondary mt-1 font-medium">Just now</p>
              </div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                className="opacity-40 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-[var(--foreground)]" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
