import { useRef, useState } from "react";
import type { FriendOrEnemy } from "../types";

export function useCoolTime() {
	const [coolTimeFriendText, setCoolTimeFriendText] = useState("");
	const [coolTimeEnemyText, setCoolTimeEnemyText] = useState("");
	const [regenCoolTimeFriendText, setRegenCoolTimeFriendText] = useState("");
	const [regenCoolTimeEnemyText, setRegenCoolTimeEnemyText] = useState("");
	const [shieldCoolTimeFriendText, setShieldCoolTimeFriendText] = useState("");
	const [shieldCoolTimeEnemyText, setShieldCoolTimeEnemyText] = useState("");

	const inCoolTimeFriendRef = useRef(false);
	const inCoolTimeEnemyRef = useRef(false);
	const inRegenCoolTimeFriendRef = useRef(false);
	const inRegenCoolTimeEnemyRef = useRef(false);
	const inShieldCoolTimeFriendRef = useRef(false);
	const inShieldCoolTimeEnemyRef = useRef(false);
	const friendShieldCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const enemyShieldCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);

	const generateCoolTime = (coolTimeSec: number, side: FriendOrEnemy) => {
		if (side === "friend") inCoolTimeFriendRef.current = true;
		else inCoolTimeEnemyRef.current = true;

		const setText =
			side === "friend" ? setCoolTimeFriendText : setCoolTimeEnemyText;
		let remaining = coolTimeSec;

		const interval = setInterval(() => {
			const m = Math.floor(remaining / 60);
			const s = remaining % 60;
			setText(
				`クールタイム ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
			);
			if (remaining <= 0) {
				clearInterval(interval);
				if (side === "friend") {
					inCoolTimeFriendRef.current = false;
					setCoolTimeFriendText("");
				} else {
					inCoolTimeEnemyRef.current = false;
					setCoolTimeEnemyText("");
				}
			}
			remaining--;
		}, 1000);
	};

	const generateRegenCoolTime = (coolTimeSec: number, side: FriendOrEnemy, skillName: string) => {
		if (side === "friend") inRegenCoolTimeFriendRef.current = true;
		else inRegenCoolTimeEnemyRef.current = true;

		const setText =
			side === "friend"
				? setRegenCoolTimeFriendText
				: setRegenCoolTimeEnemyText;
		let remaining = coolTimeSec;

		const interval = setInterval(() => {
			const m = Math.floor(remaining / 60);
			const s = remaining % 60;
			setText(
				`${skillName} ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
			);
			if (remaining <= 0) {
				clearInterval(interval);
				if (side === "friend") {
					inRegenCoolTimeFriendRef.current = false;
					setRegenCoolTimeFriendText("");
				} else {
					inRegenCoolTimeEnemyRef.current = false;
					setRegenCoolTimeEnemyText("");
				}
			}
			remaining--;
		}, 1000);
	};

	const generateShieldCoolTime = (coolTimeSec: number, side: FriendOrEnemy, skillName: string) => {
		if (side === "friend") inShieldCoolTimeFriendRef.current = true;
		else inShieldCoolTimeEnemyRef.current = true;

		const setText =
			side === "friend"
				? setShieldCoolTimeFriendText
				: setShieldCoolTimeEnemyText;
		const intervalRef =
			side === "friend"
				? friendShieldCoolTimeIntervalRef
				: enemyShieldCoolTimeIntervalRef;

		if (intervalRef.current) clearInterval(intervalRef.current);
		let remaining = coolTimeSec;

		intervalRef.current = setInterval(() => {
			const m = Math.floor(remaining / 60);
			const s = remaining % 60;
			setText(
				`${skillName} ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
			);
			if (remaining <= 0) {
				clearInterval(intervalRef.current!);
				intervalRef.current = null;
				if (side === "friend") {
					inShieldCoolTimeFriendRef.current = false;
					setShieldCoolTimeFriendText("");
				} else {
					inShieldCoolTimeEnemyRef.current = false;
					setShieldCoolTimeEnemyText("");
				}
			}
			remaining--;
		}, 1000);
	};

	// cancelField から呼ばれるシールドCTの強制クリア
	const clearShieldCoolTime = (side: FriendOrEnemy) => {
		const intervalRef =
			side === "friend"
				? friendShieldCoolTimeIntervalRef
				: enemyShieldCoolTimeIntervalRef;
		if (intervalRef.current === null) return;
		clearInterval(intervalRef.current);
		intervalRef.current = null;
		if (side === "friend") {
			inShieldCoolTimeFriendRef.current = false;
			setShieldCoolTimeFriendText("");
		} else {
			inShieldCoolTimeEnemyRef.current = false;
			setShieldCoolTimeEnemyText("");
		}
	};

	return {
		state: {
			coolTimeFriendText,
			coolTimeEnemyText,
			regenCoolTimeFriendText,
			regenCoolTimeEnemyText,
			shieldCoolTimeFriendText,
			shieldCoolTimeEnemyText,
		},
		refs: {
			inCoolTimeFriendRef,
			inCoolTimeEnemyRef,
			inRegenCoolTimeFriendRef,
			inRegenCoolTimeEnemyRef,
			inShieldCoolTimeFriendRef,
			inShieldCoolTimeEnemyRef,
		},
		generateCoolTime,
		generateRegenCoolTime,
		generateShieldCoolTime,
		clearShieldCoolTime,
	};
}
