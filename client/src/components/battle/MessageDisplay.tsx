import type { Attribute } from "../../const";

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
}

export default function MessageDisplay({
	messageFriend,
	messageEnemy,
	attributeFriend,
	attributeEnemy,
	attributeKeyFriend,
	attributeKeyEnemy,
}: MessageDisplayProps) {
	return (
		<div className="wrapper-message">
			<div className="sub-wrapper-message">
				<span>output</span>
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
			<div className="margin" />
			<div className="sub-wrapper-message">
				<span>output</span>
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
		</div>
	);
}
