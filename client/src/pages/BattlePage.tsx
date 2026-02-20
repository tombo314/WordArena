import type { Socket } from "socket.io-client";
import "../styles/battle.scss";
import BattleInput from "../components/battle/BattleInput";
import CommandStatus from "../components/battle/CommandStatus";
import CoolTimeDisplay from "../components/battle/CoolTimeDisplay";
import HpBars from "../components/battle/HpBars";
import MessageDisplay from "../components/battle/MessageDisplay";
import StartScreen from "../components/battle/StartScreen";
import { useBattle } from "../hooks/useBattle";
import type { StatusEffect } from "../types";

interface BattlePageProps {
	socket: Socket;
}

export default function BattlePage({ socket }: BattlePageProps) {
	const username = sessionStorage.getItem("username") ?? "";
	const { state, actions } = useBattle(socket);

	const buildStatusEffects = (defense: number): StatusEffect[] => {
		const effects: StatusEffect[] = [];
		if (defense !== 0) {
			effects.push({
				type: "defense",
				icon: "/images/shield.png",
				value: defense,
				color: defense > 0 ? "#22a010" : "#cc2200",
			});
		}
		return effects;
	};

	return (
		<div className="battle-layout">
			<h1>Word Arena</h1>

			{!state.gameStarted && <StartScreen onStart={actions.handleGameStart} />}

			<HpBars
				username={username}
				hpFriend={state.hpFriend}
				hpEnemy={state.hpEnemy}
				hpDeltasFriend={state.hpDeltasFriend}
				hpDeltasEnemy={state.hpDeltasEnemy}
			/>

			<BattleInput
				inputFriend={state.inputFriend}
				inputEnemy={state.inputEnemy}
				setInputFriend={actions.setInputFriend}
				gameStarted={state.gameStarted}
				gameEnded={state.gameEnded}
				timeLeft={state.timeLeft}
				onSubmit={actions.activateFriendCommand}
			/>

			<MessageDisplay
				messageFriend={state.messageFriend}
				messageEnemy={state.messageEnemy}
				attributeFriend={state.attributeFriend}
				attributeEnemy={state.attributeEnemy}
				attributeKeyFriend={state.attributeKeyFriend}
				attributeKeyEnemy={state.attributeKeyEnemy}
				statusEffectsFriend={buildStatusEffects(state.defenseFriend)}
				statusEffectsEnemy={buildStatusEffects(state.defenseEnemy)}
			/>

			<CoolTimeDisplay
				friend={{
					coolTime: state.coolTimeFriendText,
					regenCoolTime: state.regenCoolTimeFriendText,
					shieldCoolTime: state.shieldCoolTimeFriendText,
					guardianCoolTime: state.guardianCoolTimeFriendText,
				}}
				enemy={{
					coolTime: state.coolTimeEnemyText,
					regenCoolTime: state.regenCoolTimeEnemyText,
					shieldCoolTime: state.shieldCoolTimeEnemyText,
					guardianCoolTime: state.guardianCoolTimeEnemyText,
				}}
			/>

			<CommandStatus
				commandList={state.commandList}
				subCommandMap={state.subCommandMap}
				shieldCommandSet={state.shieldCommandSet}
				gameEnded={state.gameEnded}
				friend={{
					activeField: state.activeFriendField,
					activeDerivedField: state.activeFriendDerivedField,
					coolTimeText: state.coolTimeFriendText,
					regenCoolTimeText: state.regenCoolTimeFriendText,
					shieldCoolTimeText: state.shieldCoolTimeFriendText,
					guardianCoolTimeText: state.guardianCoolTimeFriendText,
					guardianParry: state.guardianParryFriend,
					disabledFields: state.disabledFriendFields,
					activeRegen: state.activeFriendRegen,
				}}
				enemy={{
					activeField: state.activeEnemyField,
					activeDerivedField: state.activeEnemyDerivedField,
					coolTimeText: state.coolTimeEnemyText,
					regenCoolTimeText: state.regenCoolTimeEnemyText,
					shieldCoolTimeText: state.shieldCoolTimeEnemyText,
					guardianCoolTimeText: state.guardianCoolTimeEnemyText,
					guardianParry: state.guardianParryEnemy,
					disabledFields: state.disabledEnemyFields,
					activeRegen: state.activeEnemyRegen,
				}}
			/>
		</div>
	);
}
