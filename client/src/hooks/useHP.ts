import { type MutableRefObject, useRef, useState } from "react";
import { ATTRIBUTE, type Attribute, HP_INIT, HP_MAX } from "../const";
import type { FriendOrEnemy } from "../types";

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
			const next = Math.min(HP_MAX, hpFriendRef.current - actualDamage);
			hpFriendRef.current = next;
			setHpFriend(next);
			console.log(`[HP] 自分: ${next} / 相手: ${hpEnemyRef.current}`);
			if (next <= 0) onDeathRef.current();
		} else {
			const next = Math.min(HP_MAX, hpEnemyRef.current - actualDamage);
			hpEnemyRef.current = next;
			setHpEnemy(next);
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
		giveDamage,
		giveSlipDamage,
	};
}
