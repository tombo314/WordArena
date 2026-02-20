import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { type Attribute, IS_DEBUG } from "../const";
import type { FriendOrEnemy } from "../types";
import { useActivateCommand } from "./useActivateCommand";
import { useCommandData } from "./useCommandData";
import { useCoolTime } from "./useCoolTime";
import { useEnemyAI } from "./useEnemyAI";
import { useGameTimer } from "./useGameTimer";
import { useHP } from "./useHP";

export function useBattle(socket: Socket) {
	const [gameStarted, setGameStarted] = useState(IS_DEBUG);
	const [gameEnded, setGameEnded] = useState(false);
	const [inputFriend, setInputFriend] = useState("");
	const [messageFriend, setMessageFriend] = useState("");
	const [messageEnemy, setMessageEnemy] = useState("");
	const [activeFriendField, setActiveFriendField] = useState<string | null>(
		null,
	);
	const [activeEnemyField, setActiveEnemyField] = useState<string | null>(null);
	const [disabledFriendFields, setDisabledFriendFields] = useState<string[]>(
		[],
	);
	const [disabledEnemyFields, setDisabledEnemyFields] = useState<string[]>([]);
	const [activeFriendDerivedField, setActiveFriendDerivedField] = useState<
		string | null
	>(null);
	const [activeEnemyDerivedField, setActiveEnemyDerivedField] = useState<
		string | null
	>(null);
	const [activeFriendRegen, setActiveFriendRegen] = useState(false);
	const [activeEnemyRegen, setActiveEnemyRegen] = useState(false);
	const [attributeFriend, setAttributeFriend] = useState<Attribute | null>(
		null,
	);
	const [attributeEnemy, setAttributeEnemy] = useState<Attribute | null>(null);
	const attributeKeyFriendRef = useRef(0);
	const attributeKeyEnemyRef = useRef(0);
	const [attributeKeyFriend, setAttributeKeyFriend] = useState(0);
	const [attributeKeyEnemy, setAttributeKeyEnemy] = useState(0);

	const [defenseFriend, setDefenseFriend] = useState(0);
	const [defenseEnemy, setDefenseEnemy] = useState(0);
	const [guardianParryFriend, setGuardianParryFriend] = useState(0);
	const [guardianParryEnemy, setGuardianParryEnemy] = useState(0);

	const gameEndedRef = useRef(false);
	const defenseFriendRef = useRef(0);
	const defenseEnemyRef = useRef(0);
	const friendGuardianParryRef = useRef(0);
	const enemyGuardianParryRef = useRef(0);
	const friendFieldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);
	const enemyFieldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);
	const friendRegenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);
	const enemyRegenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);
	const friendShieldDefenseRef = useRef(0);
	const enemyShieldDefenseRef = useRef(0);
	const disabledFriendFieldsRef = useRef(new Set<string>());
	const disabledEnemyFieldsRef = useRef(new Set<string>());
	const activeFriendFieldRef = useRef<string | null>(null);
	const activeEnemyFieldRef = useRef<string | null>(null);
	const activeFriendDerivedFieldRef = useRef<string | null>(null);
	const activeEnemyDerivedFieldRef = useRef<string | null>(null);

	// handleGameEnd の前方参照用 ref（useHP / useGameTimer に渡すため）
	const handleGameEndRef = useRef<() => void>(() => {});

	const { commandList, subCommandMap, commandDataRef, shieldCommandSet } =
		useCommandData(socket);
	const { timeLeft } = useGameTimer(gameStarted, gameEnded, () =>
		handleGameEndRef.current(),
	);
	const coolTime = useCoolTime();

	// パリィ消耗時：残カウントを state に反映し、0になったら guardian CT を強制終了
	const onParryUsed = (side: FriendOrEnemy, remaining: number) => {
		if (side === "friend") setGuardianParryFriend(remaining);
		else setGuardianParryEnemy(remaining);
		if (remaining === 0) {
			coolTime.clearGuardianCoolTime(side);
		}
	};

	const {
		hpFriend,
		hpEnemy,
		hpFriendRef,
		hpEnemyRef,
		giveDamage,
		giveSlipDamage,
	} = useHP(
		gameEndedRef,
		defenseFriendRef,
		defenseEnemyRef,
		friendGuardianParryRef,
		enemyGuardianParryRef,
		onParryUsed,
		() => handleGameEndRef.current(),
	);

	const showMessage = (
		message: string,
		side: FriendOrEnemy,
		attribute?: Attribute | null,
	) => {
		const setter = side === "friend" ? setMessageFriend : setMessageEnemy;
		setter("");
		setTimeout(() => setter(message), 100);
		if (attribute !== undefined) {
			const attrSetter =
				side === "friend" ? setAttributeFriend : setAttributeEnemy;
			attrSetter(attribute ?? null);
			if (attribute) {
				if (side === "friend") {
					attributeKeyFriendRef.current += 1;
					setAttributeKeyFriend(attributeKeyFriendRef.current);
				} else {
					attributeKeyEnemyRef.current += 1;
					setAttributeKeyEnemy(attributeKeyEnemyRef.current);
				}
			}
		}
	};

	// cancelField 専用（トップレベルコマンドのdefenseTarget解決）
	const getTarget = (
		commandName: string,
		side: FriendOrEnemy,
		damageOrDefense: "damage" | "defense",
	): FriendOrEnemy => {
		const key = damageOrDefense === "damage" ? "damageTarget" : "defenseTarget";
		const commandTarget = commandDataRef.current[commandName][
			key
		] as FriendOrEnemy;
		if (side === "friend") return commandTarget;
		return commandTarget === "friend" ? "enemy" : "friend";
	};

	const cancelField = (fieldName: string, side: FriendOrEnemy) => {
		const intervalRef =
			side === "friend" ? friendFieldIntervalRef : enemyFieldIntervalRef;
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		// 派生フィールドもクリア
		const derivedFieldRef =
			side === "friend"
				? activeFriendDerivedFieldRef
				: activeEnemyDerivedFieldRef;
		const setDerivedField =
			side === "friend"
				? setActiveFriendDerivedField
				: setActiveEnemyDerivedField;
		if (derivedFieldRef.current !== null) {
			derivedFieldRef.current = null;
			setDerivedField(null);
		}

		// フィールド切り替え時はサブコマンドで発動中のエフェクト（regenなど）をすべて停止する
		const regenRef =
			side === "friend" ? friendRegenIntervalRef : enemyRegenIntervalRef;
		if (regenRef.current !== null) {
			clearInterval(regenRef.current);
			regenRef.current = null;
		}
		if (side === "friend") setActiveFriendRegen(false);
		else setActiveEnemyRegen(false);

		coolTime.clearShieldCoolTime(side);

		if (side === "friend") {
			defenseFriendRef.current -= friendShieldDefenseRef.current;
			friendShieldDefenseRef.current = 0;
			setDefenseFriend(defenseFriendRef.current);
		} else {
			defenseEnemyRef.current -= enemyShieldDefenseRef.current;
			enemyShieldDefenseRef.current = 0;
			setDefenseEnemy(defenseEnemyRef.current);
		}

		const fieldCmd = commandDataRef.current[fieldName];
		if (fieldCmd) {
			const defense = fieldCmd.defense as number;
			if (defense > 0) {
				const defenseTarget = getTarget(fieldName, side, "defense");
				if (defenseTarget === "friend") {
					defenseFriendRef.current -= defense;
					setDefenseFriend(defenseFriendRef.current);
				} else {
					defenseEnemyRef.current -= defense;
					setDefenseEnemy(defenseEnemyRef.current);
				}
			}
		}
	};

	const { activateCommand } = useActivateCommand({
		coolTime,
		commandDataRef,
		shieldCommandSet,
		activeFriendFieldRef,
		activeEnemyFieldRef,
		activeFriendDerivedFieldRef,
		activeEnemyDerivedFieldRef,
		disabledFriendFieldsRef,
		disabledEnemyFieldsRef,
		defenseFriendRef,
		defenseEnemyRef,
		friendFieldIntervalRef,
		enemyFieldIntervalRef,
		friendRegenIntervalRef,
		enemyRegenIntervalRef,
		friendShieldDefenseRef,
		enemyShieldDefenseRef,
		showMessage,
		cancelField,
		giveDamage,
		giveSlipDamage,
		setInputFriend,
		setActiveFriendField,
		setActiveEnemyField,
		setActiveFriendDerivedField,
		setActiveEnemyDerivedField,
		setActiveFriendRegen,
		setActiveEnemyRegen,
		setDisabledFriendFields,
		setDisabledEnemyFields,
		setDefenseFriend,
		setDefenseEnemy,
		friendGuardianParryRef,
		enemyGuardianParryRef,
		setGuardianParryFriend,
		setGuardianParryEnemy,
	});

	const handleGameEnd = () => {
		if (gameEndedRef.current) return;
		gameEndedRef.current = true;
		setGameEnded(true);
		stopEnemyAI();

		if (activeFriendFieldRef.current) {
			cancelField(activeFriendFieldRef.current, "friend");
			setActiveFriendField(null);
			activeFriendFieldRef.current = null;
		}
		if (activeEnemyFieldRef.current) {
			cancelField(activeEnemyFieldRef.current, "enemy");
			setActiveEnemyField(null);
			activeEnemyFieldRef.current = null;
		}
		if (activeFriendDerivedFieldRef.current) {
			activeFriendDerivedFieldRef.current = null;
			setActiveFriendDerivedField(null);
		}
		if (activeEnemyDerivedFieldRef.current) {
			activeEnemyDerivedFieldRef.current = null;
			setActiveEnemyDerivedField(null);
		}

		// guardian は ignoreFieldCancel のため cancelField でクリアされない → 個別にクリア
		coolTime.clearGuardianCoolTime("friend");
		coolTime.clearGuardianCoolTime("enemy");
		friendGuardianParryRef.current = 0;
		enemyGuardianParryRef.current = 0;

		const hpF = hpFriendRef.current;
		const hpE = hpEnemyRef.current;
		if (hpF < hpE) alert("相手の勝利です");
		else if (hpF > hpE) alert("あなたの勝利です");
		else alert("引き分けです");
	};

	// 毎レンダーで最新の handleGameEnd を ref に保持
	handleGameEndRef.current = handleGameEnd;

	const { inputEnemy, startEnemyAI, stopEnemyAI } = useEnemyAI({
		commandDataRef,
		coolTimeRefs: coolTime.refs,
		activeEnemyFieldRef,
		activeEnemyDerivedFieldRef,
		disabledEnemyFieldsRef,
		activateEnemyCommand: (cmd: string) => activateCommand(cmd, "enemy"),
	});

	// IS_DEBUG=true のときは StartScreen をスキップするので、マウント時に即起動する
	// biome-ignore lint/correctness/useExhaustiveDependencies: IS_DEBUG is a constant, intentionally run once on mount
	useEffect(() => {
		if (IS_DEBUG) startEnemyAI();
	}, []);

	const { state: ctState } = coolTime;

	return {
		state: {
			gameStarted,
			gameEnded,
			hpFriend,
			hpEnemy,
			defenseFriend,
			defenseEnemy,
			timeLeft,
			inputFriend,
			messageFriend,
			messageEnemy,
			coolTimeFriendText: ctState.coolTimeFriendText,
			coolTimeEnemyText: ctState.coolTimeEnemyText,
			regenCoolTimeFriendText: ctState.regenCoolTimeFriendText,
			regenCoolTimeEnemyText: ctState.regenCoolTimeEnemyText,
			shieldCoolTimeFriendText: ctState.shieldCoolTimeFriendText,
			shieldCoolTimeEnemyText: ctState.shieldCoolTimeEnemyText,
			guardianCoolTimeFriendText: ctState.guardianCoolTimeFriendText,
			guardianCoolTimeEnemyText: ctState.guardianCoolTimeEnemyText,
			guardianParryFriend,
			guardianParryEnemy,
			commandList,
			subCommandMap,
			shieldCommandSet,
			activeFriendField,
			activeEnemyField,
			activeFriendDerivedField,
			activeEnemyDerivedField,
			disabledFriendFields,
			disabledEnemyFields,
			activeFriendRegen,
			activeEnemyRegen,
			attributeFriend,
			attributeEnemy,
			attributeKeyFriend,
			attributeKeyEnemy,
			inputEnemy,
		},
		actions: {
			handleGameStart: () => {
				setGameStarted(true);
				startEnemyAI();
			},
			setInputFriend,
			activateFriendCommand: (cmd: string) => activateCommand(cmd, "friend"),
		},
	};
}
