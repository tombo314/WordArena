export const RESERVED_KEYS = new Set([
	// CommandEntry
	"damage",
	"damageTarget",
	"defense",
	"defenseTarget",
	"coolTime",
	"attribute",
	"parentCommand",
	"originalParams",
	// OriginalParams
	"cancelField",
	"parryCount",
	"commandDelay",
	"delayTarget",
]);

export const HP_MAX = 500;
export const HP_INIT = 450;
// export const GAME_DURATION = 180;
export const GAME_DURATION = 5999;
// export const IS_DEBUG = false;
export const IS_DEBUG = true;

export const ATTRIBUTE = {
	PHYSICAL: "physical",
	MAGIC: "magic",
	FIELD: "field",
	BREATH: "breath",
} as const;

export type Attribute = (typeof ATTRIBUTE)[keyof typeof ATTRIBUTE];
