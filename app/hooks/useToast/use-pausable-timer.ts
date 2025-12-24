import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Return type for the usePausableTimer hook
 */
interface UsePausableTimerReturn {
  /**
   * Whether the timer is currently paused
   */
  paused: boolean;

  /**
   * Pause the timer
   */
  pause: () => void;

  /**
   * Resume the timer
   */
  resume: () => void;
}

/**
 * A custom hook that provides a pausable timer functionality
 * @param callback - Function to call when the timer expires
 * @param delay - Delay in milliseconds
 * @returns Object with pause/resume controls and paused state
 */
export default function usePausableTimer(
  callback: () => void,
  delay: number,
): UsePausableTimerReturn {
  const [paused, setPaused] = useState<boolean>(false);
  const startRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(delay);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clear = useCallback(() => {
    if (timeoutIdRef.current !== undefined) {
      clearTimeout(timeoutIdRef.current);
    }
  }, []);

  const pause = useCallback(() => {
    setPaused(true);
    remainingRef.current -= Date.now() - startRef.current;
    clear();
  }, [clear]);

  const resume = useCallback(() => {
    startRef.current = Date.now();
    setPaused(false);
  }, []);

  useEffect(() => {
    if (!paused && delay > 0) {
      timeoutIdRef.current = setTimeout(callback, remainingRef.current);
    }
    return clear;
  }, [paused, delay, callback, clear]);

  return { paused, pause, resume };
}
