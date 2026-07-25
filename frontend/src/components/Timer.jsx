import { useEffect, useState, useRef } from "react";



const initialMinutes = 5
export default function CountdownTimer({ onTimerEnd }) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const endTimeRef = useRef(null);

  useEffect(() => {
    // initialize end time relative to now
    endTimeRef.current = Date.now() + initialMinutes * 60 * 1000;

    const tick = () => {
      const remainingMs = endTimeRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setTimeLeft(remainingSec);
      if (remainingSec <= 0) {
        onTimerEnd && onTimerEnd();
        clearInterval(interval);
      }
    };

    // update twice a second for accuracy when tab is inactive
    const interval = setInterval(tick, 500);
    // run immediately to avoid 1s delay
    tick();

    return () => clearInterval(interval);
    // re-run when initialMinutes changes
  }, [initialMinutes]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span>
      {String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </span>
  );
}

