import { type MutableRefObject, useRef, useState } from "react";
import { ATTRIBUTE, type Attribute, HP_INIT, HP_MAX } from "../const";
import type { FriendOrEnemy } from "../types";

export interface HpDelta {
	key: number;
	amount: number; // 絶対値
}

export interface HpDeltas {
	increase: HpDelta | null; // 回復分（緑+）
	decrease: HpDelta | null; // ダメージ分（赤-）
}

export function useHP(
	gameEndedRef: MutableRefObject<boolean>,
	defenseFriendRef: MutableRefObject<number>,
	defenseEnemyRef: MutableRefObject<number>,
	friendGuardianParryRef: MutableRefObject<number>,
	enemyGuardianParryRef: MutableRefObject<number>,
	onParryUsed: (side: FriendOrEnemy, remaining: number) => void,
	onDeath: () => void,
) {
	const [hpFriend, setHpFriend] = useState(HP_INIT);
	const [hpEnemy, setHpEnemy] = useState(HP_INIT);
	const hpFriendRef = useRef(HP_INIT);
	const hpEnemyRef = useRef(HP_INIT);

	const [hpDeltasFriend, setHpDeltasFriend] = useState<HpDeltas>({ increase: null, decrease: null });
	const [hpDeltasEnemy, setHpDeltasEnemy] = useState<HpDeltas>({ increase: null, decrease: null });
	const keyRefs = useRef({ friendInc: 0, friendDec: 0, enemyInc: 0, enemyDec: 0 });

	const onDeathRef = useRef(onDeath);
	onDeathRef.current = onDeath;

	const onParryUsedRef = useRef(onParryUsed);
	onParryUsedRef.current = onParryUsed;

	const PARRYABLE_ATTRIBUTES = new Set<Attribute>([
		ATTRIBUTE.PHYSICAL,
		ATTRIBUTE.MAGIC,
		ATTRIBUTE.BREATH,
	]);

	const isParryable = (damage: number, attribute: Attribute | null): boolean =>
		damage > 0 && attribute !== null && PARRYABLE_ATTRIBUTES.has(attribute);

	// attribute が parryable かつ damage > 0 のときのみパリィ判定する
	const giveDamage = (
		damage: number,
		side: FriendOrEnemy,
		attribute: Attribute | null = null,
	) => {
		if (gameEndedRef.current) return;

		if (isParryable(damage, attribute)) {
			const parryRef =
				side === "friend" ? friendGuardianParryRef : enemyGuardianParryRef;
			if (parryRef.current > 0) {
				parryRef.current--;
				onParryUsedRef.current(side, parryRef.current);
				return; // パリィ成功：ダメージをキャンセル
			}
		}

		const defense =
			side === "friend" ? defenseFriendRef.current : defenseEnemyRef.current;
		const actualDamage = damage > 0 ? Math.max(0, damage - defense) : damage;
		if (side === "friend") {
			const current = hpFriendRef.current;
			const next = Math.min(HP_MAX, current - actualDamage);
			const delta = next - current;
			hpFriendRef.current = next;
			setHpFriend(next);
			if (delta < 0) {
				keyRefs.current.friendDec += 1;
				setHpDeltasFriend((prev) => ({
					...prev,
					decrease: { amount: Math.abs(delta), key: keyRefs.current.friendDec },
				}));
			} else if (delta > 0) {
				keyRefs.current.friendInc += 1;
				setHpDeltasFriend((prev) => ({
					...prev,
					increase: { amount: delta, key: keyRefs.current.friendInc },
				}));
			}
			console.log(`[HP] 自分: ${next} / 相手: ${hpEnemyRef.current}`);
			if (next <= 0) onDeathRef.current();
		} else {
			const current = hpEnemyRef.current;
			const next = Math.min(HP_MAX, current - actualDamage);
			const delta = next - current;
			hpEnemyRef.current = next;
			setHpEnemy(next);
			if (delta < 0) {
				keyRefs.current.enemyDec += 1;
				setHpDeltasEnemy((prev) => ({
					...prev,
					decrease: { amount: Math.abs(delta), key: keyRefs.current.enemyDec },
				}));
			} else if (delta > 0) {
				keyRefs.current.enemyInc += 1;
				setHpDeltasEnemy((prev) => ({
					...prev,
					increase: { amount: delta, key: keyRefs.current.enemyInc },
				}));
			}
			console.log(`[HP] 自分: ${hpFriendRef.current} / 相手: ${next}`);
			if (next <= 0) onDeathRef.current();
		}
	};

	const giveSlipDamage = (
		damage: number,
		side: FriendOrEnemy,
	): ReturnType<typeof setInterval> => {
		const refHp = side === "friend" ? hpFriendRef : hpEnemyRef;
		const interval = setInterval(() => {
			giveDamage(damage, side); // スリップダメージはパリィ対象外（attribute=null）
			if (refHp.current <= 0) clearInterval(interval);
		}, 1000);
		return interval;
	};

	return {
		hpFriend,
		hpEnemy,
		hpFriendRef,
		hpEnemyRef,
		hpDeltasFriend,
		hpDeltasEnemy,
		giveDamage,
		giveSlipDamage,
	};
}
