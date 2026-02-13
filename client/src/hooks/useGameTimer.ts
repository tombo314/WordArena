import { useEffect, useRef, useState } from "react";
import { GAME_DURATION } from "../const";

export function useGameTimer(
  gameStarted: boolean,
  gameEnded: boolean,
  onTimeUp: () => void,
) {
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          onTimeUpRef.current();
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameEnded]);

  return { timeLeft };
}
