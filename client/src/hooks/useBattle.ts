import { useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { IS_DEBUG } from "../const";
import type { CommandEntry, FriendOrEnemy } from "../types";
import { useCommandData } from "./useCommandData";
import { useGameTimer } from "./useGameTimer";
import { useCoolTime } from "./useCoolTime";
import { useHP } from "./useHP";

const FIELD_COMMANDS = ["flame field", "ocean field", "earth field", "holy field"];
const SLIP_DAMAGE_FIELDS = ["flame field", "holy field"];
const SHIELD_COMMANDS = ["flame shield", "splash shield", "protect"];
const RESERVED_KEYS = new Set(["damage", "damageTarget", "defense", "defenseTarget", "coolTime"]);

export function useBattle(socket: Socket) {
  const [gameStarted, setGameStarted] = useState(IS_DEBUG);
  const [gameEnded, setGameEnded] = useState(false);
  const [inputFriend, setInputFriend] = useState("");
  const [messageFriend, setMessageFriend] = useState("");
  const [messageEnemy, setMessageEnemy] = useState("");
  const [activeFriendField, setActiveFriendField] = useState<string | null>(null);
  const [activeEnemyField, setActiveEnemyField] = useState<string | null>(null);
  const [disabledFriendFields, setDisabledFriendFields] = useState<string[]>([]);
  const [disabledEnemyFields, setDisabledEnemyFields] = useState<string[]>([]);
  const [activeFriendRegen, setActiveFriendRegen] = useState(false);
  const [activeEnemyRegen, setActiveEnemyRegen] = useState(false);

  const gameEndedRef = useRef(false);
  const defenseFriendRef = useRef(0);
  const defenseEnemyRef = useRef(0);
  const friendFieldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemyFieldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const friendRegenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enemyRegenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const friendShieldDefenseRef = useRef(0);
  const enemyShieldDefenseRef = useRef(0);
  const disabledFriendFieldsRef = useRef(new Set<string>());
  const disabledEnemyFieldsRef = useRef(new Set<string>());
  const activeFriendFieldRef = useRef<string | null>(null);
  const activeEnemyFieldRef = useRef<string | null>(null);

  // handleGameEnd の前方参照用 ref（useHP / useGameTimer に渡すため）
  const handleGameEndRef = useRef<() => void>(() => {});

  const { commandList, subCommandMap, commandDataRef } = useCommandData(socket);
  const { timeLeft } = useGameTimer(gameStarted, gameEnded, () => handleGameEndRef.current());
  const coolTime = useCoolTime();
  const { hpFriend, hpEnemy, hpFriendRef, hpEnemyRef, giveDamage, giveSlipDamage } = useHP(
    gameEndedRef,
    defenseFriendRef,
    defenseEnemyRef,
    () => handleGameEndRef.current(),
  );

  const showMessage = (message: string, side: FriendOrEnemy) => {
    const setter = side === "friend" ? setMessageFriend : setMessageEnemy;
    setter("");
    setTimeout(() => setter(message), 100);
  };

  const getTargetFromData = (cmdData: CommandEntry, side: FriendOrEnemy, key: "damageTarget" | "defenseTarget"): FriendOrEnemy | null => {
    const commandTarget = cmdData[key] as FriendOrEnemy | null;
    if (!commandTarget) return null;
    if (side === "friend") return commandTarget;
    return commandTarget === "friend" ? "enemy" : "friend";
  };

  // cancelField 専用（トップレベルコマンドのdefenseTarget解決）
  const getTarget = (commandName: string, side: FriendOrEnemy, damageOrDefense: "damage" | "defense"): FriendOrEnemy => {
    const key = damageOrDefense === "damage" ? "damageTarget" : "defenseTarget";
    const commandTarget = commandDataRef.current[commandName][key] as FriendOrEnemy;
    if (side === "friend") return commandTarget;
    return commandTarget === "friend" ? "enemy" : "friend";
  };

  const cancelField = (fieldName: string, side: FriendOrEnemy) => {
    const intervalRef = side === "friend" ? friendFieldIntervalRef : enemyFieldIntervalRef;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (fieldName === "holy field") {
      const regenRef = side === "friend" ? friendRegenIntervalRef : enemyRegenIntervalRef;
      if (regenRef.current !== null) {
        clearInterval(regenRef.current);
        regenRef.current = null;
      }
      if (side === "friend") setActiveFriendRegen(false);
      else setActiveEnemyRegen(false);
    }

    coolTime.clearShieldCoolTime(side);

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
    const { refs } = coolTime;
    const inCoolTime = side === "friend" ? refs.inCoolTimeFriendRef.current : refs.inCoolTimeEnemyRef.current;
    const inRegenCoolTime = side === "friend" ? refs.inRegenCoolTimeFriendRef.current : refs.inRegenCoolTimeEnemyRef.current;
    const inShieldCoolTime = side === "friend" ? refs.inShieldCoolTimeFriendRef.current : refs.inShieldCoolTimeEnemyRef.current;
    const activeField = side === "friend" ? activeFriendFieldRef.current : activeEnemyFieldRef.current;
    const disabledRef = side === "friend" ? disabledFriendFieldsRef : disabledEnemyFieldsRef;

    const isTopLevel = command in commandDataRef.current;
    const activeFieldData = activeField ? (commandDataRef.current[activeField] as Record<string, unknown>) : null;
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

    if (!cmdData) { showMessage("無効なコマンドです", side); return; }
    if (disabledRef.current.has(command)) { showMessage("使用不可のフィールドです", side); return; }
    if (command === "regenerate" && inRegenCoolTime) { showMessage("リジェネのクールタイム中です", side); return; }
    if (SHIELD_COMMANDS.includes(command) && inShieldCoolTime) { showMessage("シールドのクールタイム中です", side); return; }
    if (command !== "regenerate" && !SHIELD_COMMANDS.includes(command) && inCoolTime) { showMessage("スキルのクールタイム中です", side); return; }
    if (command === activeField) { showMessage("スキルのクールタイム中です", side); return; }

    const damage = cmdData.damage as number;
    const coolTimeSec = cmdData.coolTime as number;
    const damageTarget = getTargetFromData(cmdData, side, "damageTarget");

    if (command === "regenerate") {
      if (coolTimeSec >= 0) coolTime.generateRegenCoolTime(coolTimeSec, side);
    } else if (SHIELD_COMMANDS.includes(command)) {
      if (coolTimeSec >= 0) coolTime.generateShieldCoolTime(coolTimeSec, side);
    } else {
      if (coolTimeSec >= 0) coolTime.generateCoolTime(coolTimeSec, side);
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
        const defense = cmdData.defense as number;
        const defenseTarget = getTargetFromData(cmdData, side, "defenseTarget");
        if (defense > 0 && defenseTarget) {
          if (defenseTarget === "friend") defenseFriendRef.current += defense;
          else defenseEnemyRef.current += defense;
        }
      }

      if (side === "friend") { setActiveFriendField(command); activeFriendFieldRef.current = command; }
      else { setActiveEnemyField(command); activeEnemyFieldRef.current = command; }

    } else if (isSubCmd) {
      if (command === "burn out" || command === "earth quake") {
        giveDamage(damage, damageTarget!);
        cancelField(activeField!, side);
        if (side === "friend") {
          setActiveFriendField(null); activeFriendFieldRef.current = null;
          disabledFriendFieldsRef.current.add(activeField!);
          setDisabledFriendFields([...disabledFriendFieldsRef.current]);
        } else {
          setActiveEnemyField(null); activeEnemyFieldRef.current = null;
          disabledEnemyFieldsRef.current.add(activeField!);
          setDisabledEnemyFields([...disabledEnemyFieldsRef.current]);
        }

      } else if (command === "regenerate") {
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
        const defense = cmdData.defense as number;
        if (defense > 0) {
          if (side === "friend") { defenseFriendRef.current += defense; friendShieldDefenseRef.current += defense; }
          else { defenseEnemyRef.current += defense; enemyShieldDefenseRef.current += defense; }
        }
      } else {
        if (damage !== 0 && damageTarget) giveDamage(damage, damageTarget);
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

    if (activeFriendFieldRef.current) {
      cancelField(activeFriendFieldRef.current, "friend");
      setActiveFriendField(null);
      activeFriendFieldRef.current = null;
    }
    if (activeEnemyFieldRef.current) {
      cancelField(activeEnemyFieldRef.current, "enemy");
      setActiveEnemyField(null);
      activeEnemyFieldRef.current = null;
    }

    const hpF = hpFriendRef.current;
    const hpE = hpEnemyRef.current;
    if (hpF < hpE) alert("相手の勝利です");
    else if (hpF > hpE) alert("あなたの勝利です");
    else alert("引き分けです");
  };

  // 毎レンダーで最新の handleGameEnd を ref に保持
  handleGameEndRef.current = handleGameEnd;

  const { state: ctState } = coolTime;

  return {
    state: {
      gameStarted,
      gameEnded,
      hpFriend,
      hpEnemy,
      timeLeft,
      inputFriend,
      messageFriend,
      messageEnemy,
      coolTimeFriendText: ctState.coolTimeFriendText,
      coolTimeEnemyText: ctState.coolTimeEnemyText,
      regenCoolTimeFriendText: ctState.regenCoolTimeFriendText,
      regenCoolTimeEnemyText: ctState.regenCoolTimeEnemyText,
      shieldCoolTimeFriendText: ctState.shieldCoolTimeFriendText,
      shieldCoolTimeEnemyText: ctState.shieldCoolTimeEnemyText,
      commandList,
      subCommandMap,
      activeFriendField,
      activeEnemyField,
      disabledFriendFields,
      disabledEnemyFields,
      activeFriendRegen,
      activeEnemyRegen,
    },
    actions: {
      handleGameStart: () => setGameStarted(true),
      setInputFriend,
      activateFriendCommand: (cmd: string) => activateCommand(cmd, "friend"),
    },
  };
}
