import type { FriendOrEnemy } from "../../types";

interface SideStatus {
	activeField: string | null;
	activeDerivedField: string | null;
	coolTimeText: string;
	regenCoolTimeText: string;
	shieldCoolTimeText: string;
	guardianCoolTimeText: string;
	guardianParry: number;
	disabledFields: string[];
	activeRegen: boolean;
}

interface CommandStatusProps {
	commandList: string[];
	subCommandMap: Record<string, string[]>;
	shieldCommandSet: Set<string>;
	gameEnded: boolean;
	friend: SideStatus;
	enemy: SideStatus;
}

export default function CommandStatus({
	commandList,
	subCommandMap,
	shieldCommandSet,
	gameEnded,
	friend,
	enemy,
}: CommandStatusProps) {
	return (
		<div className="wrapper-status">
			{(["friend", "enemy"] as FriendOrEnemy[]).map((side) => {
				const status = side === "friend" ? friend : enemy;
				const {
					activeField,
					activeDerivedField,
					coolTimeText,
					regenCoolTimeText,
					shieldCoolTimeText,
					guardianCoolTimeText,
					guardianParry,
					disabledFields,
					activeRegen,
				} = status;
				const inCoolTime = coolTimeText !== "";
				const inRegenCoolTime = regenCoolTimeText !== "";
				const inShieldCoolTime = shieldCoolTimeText !== "";
				const inGuardianCoolTime = guardianCoolTimeText !== "";

				return (
					<div key={side} className="sub-wrapper-status">
						{commandList.flatMap((cmd) => {
							const subs = subCommandMap[cmd] ?? [];

							let itemClass = "";
							if (disabledFields.includes(cmd)) {
								itemClass = "permanently-disabled";
							} else if (cmd === activeField) {
								switch (cmd) {
									case "flame field": itemClass = "flame-active"; break;
									case "ocean field": itemClass = "ocean-active"; break;
									case "earth field": itemClass = "earth-active"; break;
									case "holy field":  itemClass = "holy-active";  break;
								}
							} else if (gameEnded || inCoolTime) {
								itemClass = "grayed-out";
							}

							const topItem = (
								<span key={cmd} className={`command-item ${itemClass}`}>
									{cmd === activeField && <span className="orbit-dot" />}
									{cmd}
								</span>
							);

							const subItems = subs.map((sub) => {
								let subClass = "sub-command";
								// guardian CT 中は guardian コマンドのみフィールド非アクティブ免除
								const isGuardianRunning =
									sub === "guardian" && inGuardianCoolTime;
								if (cmd !== activeField && !isGuardianRunning) {
									subClass += gameEnded ? " grayed-out" : " field-inactive";
								} else if (sub === activeDerivedField) {
									subClass += " swamp-active";
								} else if (sub === "regenerate") {
									if (activeRegen) subClass += " regen-active";
									else if (inRegenCoolTime) subClass += " grayed-out";
									else subClass += " holy-sub";
								} else if (shieldCommandSet.has(sub)) {
									if (inShieldCoolTime) subClass += " grayed-out";
									else {
										switch (cmd) {
											case "flame field": subClass += " flame-sub"; break;
											case "ocean field": subClass += " ocean-sub"; break;
											case "earth field": subClass += " earth-sub"; break;
											case "holy field":  subClass += " holy-sub";  break;
										}
									}
								} else if (sub === "guardian") {
									// CT 中はアクティブ色（parry count が表示される）
									subClass += " earth-sub";
								} else if (inCoolTime) {
									subClass += " grayed-out";
								} else {
									switch (cmd) {
										case "flame field": subClass += " flame-sub"; break;
										case "ocean field": subClass += " ocean-sub"; break;
										case "earth field": subClass += " earth-sub"; break;
										case "holy field":  subClass += " holy-sub";  break;
									}
								}
								return (
									<span key={sub} className={`command-item ${subClass}`}>
										{sub === activeDerivedField && (
											<span className="orbit-dot" />
										)}
										{sub}
										{sub === "guardian" && guardianParry > 0 && (
											<span className="parry-count"> ({guardianParry})</span>
										)}
									</span>
								);
							});

							return [topItem, ...subItems];
						})}
					</div>
				);
			})}
		</div>
	);
}
