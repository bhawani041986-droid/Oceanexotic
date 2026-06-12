import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export function useFlashDealTimer() {
  const { flashDealActive, flashDealEnd } = useSettingsStore();
  const [timeLeft, setTimeLeft] = useState({ hrs: "00", min: "00", sec: "00" });

  useEffect(() => {
    if (!flashDealActive) return;

    const tick = () => {
      const distance = new Date(flashDealEnd).getTime() - Date.now();
      if (distance < 0) {
        setTimeLeft({ hrs: "00", min: "00", sec: "00" });
        return;
      }
      const hrs = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const min = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const sec = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({
        hrs: hrs.toString().padStart(2, "0"),
        min: min.toString().padStart(2, "0"),
        sec: sec.toString().padStart(2, "0"),
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [flashDealActive, flashDealEnd]);

  return { timeLeft, flashDealActive };
}
