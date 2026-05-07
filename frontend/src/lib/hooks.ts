import { useRef } from "react";

export function useRateLimit<T extends unknown[]>(
  fn: (...args: T) => void,
  time: number,
) {
  const timeout = useRef<number>(null);

  const startNewTimeout = (...args: T) => {
    if (timeout.current) clearTimeout(timeout.current);

    timeout.current = setTimeout(() => fn(...args), time);
  };

  return startNewTimeout;
}
