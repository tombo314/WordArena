import type { MutableRefObject } from "react";
import { ATTRIBUTE } from "../const";
import type { Attribute } from "../const";
import type { CommandEntry, FriendOrEnemy } from "../types";
import type { useCoolTime } from "./useCoolTime";

const SHIELD_COMMANDS = ["flame shield", "splash shield", "protect"];
const RESERVED_KEYS = new Set([
	"damage",
	"damageTarget",
	"defense",
	"defenseTarget",
	"coolTime",
	"attribute",
]);

interface Params {
	coolTime: ReturnType<typeof useCoolTime>;
	commandDataRef: MutableRefObject<Record<string, CommandEntry>>;
	activeFriendFieldRef: MutableRefObject<string | null>;
	activeEnemyFieldRef: MutableRefObject<string | null>;
	activeFriendDerivedFieldRef: MutableRefObject<string | null>;
	activeEnemyDerivedFieldRef: MutableRefObject<string | null>;
	disabledFriendFieldsRef: MutableRefObject<Set<string>>;
	disabledEnemyFieldsRef: MutableRefObject<Set<string>>;
	defenseFriendRef: MutableRefObject<number>;
	defenseEnemyRef: MutableRefObject<number>;
	friendFieldIntervalRef: MutableRefObject<ReturnType<
		typeof setInterval
	> | null>;
	enemyFieldIntervalRef: MutableRefObject<ReturnType<
		typeof setInterval
	> | null>;
	friendRegenIntervalRef: MutableRefObject<ReturnType<
		typeof setInterval
	> | null>;
	enemyRegenIntervalRef: MutableRefObject<ReturnType<
		typeof setInterval
	> | null>;
	friendShieldDefenseRef: MutableRefObject<number>;
	enemyShieldDefenseRef: MutableRefObject<number>;
	showMessage: (message: string, side: FriendOrEnemy, attribute?: Attribute | null) => void;
	cancelField: (fieldName: string, side: FriendOrEnemy) => void;
	giveDamage: (damage: number, target: FriendOrEnemy) => void;
	giveSlipDamage: (
		damage: number,
		target: FriendOrEnemy,
	) => ReturnType<typeof setInterval>;
	setInputFriend: (value: string) => void;
	setActiveFriendField: (field: string | null) => void;
	setActiveEnemyField: (field: string | null) => void;
	setActiveFriendDerivedField: (field: string | null) => void;
	setActiveEnemyDerivedField: (field: string | null) => void;
	setActiveFriendRegen: (value: boolean) => void;
	setActiveEnemyRegen: (value: boolean) => void;
	setDisabledFriendFields: (fields: string[]) => void;
	setDisabledEnemyFields: (fields: string[]) => void;
}

const getTargetFromData = (
	cmdData: CommandEntry,
	side: FriendOrEnemy,
	key: "damageTarget" | "defenseTarget",
): FriendOrEnemy | null => {
	const commandTarget = cmdData[key] as FriendOrEnemy | null;
	if (!commandTarget) return null;
	if (side === "friend") return commandTarget;
	return commandTarget === "friend" ? "enemy" : "friend";
};

