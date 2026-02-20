export const RESERVED_KEYS = new Set([
	// CommandEntry
	"damage",
	"damageTarget",
	"defense",
	"defenseTarget",
	"coolTime",
	"duration",
	"attribute",
	"parentCommand",
	"originalParams",
	// OriginalParams
	"cancelField",
	"parryCount",
	"commandDelay",
	"delayTarget",
]);

export const HP_MAX = 300;
export const HP_INIT = 300;
// export const GAME_DURATION = 180;
export const GAME_DURATION = 5999; // デバッグ用
// export const IS_DEBUG = false;
export const IS_DEBUG = true; // デバッグ用

export const ATTRIBUTE = {
	PHYSICAL: "physical",
	MAGIC: "magic",
	FIELD: "field",
	BREATH: "breath",
} as const;

export type Attribute = (typeof ATTRIBUTE)[keyof typeof ATTRIBUTE];
