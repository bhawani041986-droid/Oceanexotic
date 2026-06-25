import { useState, useEffect } from "react";

/**
 * Delays updating the returned value until `delay` ms have elapsed
 * since the last change. Use this to avoid firing API calls on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