export function useActivateCommand(p: Params) {
	const activateCommand = (command: string, side: FriendOrEnemy): boolean => {
		const { refs } = p.coolTime;
		const inCoolTime =
			side === "friend"
				? refs.inCoolTimeFriendRef.current
				: refs.inCoolTimeEnemyRef.current;
		const inRegenCoolTime =
			side === "friend"
				? refs.inRegenCoolTimeFriendRef.current
				: refs.inRegenCoolTimeEnemyRef.current;
		const inShieldCoolTime =
			side === "friend"
				? refs.inShieldCoolTimeFriendRef.current
				: refs.inShieldCoolTimeEnemyRef.current;
		const activeField =
			side === "friend"
				? p.activeFriendFieldRef.current
				: p.activeEnemyFieldRef.current;
		const activeDerivedField =
			side === "friend"
				? p.activeFriendDerivedFieldRef.current
				: p.activeEnemyDerivedFieldRef.current;
		const disabledRef =
			side === "friend" ? p.disabledFriendFieldsRef : p.disabledEnemyFieldsRef;

		const isTopLevel = command in p.commandDataRef.current;
		const activeFieldData = activeField
			? (p.commandDataRef.current[activeField] as Record<string, unknown>)
			: null;
		const activeDerivedFieldData = activeDerivedField && activeField
			? (p.commandDataRef.current[activeField] as Record<string, unknown>)?.[activeDerivedField] as Record<string, unknown> | undefined
			: null;
		const isSubCmd =
			!isTopLevel &&
			activeField !== null &&
			activeFieldData !== null &&
			!RESERVED_KEYS.has(command) &&
			(command in activeFieldData ||
				(activeDerivedFieldData != null && command in activeDerivedFieldData));

		const cmdData: CommandEntry | null = isTopLevel
			? p.commandDataRef.current[command]
			: isSubCmd
				? command in (activeFieldData ?? {})
					? (p.commandDataRef.current[activeField ?? ""] as Record<string, CommandEntry>)[command]
					: activeDerivedFieldData != null && command in activeDerivedFieldData
						? (activeDerivedFieldData as Record<string, CommandEntry>)[command]
						: null
				: null;

		if (!cmdData) {
			p.showMessage("無効なコマンドです", side);
			return false;
		}
		if (disabledRef.current.has(command)) {
			p.showMessage("使用不可のフィールドです", side);
			return false;
		}
		if (command === "regenerate" && inRegenCoolTime) {
			p.showMessage("リジェネのクールタイム中です", side);
			return false;
		}
		if (SHIELD_COMMANDS.includes(command) && inShieldCoolTime) {
			p.showMessage("シールドのクールタイム中です", side);
			return false;
		}
		if (
			command !== "regenerate" &&
			!SHIELD_COMMANDS.includes(command) &&
			inCoolTime
		) {
			p.showMessage("スキルのクールタイム中です", side);
			return false;
		}
		if (command === activeField) {
			p.showMessage("スキルのクールタイム中です", side);
			return false;
		}
		if (command === activeDerivedField) {
			p.showMessage("スキルのクールタイム中です", side);
			return false;
		}

		const damage = cmdData.damage as number;
		const coolTimeSec = cmdData.coolTime as number;
		const damageTarget = getTargetFromData(cmdData, side, "damageTarget");

		if (command === "regenerate") {
			if (coolTimeSec >= 0) p.coolTime.generateRegenCoolTime(coolTimeSec, side);
		} else if (SHIELD_COMMANDS.includes(command)) {
			if (coolTimeSec >= 0)
				p.coolTime.generateShieldCoolTime(coolTimeSec, side);
		} else {
			if (coolTimeSec >= 0) p.coolTime.generateCoolTime(coolTimeSec, side);
		}
		if (side === "friend") p.setInputFriend("");

		if ((command === "attack" || command === "heal") && damageTarget !== null) {
			p.giveDamage(damage, damageTarget);
		} else if (isSubCmd && cmdData.attribute === ATTRIBUTE.FIELD) {
			// 派生フィールド（例: swamp）- 親フィールドはキープしたまま派生フィールドとして起動
			const derivedFieldRef =
				side === "friend" ? p.activeFriendDerivedFieldRef : p.activeEnemyDerivedFieldRef;
			const setDerivedField =
				side === "friend" ? p.setActiveFriendDerivedField : p.setActiveEnemyDerivedField;
			derivedFieldRef.current = command;
			setDerivedField(command);

			if (damage > 0 && damageTarget !== null) {
				const intervalRef =
					side === "friend"
						? p.friendFieldIntervalRef
						: p.enemyFieldIntervalRef;
				// 既存のインターバルを止めてslipダメージに切り替え
				if (intervalRef.current !== null) clearInterval(intervalRef.current);
				intervalRef.current = p.giveSlipDamage(damage, damageTarget);
			}
		} else if (cmdData.attribute === ATTRIBUTE.FIELD) {
			if (activeField !== null) p.cancelField(activeField, side);

			if (damage > 0 && damageTarget !== null) {
				const intervalRef =
					side === "friend"
						? p.friendFieldIntervalRef
						: p.enemyFieldIntervalRef;
				intervalRef.current = p.giveSlipDamage(damage, damageTarget);
			} else {
				const defense = cmdData.defense as number;
				const defenseTarget = getTargetFromData(cmdData, side, "defenseTarget");
				if (defense > 0 && defenseTarget) {
					if (defenseTarget === "friend") p.defenseFriendRef.current += defense;
					else p.defenseEnemyRef.current += defense;
				}
			}

			if (side === "friend") {
				p.setActiveFriendField(command);
				p.activeFriendFieldRef.current = command;
			} else {
				p.setActiveEnemyField(command);
				p.activeEnemyFieldRef.current = command;
			}
		} else if (isSubCmd) {
			if (activeField === null) return false;
			if (coolTimeSec === -1) {
				if (damageTarget !== null) p.giveDamage(damage, damageTarget);
				p.cancelField(activeField, side);
				if (side === "friend") {
					p.setActiveFriendField(null);
					p.activeFriendFieldRef.current = null;
					p.disabledFriendFieldsRef.current.add(activeField);
					p.setDisabledFriendFields([...p.disabledFriendFieldsRef.current]);
				} else {
					p.setActiveEnemyField(null);
					p.activeEnemyFieldRef.current = null;
					p.disabledEnemyFieldsRef.current.add(activeField);
					p.setDisabledEnemyFields([...p.disabledEnemyFieldsRef.current]);
				}
			} else if (command === "regenerate") {
				const regenRef =
					side === "friend"
						? p.friendRegenIntervalRef
						: p.enemyRegenIntervalRef;
				const setActiveRegen =
					side === "friend" ? p.setActiveFriendRegen : p.setActiveEnemyRegen;
				if (regenRef.current) clearInterval(regenRef.current);

				setActiveRegen(true);
				let remaining = 20;
				if (damageTarget === null) return false;
				const healTarget = damageTarget;
				const healAmount = damage;

				regenRef.current = setInterval(() => {
					p.giveDamage(healAmount, healTarget);
					remaining--;
					if (remaining <= 0) {
						if (regenRef.current !== null) clearInterval(regenRef.current);
						regenRef.current = null;
						setActiveRegen(false);
					}
				}, 1000);
			} else if (SHIELD_COMMANDS.includes(command)) {
				const defense = cmdData.defense as number;
				if (defense > 0) {
					if (side === "friend") {
						p.defenseFriendRef.current += defense;
						p.friendShieldDefenseRef.current += defense;
					} else {
						p.defenseEnemyRef.current += defense;
						p.enemyShieldDefenseRef.current += defense;
					}
				}
			} else {
				if (damage !== 0 && damageTarget) p.giveDamage(damage, damageTarget);
				const defense = cmdData.defense as number;
				const defenseTarget = getTargetFromData(cmdData, side, "defenseTarget");
				if (defense > 0 && defenseTarget) {
					if (defenseTarget === "friend") p.defenseFriendRef.current += defense;
					else p.defenseEnemyRef.current += defense;
				}
			}
		}

		p.showMessage(command, side, cmdData.attribute as Attribute);
		return true;
	};

	return { activateCommand };
}
