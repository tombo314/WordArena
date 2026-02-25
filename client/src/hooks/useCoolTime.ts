import { useRef, useState } from "react";
import type { FriendOrEnemy } from "../types";

type CoolTimeConfig = {
	setTextFriend: React.Dispatch<React.SetStateAction<string>>;
	setTextEnemy: React.Dispatch<React.SetStateAction<string>>;
	inCoolTimeFriendRef: React.MutableRefObject<boolean>;
	inCoolTimeEnemyRef: React.MutableRefObject<boolean>;
	intervalFriendRef: React.MutableRefObject<ReturnType<
		typeof setInterval
	> | null>;
	intervalEnemyRef: React.MutableRefObject<ReturnType<
		typeof setInterval
	> | null>;
};

function createCoolTimeGenerator(config: CoolTimeConfig) {
	return (
		coolTimeSec: number,
		side: FriendOrEnemy,
		displayPrefix: string,
		onExpire?: () => void,
	) => {
		if (side === "friend") config.inCoolTimeFriendRef.current = true;
		else config.inCoolTimeEnemyRef.current = true;

		const setText =
			side === "friend" ? config.setTextFriend : config.setTextEnemy;
		const intervalRef =
			side === "friend"
				? config.intervalFriendRef
				: config.intervalEnemyRef;
		if (intervalRef.current) clearInterval(intervalRef.current);
		let remaining = coolTimeSec;

		intervalRef.current = setInterval(() => {
			const m = Math.floor(remaining / 60);
			const s = remaining % 60;
			setText(
				`${displayPrefix} ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
			);
			if (remaining <= 0) {
				clearInterval(intervalRef.current!);
				intervalRef.current = null;
				if (side === "friend") {
					config.inCoolTimeFriendRef.current = false;
					config.setTextFriend("");
				} else {
					config.inCoolTimeEnemyRef.current = false;
					config.setTextEnemy("");
				}
				onExpire?.();
			}
			remaining--;
		}, 1000);
	};
}

function createCoolTimeClear(config: CoolTimeConfig) {
	return (side: FriendOrEnemy) => {
		const intervalRef =
			side === "friend"
				? config.intervalFriendRef
				: config.intervalEnemyRef;
		if (intervalRef.current === null) return;
		clearInterval(intervalRef.current);
		intervalRef.current = null;
		if (side === "friend") {
			config.inCoolTimeFriendRef.current = false;
			config.setTextFriend("");
		} else {
			config.inCoolTimeEnemyRef.current = false;
			config.setTextEnemy("");
		}
	};
}

export function useCoolTime() {
	const [coolTimeFriendText, setCoolTimeFriendText] = useState("");
	const [coolTimeEnemyText, setCoolTimeEnemyText] = useState("");
	const [regenCoolTimeFriendText, setRegenCoolTimeFriendText] = useState("");
	const [regenCoolTimeEnemyText, setRegenCoolTimeEnemyText] = useState("");
	const [shieldCoolTimeFriendText, setShieldCoolTimeFriendText] = useState("");
	const [shieldCoolTimeEnemyText, setShieldCoolTimeEnemyText] = useState("");
	const [guardianCoolTimeFriendText, setGuardianCoolTimeFriendText] =
		useState("");
	const [guardianCoolTimeEnemyText, setGuardianCoolTimeEnemyText] =
		useState("");
	const [shiningCoolTimeFriendText, setShiningCoolTimeFriendText] =
		useState("");
	const [shiningCoolTimeEnemyText, setShiningCoolTimeEnemyText] =
		useState("");

	const inCoolTimeFriendRef = useRef(false);
	const inCoolTimeEnemyRef = useRef(false);
	const inRegenCoolTimeFriendRef = useRef(false);
	const inRegenCoolTimeEnemyRef = useRef(false);
	const inShieldCoolTimeFriendRef = useRef(false);
	const inShieldCoolTimeEnemyRef = useRef(false);
	const inGuardianCoolTimeFriendRef = useRef(false);
	const inGuardianCoolTimeEnemyRef = useRef(false);
	const inShiningCoolTimeFriendRef = useRef(false);
	const inShiningCoolTimeEnemyRef = useRef(false);
	const friendCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const enemyCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const friendRegenCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const enemyRegenCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const friendShieldCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const enemyShieldCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const friendGuardianCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const enemyGuardianCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const friendShiningCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const enemyShiningCoolTimeIntervalRef = useRef<ReturnType<
		typeof setInterval
	> | null>(null);

	const coolTimeConfig: CoolTimeConfig = {
		setTextFriend: setCoolTimeFriendText,
		setTextEnemy: setCoolTimeEnemyText,
		inCoolTimeFriendRef,
		inCoolTimeEnemyRef,
		intervalFriendRef: friendCoolTimeIntervalRef,
		intervalEnemyRef: enemyCoolTimeIntervalRef,
	};
	const regenConfig: CoolTimeConfig = {
		setTextFriend: setRegenCoolTimeFriendText,
		setTextEnemy: setRegenCoolTimeEnemyText,
		inCoolTimeFriendRef: inRegenCoolTimeFriendRef,
		inCoolTimeEnemyRef: inRegenCoolTimeEnemyRef,
		intervalFriendRef: friendRegenCoolTimeIntervalRef,
		intervalEnemyRef: enemyRegenCoolTimeIntervalRef,
	};
	const shieldConfig: CoolTimeConfig = {
		setTextFriend: setShieldCoolTimeFriendText,
		setTextEnemy: setShieldCoolTimeEnemyText,
		inCoolTimeFriendRef: inShieldCoolTimeFriendRef,
		inCoolTimeEnemyRef: inShieldCoolTimeEnemyRef,
		intervalFriendRef: friendShieldCoolTimeIntervalRef,
		intervalEnemyRef: enemyShieldCoolTimeIntervalRef,
	};
	const guardianConfig: CoolTimeConfig = {
		setTextFriend: setGuardianCoolTimeFriendText,
		setTextEnemy: setGuardianCoolTimeEnemyText,
		inCoolTimeFriendRef: inGuardianCoolTimeFriendRef,
		inCoolTimeEnemyRef: inGuardianCoolTimeEnemyRef,
		intervalFriendRef: friendGuardianCoolTimeIntervalRef,
		intervalEnemyRef: enemyGuardianCoolTimeIntervalRef,
	};
	const shiningConfig: CoolTimeConfig = {
		setTextFriend: setShiningCoolTimeFriendText,
		setTextEnemy: setShiningCoolTimeEnemyText,
		inCoolTimeFriendRef: inShiningCoolTimeFriendRef,
		inCoolTimeEnemyRef: inShiningCoolTimeEnemyRef,
		intervalFriendRef: friendShiningCoolTimeIntervalRef,
		intervalEnemyRef: enemyShiningCoolTimeIntervalRef,
	};

	const generateCoolTimeBase = createCoolTimeGenerator(coolTimeConfig);
	const generateRegenCoolTimeBase = createCoolTimeGenerator(regenConfig);
	const generateShieldCoolTimeBase = createCoolTimeGenerator(shieldConfig);
	const generateGuardianCoolTimeBase = createCoolTimeGenerator(guardianConfig);
	const generateShiningCoolTimeBase = createCoolTimeGenerator(shiningConfig);

	const generateCoolTime = (
		coolTimeSec: number,
		side: FriendOrEnemy,
		onExpire?: () => void,
	) => generateCoolTimeBase(coolTimeSec, side, "クールタイム", onExpire);

	const generateRegenCoolTime = (
		coolTimeSec: number,
		side: FriendOrEnemy,
		skillName: string,
	) => generateRegenCoolTimeBase(coolTimeSec, side, skillName);

	const generateShieldCoolTime = (
		coolTimeSec: number,
		side: FriendOrEnemy,
		skillName: string,
		onExpire?: () => void,
	) => generateShieldCoolTimeBase(coolTimeSec, side, skillName, onExpire);

	const generateGuardianCoolTime = (
		coolTimeSec: number,
		side: FriendOrEnemy,
		skillName: string,
		onExpire?: () => void,
	) => generateGuardianCoolTimeBase(coolTimeSec, side, skillName, onExpire);

	const generateShiningCoolTime = (
		coolTimeSec: number,
		side: FriendOrEnemy,
		skillName: string,
		onExpire?: () => void,
	) => generateShiningCoolTimeBase(coolTimeSec, side, skillName, onExpire);

	// ゲーム終了時に呼ばれる通常CTの強制クリア
	const clearCoolTime = createCoolTimeClear(coolTimeConfig);

	// ゲーム終了時に呼ばれるリジェネCTの強制クリア
	const clearRegenCoolTime = createCoolTimeClear(regenConfig);

	// cancelField から呼ばれるシールドCTの強制クリア
	const clearShieldCoolTime = createCoolTimeClear(shieldConfig);

	// ゲーム終了・パリィ消耗時に呼ばれるguardian CTの強制クリア
	const clearGuardianCoolTime = createCoolTimeClear(guardianConfig);

	// ゲーム終了時に呼ばれる shining CT の強制クリア
	const clearShiningCoolTime = createCoolTimeClear(shiningConfig);

	return {
		state: {
			coolTimeFriendText,
			coolTimeEnemyText,
			regenCoolTimeFriendText,
			regenCoolTimeEnemyText,
			shieldCoolTimeFriendText,
			shieldCoolTimeEnemyText,
			guardianCoolTimeFriendText,
			guardianCoolTimeEnemyText,
			shiningCoolTimeFriendText,
			shiningCoolTimeEnemyText,
		},
		refs: {
			inCoolTimeFriendRef,
			inCoolTimeEnemyRef,
			inRegenCoolTimeFriendRef,
			inRegenCoolTimeEnemyRef,
			inShieldCoolTimeFriendRef,
			inShieldCoolTimeEnemyRef,
			inGuardianCoolTimeFriendRef,
			inGuardianCoolTimeEnemyRef,
			inShiningCoolTimeFriendRef,
			inShiningCoolTimeEnemyRef,
		},
		generateCoolTime,
		generateRegenCoolTime,
		generateShieldCoolTime,
		generateGuardianCoolTime,
		generateShiningCoolTime,
		clearCoolTime,
		clearRegenCoolTime,
		clearShieldCoolTime,
		clearGuardianCoolTime,
		clearShiningCoolTime,
	};
}
