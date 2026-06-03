"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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
  const [isMobile, setIsMobile] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 text-center sm:p-6 pt-24 md:pt-32 max-[480px]:items-end max-[480px]:justify-center max-[480px]:p-0 max-[480px]:pt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-bg-primary/80 backdrop-blur-md transition-opacity"
            />
            
            <motion.div
              initial={isMobile ? { y: "100%", opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={isMobile ? { y: "100%", opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
              transition={isMobile ? { type: "spring", damping: 30, stiffness: 300 } : { duration: 0.2 }}
              className={cn(
                "relative w-full max-w-lg transform rounded-[24px] bg-bg-card border border-[var(--foreground)]/10 p-6 md:p-10 text-left shadow-2xl transition-all z-10 my-8 flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden",
                "max-[480px]:my-0 max-[480px]:rounded-b-none max-[480px]:rounded-t-[24px] max-[480px]:max-w-full max-[480px]:p-5 max-[480px]:pb-8 max-[480px]:border-x-0 max-[480px]:border-b-0",
                className
              )}
            >
              {/* Drag/Swipe Indicator for Mobile Bottom Sheet */}
              <div className="hidden max-[480px]:block w-12 h-1.5 bg-[var(--foreground)]/20 rounded-full mx-auto mb-5 shrink-0" />

              <button
                onClick={onClose}
                className="absolute right-4 top-4 md:right-8 md:top-8 p-2 rounded-full hover:bg-[var(--foreground)]/5 transition-colors opacity-50 hover:opacity-100 z-20"
              >
                <X className="w-5 h-5 text-[var(--foreground)]" />
              </button>
              <div className="space-y-6 md:space-y-8 flex flex-col max-h-full min-h-0 flex-1">
                {(title || description) && (
                  <div className="space-y-2 pr-10 shrink-0">
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
                <div className="relative overflow-y-auto pr-1 flex-1 min-h-0">{children}</div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof window !== "undefined" ? createPortal(modalContent, document.body) : null;
};
