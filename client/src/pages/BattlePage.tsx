import type { Socket } from "socket.io-client";
import "../styles/battle.scss";
import BattleInput from "../components/battle/BattleInput";
import CommandStatus from "../components/battle/CommandStatus";
import CoolTimeDisplay from "../components/battle/CoolTimeDisplay";
import HpBars from "../components/battle/HpBars";
import MessageDisplay from "../components/battle/MessageDisplay";
import StartScreen from "../components/battle/StartScreen";
import { useBattle } from "../hooks/useBattle";

interface BattlePageProps {
	socket: Socket;
}

export default function BattlePage({ socket }: BattlePageProps) {
	const username = sessionStorage.getItem("username") ?? "";
	const { state, actions } = useBattle(socket);

	return (
		<div className="battle-layout">
			<h1>Word Arena</h1>

			{!state.gameStarted && <StartScreen onStart={actions.handleGameStart} />}

			<HpBars
				username={username}
				hpFriend={state.hpFriend}
				hpEnemy={state.hpEnemy}
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
			/>

			<CoolTimeDisplay
				friend={{
					coolTime: state.coolTimeFriendText,
					regenCoolTime: state.regenCoolTimeFriendText,
					shieldCoolTime: state.shieldCoolTimeFriendText,
				}}
				enemy={{
					coolTime: state.coolTimeEnemyText,
					regenCoolTime: state.regenCoolTimeEnemyText,
					shieldCoolTime: state.shieldCoolTimeEnemyText,
				}}
			/>

			<CommandStatus
				commandList={state.commandList}
				subCommandMap={state.subCommandMap}
				gameEnded={state.gameEnded}
				friend={{
					activeField: state.activeFriendField,
					activeDerivedField: state.activeFriendDerivedField,
					coolTimeText: state.coolTimeFriendText,
					regenCoolTimeText: state.regenCoolTimeFriendText,
					shieldCoolTimeText: state.shieldCoolTimeFriendText,
					disabledFields: state.disabledFriendFields,
					activeRegen: state.activeFriendRegen,
				}}
				enemy={{
					activeField: state.activeEnemyField,
					activeDerivedField: state.activeEnemyDerivedField,
					coolTimeText: state.coolTimeEnemyText,
					regenCoolTimeText: state.regenCoolTimeEnemyText,
					shieldCoolTimeText: state.shieldCoolTimeEnemyText,
					disabledFields: state.disabledEnemyFields,
					activeRegen: state.activeEnemyRegen,
				}}
			/>
		</div>
	);
}
