import type { FriendOrEnemy } from "../../types";

const SHIELD_COMMANDS = ["flame shield", "splash shield", "protect"];

interface SideStatus {
  activeField: string | null;
  coolTimeText: string;
  regenCoolTimeText: string;
  shieldCoolTimeText: string;
  disabledFields: string[];
  activeRegen: boolean;
}

interface CommandStatusProps {
  commandList: string[];
  subCommandMap: Record<string, string[]>;
  gameEnded: boolean;
  friend: SideStatus;
  enemy: SideStatus;
}

export default function CommandStatus({
  commandList,
  subCommandMap,
  gameEnded,
  friend,
  enemy,
}: CommandStatusProps) {
  return (
    <div className="wrapper-status">
      {(["friend", "enemy"] as FriendOrEnemy[]).map((side) => {
        const status = side === "friend" ? friend : enemy;
        const { activeField, coolTimeText, regenCoolTimeText, shieldCoolTimeText, disabledFields, activeRegen } = status;
        const inCoolTime = coolTimeText !== "";
        const inRegenCoolTime = regenCoolTimeText !== "";
        const inShieldCoolTime = shieldCoolTimeText !== "";

        return (
          <div key={side} className="sub-wrapper-status">
            {commandList.flatMap((cmd) => {
              const subs = subCommandMap[cmd] ?? [];

              let itemClass = "";
              if (disabledFields.includes(cmd)) {
                itemClass = "permanently-disabled";
              } else if (cmd === activeField) {
                if (cmd === "flame field") itemClass = "flame-active";
                else if (cmd === "ocean field") itemClass = "ocean-active";
                else if (cmd === "earth field") itemClass = "earth-active";
                else if (cmd === "holy field") itemClass = "holy-active";
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
                if (cmd !== activeField) {
                  subClass += gameEnded ? " grayed-out" : " field-inactive";
                } else if (sub === "regenerate") {
                  if (activeRegen) subClass += " regen-active";
                  else if (inRegenCoolTime) subClass += " grayed-out";
                  else subClass += " holy-sub";
                } else if (SHIELD_COMMANDS.includes(sub)) {
                  if (inShieldCoolTime) subClass += " grayed-out";
                  else {
                    if (cmd === "flame field") subClass += " flame-sub";
                    else if (cmd === "ocean field") subClass += " ocean-sub";
                    else if (cmd === "earth field") subClass += " earth-sub";
                    else if (cmd === "holy field") subClass += " holy-sub";
                  }
                } else if (inCoolTime) {
                  subClass += " grayed-out";
                } else {
                  if (cmd === "flame field") subClass += " flame-sub";
                  else if (cmd === "ocean field") subClass += " ocean-sub";
                  else if (cmd === "earth field") subClass += " earth-sub";
                  else if (cmd === "holy field") subClass += " holy-sub";
                }
                return (
                  <span key={sub} className={`command-item ${subClass}`}>
                    {sub}
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
