import type { MutableRefObject } from "react";
import { useRef, useState } from "react";
import { RESERVED_KEYS } from "../const";
import type { CommandData } from "../types";
import type { useCoolTime } from "./useCoolTime";

const SHIELD_COMMANDS = ["flame shield", "splash shield", "protect"];

interface Params {
	commandDataRef: MutableRefObject<CommandData>;
	coolTimeRefs: ReturnType<typeof useCoolTime>["refs"];
	activeEnemyFieldRef: MutableRefObject<string | null>;
	activeEnemyDerivedFieldRef: MutableRefObject<string | null>;
	disabledEnemyFieldsRef: MutableRefObject<Set<string>>;
	activateEnemyCommand: (cmd: string) => boolean;
}

export function useEnemyAI({
	commandDataRef,
	coolTimeRefs,
	activeEnemyFieldRef,
	activeEnemyDerivedFieldRef,
	disabledEnemyFieldsRef,
	activateEnemyCommand,
}: Params) {
	const [inputEnemy, setInputEnemy] = useState("");
	const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const activeRef = useRef(false);

	// 毎レンダーで最新の activateEnemyCommand を保持
	const activateEnemyCommandRef = useRef(activateEnemyCommand);
	activateEnemyCommandRef.current = activateEnemyCommand;

	const startEnemyAI = () => {
		if (activeRef.current) return;
		activeRef.current = true;

		const getAvailableCommands = (): string[] => {
			const data = commandDataRef.current;
			const available: string[] = [];
			const inCoolTime = coolTimeRefs.inCoolTimeEnemyRef.current;
			const inRegenCoolTime = coolTimeRefs.inRegenCoolTimeEnemyRef.current;
			const inShieldCoolTime = coolTimeRefs.inShieldCoolTimeEnemyRef.current;
			const inShiningCoolTime =
				coolTimeRefs.inShiningCoolTimeEnemyRef.current;
			const activeField = activeEnemyFieldRef.current;
			const activeDerivedField = activeEnemyDerivedFieldRef.current;
			const disabledFields = disabledEnemyFieldsRef.current;

			// トップレベルコマンド（通常CTでなければ使用可）
			if (!inCoolTime) {
				for (const cmd of Object.keys(data)) {
					if (!disabledFields.has(cmd) && cmd !== activeField) {
						available.push(cmd);
					}
				}
			}

			// アクティブフィールドのサブコマンド
			if (activeField && data[activeField]) {
				const fieldData = data[activeField] as Record<string, unknown>;
				const sources: Record<string, unknown>[] = [fieldData];
				if (activeDerivedField && fieldData[activeDerivedField]) {
					sources.push(
						fieldData[activeDerivedField] as Record<string, unknown>,
					);
				}
				for (const source of sources) {
					for (const cmd of Object.keys(source)) {
						if (RESERVED_KEYS.has(cmd)) continue;
						if (disabledFields.has(cmd)) continue;
						if (cmd === activeDerivedField) continue;
						if (cmd === "regenerate" && inRegenCoolTime) continue;
						if (SHIELD_COMMANDS.includes(cmd) && inShieldCoolTime) continue;
						if (cmd === "shining" && inShiningCoolTime) continue;
						if (
							!SHIELD_COMMANDS.includes(cmd) &&
							cmd !== "regenerate" &&
							cmd !== "shining" &&
							inCoolTime
						)
							continue;
						available.push(cmd);
					}
				}
			}

			return available;
		};

		const doAction = () => {
			if (!activeRef.current) return;

			const available = getAvailableCommands();
			if (available.length === 0) {
				aiTimerRef.current = setTimeout(doAction, 500);
				return;
			}

			const cmd = available[Math.floor(Math.random() * available.length)];
			let i = 0;
			setInputEnemy("");

			const typeNext = () => {
				if (!activeRef.current) return;
				i++;
				setInputEnemy(cmd.slice(0, i));
				if (i < cmd.length) {
					const delay = 80 + Math.random() * 80;
					typingTimerRef.current = setTimeout(typeNext, delay);
				} else {
					// 入力完了後、少し待ってから送信
					typingTimerRef.current = setTimeout(() => {
						if (!activeRef.current) return;
						activateEnemyCommandRef.current(cmd);
						setInputEnemy("");
						const nextDelay = 1000 + Math.random() * 3000;
						aiTimerRef.current = setTimeout(doAction, nextDelay);
					}, 200);
				}
			};

			// 思考時間
			const thinkDelay = 1000 + Math.random() * 2000;
			aiTimerRef.current = setTimeout(typeNext, thinkDelay);
		};

		// ゲーム開始後、最初のアクションまで少し待つ
		const initialDelay = 1000 + Math.random() * 2000;
		aiTimerRef.current = setTimeout(doAction, initialDelay);
	};

	const stopEnemyAI = () => {
		activeRef.current = false;
		if (aiTimerRef.current) {
			clearTimeout(aiTimerRef.current);
			aiTimerRef.current = null;
		}
		if (typingTimerRef.current) {
			clearTimeout(typingTimerRef.current);
			typingTimerRef.current = null;
		}
		setInputEnemy("");
	};

	return { inputEnemy, startEnemyAI, stopEnemyAI };
}
