import type { Attribute } from "../const";

export interface OriginalParams {
	cancelField?: boolean;
	parryCount?: number;
	commandDelay?: number;
	delayTarget?: string;
	hasIndependentCT?: boolean;
	isShield?: boolean;
	ignoreFieldCancel?: boolean;
	isBlind?: boolean;
}

export interface CommandEntry {
	damage: number;
	damageTarget: "friend" | "enemy" | null;
	defense: number;
	defenseTarget: "friend" | "enemy" | null;
	coolTime: number;
	duration: number;
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

export interface StatusEffect {
	/** ユニークな識別子（Reactのkeyにも使用） */
	type: string;
	/** アイコン画像のパス */
	icon: string;
	/** 表示する数値（正なら+X、負なら-X） */
	value: number;
	/** 数値のテキスト色 */
	color: string;
}
