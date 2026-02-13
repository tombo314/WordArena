import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { GAME_DURATION, HP_INIT, HP_MAX, IS_DEBUG } from "../const";
import type { CommandData, CommandEntry, FriendOrEnemy } from "../types";
import "../styles/battle.scss";

const FIELD_COMMANDS = ["flame field", "ocean field", "earth field", "holy field"];
const SLIP_DAMAGE_FIELDS = ["flame field", "holy field"];
const SHIELD_COMMANDS = ["flame shield", "splash shield", "protect"];
const RESERVED_KEYS = new Set(["damage", "damageTarget", "defense", "defenseTarget", "coolTime"]);

interface BattlePageProps {
  socket: Socket;
}

export default function BattlePage({ socket }: BattlePageProps) {
  const username = sessionStorage.getItem("username") ?? "";

  const [gameStarted, setGameStarted] = useState(IS_DEBUG);
  const [gameEnded, setGameEnded] = useState(false);
  const [hpFriend, setHpFriend] = useState(HP_INIT);
  const [hpEnemy, setHpEnemy] = useState(HP_INIT);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [inputFriend, setInputFriend] = useState("");
  const [messageFriend, setMessageFriend] = useState("");
  const [messageEnemy, setMessageEnemy] = useState("");
  const [coolTimeFriendText, setCoolTimeFriendText] = useState("");
  const [coolTimeEnemyText, setCoolTimeEnemyText] = useState("");
  const [regenCoolTimeFriendText, setRegenCoolTimeFriendText] = useState("");
  const [regenCoolTimeEnemyText, setRegenCoolTimeEnemyText] = useState("");
  const [shieldCoolTimeFriendText, setShieldCoolTimeFriendText] = useState("");
  const [shieldCoolTimeEnemyText, setShieldCoolTimeEnemyText] = useState("");
  const [commandList, setCommandList] = useState<string[]>([]);
  const [subCommandMap, setSubCommandMap] = useState<Record<string, string[]>>({});
  const [activeFriendField, setActiveFriendField] = useState<string | null>(null);
  const [activeEnemyField, setActiveEnemyField] = useState<string | null>(null);
  const [disabledFriendFields, setDisabledFriendFields] = useState<string[]>([]);
  const [disabledEnemyFields, setDisabledEnemyFields] = useState<string[]>([]);
  const [activeFriendRegen, setActiveFriendRegen] = useState(false);
  const [activeEnemyRegen, setActiveEnemyRegen] = useState(false);

  const commandDataRef = useRef<CommandData>({});
  const inCoolTimeFriendRef = useRef(false);
  const inCoolTimeEnemyRef = useRef(false);
  const inRegenCoolTimeFriendRef = useRef(false);
  const inRegenCoolTimeEnemyRef = useRef(false);
  const inShieldCoolTimeFriendRef = useRef(false);
  const inShieldCoolTimeEnemyRef = useRef(false);
  const gameEndedRef = useRef(false);
  const hpFriendRef = useRef(HP_INIT);
  const hpEnemyRef = useRef(HP_INIT);
  const defenseFriendRef = useRef(0);
  const defenseEnemyRef = useRef(0);
  const friendFieldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemyFieldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const friendRegenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemyRegenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const friendShieldCoolTimeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemyShieldCoolTimeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const friendShieldDefenseRef = useRef(0);
  const enemyShieldDefenseRef = useRef(0);
  const disabledFriendFieldsRef = useRef(new Set<string>());
  const disabledEnemyFieldsRef = useRef(new Set<string>());

  // commandDataを取得
  useEffect(() => {
    socket.emit("commandData", null);
    socket.on("commandData", (data: { commandData: CommandData }) => {
      commandDataRef.current = data.commandData;
      const topLevelKeys = Object.keys(data.commandData);
      setCommandList(topLevelKeys);

      const subMap: Record<string, string[]> = {};
      for (const key of topLevelKeys) {
        const entry = data.commandData[key];
        const subs = Object.keys(entry).filter((k) => !RESERVED_KEYS.has(k));
        if (subs.length > 0) subMap[key] = subs;
      }
      setSubCommandMap(subMap);
    });
    return () => { socket.off("commandData"); };
  }, [socket]);

  // カウントダウン
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0 && !gameEndedRef.current) {
          handleGameEnd();
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameEnded]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `残り時間 ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const showMessage = (message: string, side: FriendOrEnemy) => {
    const setter = side === "friend" ? setMessageFriend : setMessageEnemy;
    setter("");
    setTimeout(() => setter(message), 100);
  };

  const generateRegenCoolTime = (coolTimeSec: number, side: FriendOrEnemy) => {
    if (side === "friend") inRegenCoolTimeFriendRef.current = true;
    else inRegenCoolTimeEnemyRef.current = true;

    const setText = side === "friend" ? setRegenCoolTimeFriendText : setRegenCoolTimeEnemyText;
    let remaining = coolTimeSec;

    const interval = setInterval(() => {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      setText(`リジェネCT ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      if (remaining <= 0) {
        clearInterval(interval);
        if (side === "friend") {
          inRegenCoolTimeFriendRef.current = false;
          setRegenCoolTimeFriendText("");
        } else {
          inRegenCoolTimeEnemyRef.current = false;
          setRegenCoolTimeEnemyText("");
        }
      }
      remaining--;
    }, 1000);
  };

  const generateShieldCoolTime = (coolTimeSec: number, side: FriendOrEnemy) => {
    if (side === "friend") inShieldCoolTimeFriendRef.current = true;
    else inShieldCoolTimeEnemyRef.current = true;

    const setText = side === "friend" ? setShieldCoolTimeFriendText : setShieldCoolTimeEnemyText;
    const intervalRef = side === "friend" ? friendShieldCoolTimeIntervalRef : enemyShieldCoolTimeIntervalRef;

    if (intervalRef.current) clearInterval(intervalRef.current);
    let remaining = coolTimeSec;

    intervalRef.current = setInterval(() => {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      setText(`シールドCT ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        if (side === "friend") {
          inShieldCoolTimeFriendRef.current = false;
          setShieldCoolTimeFriendText("");
        } else {
          inShieldCoolTimeEnemyRef.current = false;
          setShieldCoolTimeEnemyText("");
        }
      }
      remaining--;
    }, 1000);
  };

  const generateCoolTime = (coolTimeSec: number, side: FriendOrEnemy) => {
    if (side === "friend") inCoolTimeFriendRef.current = true;
    else inCoolTimeEnemyRef.current = true;

    const setText = side === "friend" ? setCoolTimeFriendText : setCoolTimeEnemyText;
    let remaining = coolTimeSec;

    const interval = setInterval(() => {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      setText(`クールタイム ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      if (remaining <= 0) {
        clearInterval(interval);
        if (side === "friend") {
          inCoolTimeFriendRef.current = false;
          setCoolTimeFriendText("");
        } else {
          inCoolTimeEnemyRef.current = false;
          setCoolTimeEnemyText("");
        }
      }
      remaining--;
    }, 1000);
  };

  const getTargetFromData = (cmdData: CommandEntry, side: FriendOrEnemy, key: "damageTarget" | "defenseTarget"): FriendOrEnemy | null => {
    const commandTarget = cmdData[key] as FriendOrEnemy | null;
    if (!commandTarget) return null;
    if (side === "friend") return commandTarget;
    return commandTarget === "friend" ? "enemy" : "friend";
  };

  // cancelFieldでのみ使用（トップレベルコマンド専用）
  const getTarget = (commandName: string, side: FriendOrEnemy, damageOrDefense: "damage" | "defense"): FriendOrEnemy => {
    const key = damageOrDefense === "damage" ? "damageTarget" : "defenseTarget";
    const commandTarget = commandDataRef.current[commandName][key] as FriendOrEnemy;
    if (side === "friend") return commandTarget;
    return commandTarget === "friend" ? "enemy" : "friend";
  };

  const giveDamage = (damage: number, side: FriendOrEnemy) => {
    const defense = side === "friend" ? defenseFriendRef.current : defenseEnemyRef.current;
    const actualDamage = damage > 0 ? Math.max(0, damage - defense) : damage;
    if (side === "friend") {
      const next = hpFriendRef.current - actualDamage;
      hpFriendRef.current = next;
      setHpFriend(next);
      if (next <= 0) handleGameEnd();
    } else {
      const next = hpEnemyRef.current - actualDamage;
      hpEnemyRef.current = next;
      setHpEnemy(next);
      if (next <= 0) handleGameEnd();
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

  const cancelField = (fieldName: string, side: FriendOrEnemy) => {
    const intervalRef = side === "friend" ? friendFieldIntervalRef : enemyFieldIntervalRef;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // holy fieldキャンセル時はregenも停止
    if (fieldName === "holy field") {
      const regenRef = side === "friend" ? friendRegenIntervalRef : enemyRegenIntervalRef;
      if (regenRef.current !== null) {
        clearInterval(regenRef.current);
        regenRef.current = null;
      }
      if (side === "friend") setActiveFriendRegen(false);
      else setActiveEnemyRegen(false);
    }

    // shieldのcooltime停止 + shield防御バフ取り消し
    const shieldIntervalRef = side === "friend" ? friendShieldCoolTimeIntervalRef : enemyShieldCoolTimeIntervalRef;
    if (shieldIntervalRef.current !== null) {
      clearInterval(shieldIntervalRef.current);
      shieldIntervalRef.current = null;
      if (side === "friend") {
        inShieldCoolTimeFriendRef.current = false;
        setShieldCoolTimeFriendText("");
      } else {
        inShieldCoolTimeEnemyRef.current = false;
        setShieldCoolTimeEnemyText("");
      }
    }
    if (side === "friend") {
      defenseFriendRef.current -= friendShieldDefenseRef.current;
      friendShieldDefenseRef.current = 0;
    } else {
      defenseEnemyRef.current -= enemyShieldDefenseRef.current;
      enemyShieldDefenseRef.current = 0;
    }

    const fieldCmd = commandDataRef.current[fieldName];
    if (fieldCmd) {
      const defense = fieldCmd.defense as number;
      if (defense > 0) {
        const defenseTarget = getTarget(fieldName, side, "defense");
        if (defenseTarget === "friend") defenseFriendRef.current -= defense;
        else defenseEnemyRef.current -= defense;
      }
    }
  };

  const activateCommand = (command: string, side: FriendOrEnemy) => {
    const inCoolTime = side === "friend"
      ? inCoolTimeFriendRef.current
      : inCoolTimeEnemyRef.current;
    const inRegenCoolTime = side === "friend"
      ? inRegenCoolTimeFriendRef.current
      : inRegenCoolTimeEnemyRef.current;
    const activeField = side === "friend" ? activeFriendField : activeEnemyField;
    const disabledRef = side === "friend" ? disabledFriendFieldsRef : disabledEnemyFieldsRef;

    // トップレベルかサブコマンドか判定
    const isTopLevel = command in commandDataRef.current;
    const activeFieldData = activeField
      ? (commandDataRef.current[activeField] as Record<string, unknown>)
      : null;
    const isSubCmd = !isTopLevel
      && activeField !== null
      && activeFieldData !== null
      && !RESERVED_KEYS.has(command)
      && command in activeFieldData;

    const cmdData: CommandEntry | null = isTopLevel
      ? commandDataRef.current[command]
      : isSubCmd
        ? (commandDataRef.current[activeField!] as Record<string, CommandEntry>)[command]
        : null;

    if (!cmdData) {
      showMessage("無効なコマンドです", side);
      return;
    }

    if (disabledRef.current.has(command)) {
      showMessage("使用不可のフィールドです", side);
      return;
    }

    const inShieldCoolTime = side === "friend"
      ? inShieldCoolTimeFriendRef.current
      : inShieldCoolTimeEnemyRef.current;

    if (command === "regenerate" && inRegenCoolTime) {
      showMessage("リジェネのクールタイム中です", side);
      return;
    }
    if (SHIELD_COMMANDS.includes(command) && inShieldCoolTime) {
      showMessage("シールドのクールタイム中です", side);
      return;
    }
    if (command !== "regenerate" && !SHIELD_COMMANDS.includes(command) && inCoolTime) {
      showMessage("スキルのクールタイム中です", side);
      return;
    }

    if (command === activeField) {
      showMessage("スキルのクールタイム中です", side);
      return;
    }

    const damage = cmdData.damage as number;
    const coolTime = cmdData.coolTime as number;
    const damageTarget = getTargetFromData(cmdData, side, "damageTarget");

    if (command === "regenerate") {
      if (coolTime >= 0) generateRegenCoolTime(coolTime, side);
    } else if (SHIELD_COMMANDS.includes(command)) {
      if (coolTime >= 0) generateShieldCoolTime(coolTime, side);
    } else {
      if (coolTime >= 0) generateCoolTime(coolTime, side);
    }
    if (side === "friend") setInputFriend("");

    if (command === "attack" || command === "heal") {
      giveDamage(damage, damageTarget!);

    } else if (FIELD_COMMANDS.includes(command)) {
      if (activeField !== null) cancelField(activeField, side);

      if (SLIP_DAMAGE_FIELDS.includes(command)) {
        const intervalRef = side === "friend" ? friendFieldIntervalRef : enemyFieldIntervalRef;
        intervalRef.current = giveSlipDamage(damage, damageTarget!);
      } else {
        // ocean field / earth field: 防御バフ
        const defense = cmdData.defense as number;
        const defenseTarget = getTargetFromData(cmdData, side, "defenseTarget");
        if (defense > 0 && defenseTarget) {
          if (defenseTarget === "friend") defenseFriendRef.current += defense;
          else defenseEnemyRef.current += defense;
        }
      }

      if (side === "friend") setActiveFriendField(command);
      else setActiveEnemyField(command);

    } else if (isSubCmd) {
      if (command === "burn out" || command === "earth quake") {
        // 大ダメージ + 親フィールドを永続無効化
        giveDamage(damage, damageTarget!);
        cancelField(activeField!, side);
        if (side === "friend") {
          setActiveFriendField(null);
          disabledFriendFieldsRef.current.add(activeField!);
          setDisabledFriendFields([...disabledFriendFieldsRef.current]);
        } else {
          setActiveEnemyField(null);
          disabledEnemyFieldsRef.current.add(activeField!);
          setDisabledEnemyFields([...disabledEnemyFieldsRef.current]);
        }

      } else if (command === "regenerate") {
        // 継続回復（20秒）
        const regenRef = side === "friend" ? friendRegenIntervalRef : enemyRegenIntervalRef;
        const setActiveRegen = side === "friend" ? setActiveFriendRegen : setActiveEnemyRegen;
        if (regenRef.current) clearInterval(regenRef.current);

        setActiveRegen(true);
        let remaining = 20;
        const healTarget = damageTarget!;
        const healAmount = damage;

        regenRef.current = setInterval(() => {
          giveDamage(healAmount, healTarget);
          remaining--;
          if (remaining <= 0) {
            clearInterval(regenRef.current!);
            regenRef.current = null;
            setActiveRegen(false);
          }
        }, 1000);

      } else if (SHIELD_COMMANDS.includes(command)) {
        // flame shield / splash shield / protect
        const defense = cmdData.defense as number;
        if (defense > 0) {
          if (side === "friend") {
            defenseFriendRef.current += defense;
            friendShieldDefenseRef.current += defense;
          } else {
            defenseEnemyRef.current += defense;
            enemyShieldDefenseRef.current += defense;
          }
        }
      } else {
        // fire / holy arrow / crack
        if (damage !== 0 && damageTarget) {
          giveDamage(damage, damageTarget);
        }
        const defense = cmdData.defense as number;
        const defenseTarget = getTargetFromData(cmdData, side, "defenseTarget");
        if (defense > 0 && defenseTarget) {
          if (defenseTarget === "friend") defenseFriendRef.current += defense;
          else defenseEnemyRef.current += defense;
        }
      }
    }

    showMessage(command, side);
  };

  const handleGameEnd = () => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    setGameEnded(true);
    const hpF = hpFriendRef.current;
    const hpE = hpEnemyRef.current;
    if (hpF < hpE) alert("相手の勝利です");
    else if (hpF > hpE) alert("あなたの勝利です");
    else alert("引き分けです");
  };

  const handleGameStart = () => {
    setGameStarted(true);
  };

  return (
    <>
      <h1>Word Arena</h1>

      {!gameStarted && (
        <div className="black-sheet">
          <div className="window">
            <p>ゲームを開始しますか？</p>
            <div className="wrapper-button">
              <button type="button" onClick={handleGameStart}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* HPバー */}
      <div className="wrapper-status-bar">
        <div className="status-bar">
          <span className="status-text">{username}</span>
          <br />
          <progress className="progress-bar" value={hpFriend} max={HP_MAX} />
        </div>
        <div className="status-bar">
          <span className="status-text">Enemy</span>
          <br />
          <progress className="progress-bar" value={hpEnemy} max={HP_MAX} />
        </div>
      </div>

      {/* コマンド入力欄 */}
      <div className="wrapper-input">
        <div className="sub-wrapper-input">
          <input
            type="text"
            value={inputFriend}
            placeholder="コマンドを入力してください..."
            onChange={(e) => setInputFriend(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && gameStarted && !gameEnded) {
                activateCommand(inputFriend, "friend");
              }
            }}
            disabled={!gameStarted || gameEnded}
          />
        </div>
        <div className="time">{formatTime(timeLeft)}</div>
        <div className="sub-wrapper-input">
          <input
            className="input-enemy"
            type="text"
            disabled
          />
        </div>
      </div>

      {/* メッセージ */}
      <div className="wrapper-message">
        <div className="sub-wrapper-message">
          <span>output</span>
          <span className="message-text">{messageFriend}</span>
        </div>
        <div className="margin" />
        <div className="sub-wrapper-message">
          <span>output</span>
          <input className="message-text" type="text" value={messageEnemy} readOnly />
        </div>
      </div>

      {/* クールタイム */}
      <div className="wrapper-cool-time">
        <div className="sub-wrapper-cool-time">
          <div className="cool-time">{coolTimeFriendText}</div>
          <div className="cool-time">{regenCoolTimeFriendText}</div>
          <div className="cool-time">{shieldCoolTimeFriendText}</div>
        </div>
        <div className="sub-wrapper-cool-time">
          <div className="cool-time">{coolTimeEnemyText}</div>
          <div className="cool-time">{regenCoolTimeEnemyText}</div>
          <div className="cool-time">{shieldCoolTimeEnemyText}</div>
        </div>
      </div>

      {/* ステータス */}
      <div className="wrapper-status">
        {(["friend", "enemy"] as FriendOrEnemy[]).map((side) => {
          const activeField = side === "friend" ? activeFriendField : activeEnemyField;
          const inCoolTime = side === "friend"
            ? coolTimeFriendText !== ""
            : coolTimeEnemyText !== "";
          const inRegenCoolTime = side === "friend"
            ? regenCoolTimeFriendText !== ""
            : regenCoolTimeEnemyText !== "";
          const inShieldCoolTime = side === "friend"
            ? shieldCoolTimeFriendText !== ""
            : shieldCoolTimeEnemyText !== "";
          const disabledFields = side === "friend" ? disabledFriendFields : disabledEnemyFields;
          const activeRegen = side === "friend" ? activeFriendRegen : activeEnemyRegen;

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
                } else if (inCoolTime) {
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
                    subClass += " field-inactive";
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
    </>
  );
}
