import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { GAME_DURATION, HP_MAX, IS_DEBUG } from "../const";
import type { CommandData, FriendOrEnemy } from "../types";
import "../styles/battle.scss";

interface BattlePageProps {
  socket: Socket;
}

export default function BattlePage({ socket }: BattlePageProps) {
  const username = sessionStorage.getItem("username") ?? "";

  const [gameStarted, setGameStarted] = useState(IS_DEBUG);
  const [gameEnded, setGameEnded] = useState(false);
  const [hpFriend, setHpFriend] = useState(HP_MAX);
  const [hpEnemy, setHpEnemy] = useState(HP_MAX);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [inputFriend, setInputFriend] = useState("");
  const [messageFriend, setMessageFriend] = useState("");
  const [messageEnemy, setMessageEnemy] = useState("");
  const [coolTimeFriendText, setCoolTimeFriendText] = useState("");
  const [coolTimeEnemyText, setCoolTimeEnemyText] = useState("");
  const [commandList, setCommandList] = useState<string[]>([]);
  const [activeFriendField, setActiveFriendField] = useState<string | null>(null);
  const [activeEnemyField, setActiveEnemyField] = useState<string | null>(null);

  const commandDataRef = useRef<CommandData>({});
  const inCoolTimeFriendRef = useRef(false);
  const inCoolTimeEnemyRef = useRef(false);
  const gameEndedRef = useRef(false);
  const hpFriendRef = useRef(HP_MAX);
  const hpEnemyRef = useRef(HP_MAX);
  const defenseFriendRef = useRef(0);
  const defenseEnemyRef = useRef(0);
  const friendFieldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemyFieldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // commandDataを取得
  useEffect(() => {
    socket.emit("commandData", null);
    socket.on("commandData", (data: { commandData: CommandData }) => {
      commandDataRef.current = data.commandData;
      setCommandList(Object.keys(data.commandData));
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

    const activeField = side === "friend" ? activeFriendField : activeEnemyField;

    if (!(command in commandDataRef.current) || inCoolTime || command === activeField) {
      const msg = !(command in commandDataRef.current)
        ? "無効なコマンドです"
        : "スキルのクールタイム中です";
      showMessage(msg, side);
      return;
    }

    const cmd = commandDataRef.current[command];
    const damage = cmd.damage as number;
    const damageTarget = getTarget(command, side, "damage");
    const coolTime = cmd.coolTime as number;

    generateCoolTime(coolTime, side);
    showMessage(`activated: ${command}`, side);

    if (side === "friend") setInputFriend("");

    if (command === "attack" || command === "heal") {
      giveDamage(damage, damageTarget);
    } else if (command === "flame field" || command === "ocean field" || command === "earth field") {
      if (activeField !== null) cancelField(activeField, side);

      if (command === "flame field") {
        const intervalRef = side === "friend" ? friendFieldIntervalRef : enemyFieldIntervalRef;
        intervalRef.current = giveSlipDamage(damage, damageTarget);
      } else {
        const defense = cmd.defense as number;
        const defenseTarget = getTarget(command, side, "defense");
        if (defenseTarget === "friend") defenseFriendRef.current += defense;
        else defenseEnemyRef.current += defense;
      }

      if (side === "friend") setActiveFriendField(command);
      else setActiveEnemyField(command);
    }
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
          <p className="username-text">{username}</p>
          <input
            type="text"
            value={inputFriend}
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
          <p className="username-text">Enemy</p>
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
          <span>コマンド</span>
          <span className="message-text">{messageFriend}</span>
        </div>
        <div className="margin" />
        <div className="sub-wrapper-message">
          <span>コマンド</span>
          <input className="message-text" type="text" value={messageEnemy} readOnly />
        </div>
      </div>

      {/* クールタイム */}
      <div className="wrapper-cool-time">
        <div className="sub-wrapper-cool-time">
          <div className="cool-time">{coolTimeFriendText}</div>
        </div>
        <div className="sub-wrapper-cool-time">
          <div className="cool-time">{coolTimeEnemyText}</div>
        </div>
      </div>

      {/* ステータス */}
      <div className="wrapper-status">
        {(["friend", "enemy"] as FriendOrEnemy[]).map((side) => {
          const activeField = side === "friend" ? activeFriendField : activeEnemyField;
          const inCoolTime = side === "friend"
            ? coolTimeFriendText !== ""
            : coolTimeEnemyText !== "";
          return (
            <div key={side} className="sub-wrapper-status">
              {commandList.map((cmd) => {
                let itemClass = "";
                if (cmd === activeField) {
                  if (cmd === "flame field") itemClass = "flame-active";
                  else if (cmd === "ocean field") itemClass = "ocean-active";
                  else if (cmd === "earth field") itemClass = "earth-active";
                } else if (inCoolTime) {
                  itemClass = "grayed-out";
                }
                return (
                  <span key={cmd} className={`command-item ${itemClass}`}>
                    {cmd === activeField && <span className="orbit-dot" />}
                    {cmd}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
