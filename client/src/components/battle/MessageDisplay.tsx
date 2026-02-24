import type { Attribute } from "../../const";
import type { StatusEffect } from "../../types";

const ATTRIBUTE_IMAGE: Record<Attribute, string> = {
	physical: "/images/sword.png",
	magic: "/images/wand.png",
	breath: "/images/breath.png",
	field: "/images/field.png",
};

interface MessageDisplayProps {
	messageFriend: string;
	messageEnemy: string;
	attributeFriend: Attribute | null;
	attributeEnemy: Attribute | null;
	attributeKeyFriend: number;
	attributeKeyEnemy: number;
	statusEffectsFriend: StatusEffect[];
	statusEffectsEnemy: StatusEffect[];
}

function StatusEffectBar({ effects }: { effects: StatusEffect[] }) {
	return (
		<div className="status-effect-bar">
			{effects.map((effect) => (
				<span key={effect.type} className="status-effect-item">
					<img
						src={effect.icon}
						alt={effect.type}
						className="status-effect-icon"
					/>
					{effect.value !== undefined && (
						<span
							className="status-effect-value"
							style={{ color: effect.color }}
						>
							{effect.value > 0 ? "+" : ""}
							{effect.value}
						</span>
					)}
				</span>
			))}
		</div>
	);
}

export default function MessageDisplay({
	messageFriend,
	messageEnemy,
	attributeFriend,
	attributeEnemy,
	attributeKeyFriend,
	attributeKeyEnemy,
	statusEffectsFriend,
	statusEffectsEnemy,
}: MessageDisplayProps) {
	return (
		<div className="wrapper-message">
			<div className="sub-wrapper-message-col">
				<div className="sub-wrapper-message">
					<span className="command-label">output</span>
					<span className="message-text">{messageFriend}</span>
					{attributeFriend && (
						<img
							key={attributeKeyFriend}
							src={ATTRIBUTE_IMAGE[attributeFriend]}
							alt={attributeFriend}
							className="output-icon"
						/>
					)}
				</div>
				<StatusEffectBar effects={statusEffectsFriend} />
			</div>
			<div className="margin" />
			<div className="sub-wrapper-message-col">
				<div className="sub-wrapper-message">
					<span className="command-label">output</span>
					<input
						className="message-text"
						type="text"
						value={messageEnemy}
						readOnly
					/>
					{attributeEnemy && (
						<img
							key={attributeKeyEnemy}
							src={ATTRIBUTE_IMAGE[attributeEnemy]}
							alt={attributeEnemy}
							className="output-icon"
						/>
					)}
				</div>
				<StatusEffectBar effects={statusEffectsEnemy} />
			</div>
		</div>
	);
}
