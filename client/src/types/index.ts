export interface CommandEntry {
  damage: number;
  damageTarget: "friend" | "enemy" | null;
  defense: number;
  defenseTarget: "friend" | "enemy" | null;
  coolTime: number;
  [key: string]: CommandEntry | number | string | null;
}

export interface CommandData {
  [commandName: string]: CommandEntry;
}

export type FriendOrEnemy = "friend" | "enemy";
export type DamageOrDefense = "damage" | "defense";
