import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export function useFlashDealTimer() {
  const { flashDealActive, flashDealStart, flashDealEnd } = useSettingsStore();
  const [timeLeft, setTimeLeft] = useState({ hrs: "00", min: "00", sec: "00" });
  const [timerStatus, setTimerStatus] = useState<'STARTS_IN' | 'ENDS_IN'>('ENDS_IN');

  useEffect(() => {
    if (!flashDealActive) return;

    const tick = () => {
      const now = Date.now();
      const start = new Date(flashDealStart || now).getTime();
      const end = new Date(flashDealEnd).getTime();

      let distance = 0;
      let status: 'STARTS_IN' | 'ENDS_IN' = 'ENDS_IN';

      if (now < start) {
        distance = start - now;
        status = 'STARTS_IN';
      } else {
        distance = end - now;
        status = 'ENDS_IN';
      }

      if (distance < 0) {
        setTimeLeft({ hrs: "00", min: "00", sec: "00" });
        setTimerStatus(status);
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
      setTimerStatus(status);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [flashDealActive, flashDealStart, flashDealEnd]);

  return { timeLeft, timerStatus, flashDealActive };
}
