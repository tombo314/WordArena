import { useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { HP_INIT } from "../const";
import type { FriendOrEnemy } from "../types";

export function useHP(
  gameEndedRef: MutableRefObject<boolean>,
  defenseFriendRef: MutableRefObject<number>,
  defenseEnemyRef: MutableRefObject<number>,
  onDeath: () => void,
) {
  const [hpFriend, setHpFriend] = useState(HP_INIT);
  const [hpEnemy, setHpEnemy] = useState(HP_INIT);
  const hpFriendRef = useRef(HP_INIT);
  const hpEnemyRef = useRef(HP_INIT);

  // onDeath は毎レンダーで最新を参照させる
  const onDeathRef = useRef(onDeath);
  onDeathRef.current = onDeath;

  const giveDamage = (damage: number, side: FriendOrEnemy) => {
    if (gameEndedRef.current) return;
    const defense = side === "friend" ? defenseFriendRef.current : defenseEnemyRef.current;
    const actualDamage = damage > 0 ? Math.max(0, damage - defense) : damage;
    if (side === "friend") {
      const next = hpFriendRef.current - actualDamage;
      hpFriendRef.current = next;
      setHpFriend(next);
      if (next <= 0) onDeathRef.current();
    } else {
      const next = hpEnemyRef.current - actualDamage;
      hpEnemyRef.current = next;
      setHpEnemy(next);
      if (next <= 0) onDeathRef.current();
    }
  };

  const giveSlipDamage = (damage: number, side: FriendOrEnemy): ReturnType<typeof setInterval> => {
    const refHp = side === "friend" ? hpFriendRef : hpEnemyRef;
    const interval = setInterval(() => {
      giveDamage(damage, side);
      if (refHp.current <= 0) clearInterval(interval);
    }, 1000);
    return interval;
  };

  return { hpFriend, hpEnemy, hpFriendRef, hpEnemyRef, giveDamage, giveSlipDamage };
}
