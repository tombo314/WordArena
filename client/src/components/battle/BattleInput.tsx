import { useRef } from "react";

const HISTORY_MAX = 5;

interface BattleInputProps {
	inputFriend: string;
	inputEnemy: string;
	setInputFriend: (v: string) => void;
	gameStarted: boolean;
	gameEnded: boolean;
	timeLeft: number;
	onSubmit: (command: string) => boolean;
}

function formatTime(sec: number) {
	const m = Math.floor(sec / 60);
	const s = sec % 60;
	return `残り時間 ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function BattleInput({
	inputFriend,
	inputEnemy,
	setInputFriend,
	gameStarted,
	gameEnded,
	timeLeft,
	onSubmit,
}: BattleInputProps) {
	const lastEnterTimeRef = useRef(0);
	// 古い順に格納。末尾が最新。
	const historyRef = useRef<string[]>([]);
	const historyIndexRef = useRef(-1); // -1 = 未ナビゲート状態
	const draftRef = useRef(""); // ナビゲート前の入力内容を保持
	const isNavigatingRef = useRef(false); // 矢印キーによる変更中フラグ

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowUp") {
			e.preventDefault();
			const history = historyRef.current;
			if (history.length === 0) return;
			if (historyIndexRef.current === -1) {
				draftRef.current = inputFriend;
				historyIndexRef.current = history.length - 1;
			} else if (historyIndexRef.current > 0) {
				historyIndexRef.current--;
			}
			isNavigatingRef.current = true;
			setInputFriend(history[historyIndexRef.current]);
			return;
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			const history = historyRef.current;
			if (historyIndexRef.current === -1) return;
			if (historyIndexRef.current < history.length - 1) {
				historyIndexRef.current++;
				isNavigatingRef.current = true;
				setInputFriend(history[historyIndexRef.current]);
			} else {
				historyIndexRef.current = -1;
				isNavigatingRef.current = true;
				setInputFriend(draftRef.current);
			}
			return;
		}

		if (e.key === "Enter" && gameStarted && !gameEnded) {
			const now = Date.now();
			if (now - lastEnterTimeRef.current < 150) return;
			lastEnterTimeRef.current = now;

			historyIndexRef.current = -1;
			draftRef.current = "";

			const success = onSubmit(inputFriend);
			// 有効なコマンドのみ履歴に追加
			if (success && inputFriend.trim() !== "") {
				const history = historyRef.current;
				history.push(inputFriend);
				if (history.length > HISTORY_MAX) history.shift();
			}
		}
	};

	return (
		<div className="wrapper-input">
			<div className="sub-wrapper-input friend-side">
				<span className="command-label">input</span>
				<input
					type="text"
					value={inputFriend}
					placeholder="コマンドを入力してください..."
					onChange={(e) => {
						if (isNavigatingRef.current) {
							isNavigatingRef.current = false;
							return;
						}
						setInputFriend(e.target.value);
						historyIndexRef.current = -1;
					}}
					onKeyDown={handleKeyDown}
					disabled={!gameStarted || gameEnded}
				/>
			</div>
			<div className="time">
				{gameEnded ? "残り時間 --:--" : formatTime(timeLeft)}
			</div>
			<div className="sub-wrapper-input">
				<input
					className="input-enemy"
					type="text"
					value={inputEnemy}
					readOnly
				/>
			</div>
		</div>
	);
}
