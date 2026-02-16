import type { Attribute } from "../const";

export interface OriginalParams {
	cancelField?: boolean;
	parryCount?: number;
	commandDelay?: number;
	delayTarget?: string;
}

export interface CommandEntry {
	damage: number;
	damageTarget: "friend" | "enemy" | null;
	defense: number;
	defenseTarget: "friend" | "enemy" | null;
	coolTime: number;
	attribute: Attribute;
	parentCommand: string | null;
	originalParams: OriginalParams | null;
	[key: string]: CommandEntry | OriginalParams | number | string | null;
}

export interface CommandData {
	[commandName: string]: CommandEntry;
}

export type FriendOrEnemy = "friend" | "enemy";
export type DamageOrDefense = "damage" | "defense";
