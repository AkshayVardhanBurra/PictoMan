import { useEffect, useState } from "react";

export default function CountdownTimer({ initialMinutes = 2 }) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      console.log("Timer finished!");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span>
      {String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </span>
  );
}

