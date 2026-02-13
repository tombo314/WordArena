import { useRef } from "react";

interface BattleInputProps {
  inputFriend: string;
  setInputFriend: (v: string) => void;
  gameStarted: boolean;
  gameEnded: boolean;
  timeLeft: number;
  onSubmit: (command: string) => void;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `残り時間 ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function BattleInput({
  inputFriend,
  setInputFriend,
  gameStarted,
  gameEnded,
  timeLeft,
  onSubmit,
}: BattleInputProps) {
  const lastEnterTimeRef = useRef(0);

  return (
    <div className="wrapper-input">
      <div className="sub-wrapper-input">
        <input
          type="text"
          value={inputFriend}
          placeholder="コマンドを入力してください..."
          onChange={(e) => setInputFriend(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && gameStarted && !gameEnded) {
              const now = Date.now();
              if (now - lastEnterTimeRef.current < 150) return;
              lastEnterTimeRef.current = now;
              onSubmit(inputFriend);
            }
          }}
          disabled={!gameStarted || gameEnded}
        />
      </div>
      <div className="time">{gameEnded ? "残り時間 --:--" : formatTime(timeLeft)}</div>
      <div className="sub-wrapper-input">
        <input className="input-enemy" type="text" disabled />
      </div>
    </div>
  );
}
