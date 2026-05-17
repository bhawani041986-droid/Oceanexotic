"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 text-center sm:p-6 pt-24 md:pt-32">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-bg-primary/80 backdrop-blur-md transition-opacity"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-lg transform rounded-[24px] bg-bg-card border border-[var(--foreground)]/10 p-6 md:p-10 text-left shadow-2xl transition-all z-10 my-8",
                className
              )}
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 md:right-8 md:top-8 p-2 rounded-full hover:bg-[var(--foreground)]/5 transition-colors opacity-50 hover:opacity-100 z-20"
              >
                <X className="w-5 h-5 text-[var(--foreground)]" />
              </button>
              <div className="space-y-6 md:space-y-8">
                {(title || description) && (
                  <div className="space-y-2 pr-10">
                    {title && (
                      <h2 className="text-xl md:text-3xl font-black tracking-tighter text-[var(--foreground)] uppercase italic leading-tight">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="text-[10px] md:text-xs font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">
                        {description}
                      </p>
                    )}
                  </div>
                )}
                <div className="relative">{children}</div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
