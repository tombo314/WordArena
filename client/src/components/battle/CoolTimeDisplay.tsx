interface SideCoolTimes {
	coolTime: string;
	regenCoolTime: string;
	shieldCoolTime: string;
}

interface CoolTimeDisplayProps {
	friend: SideCoolTimes;
	enemy: SideCoolTimes;
}

export default function CoolTimeDisplay({
	friend,
	enemy,
}: CoolTimeDisplayProps) {
	return (
		<div className="wrapper-cool-time">
			<div className="sub-wrapper-cool-time">
				<div className="cool-time">{friend.coolTime}</div>
				<div className="cool-time">{friend.regenCoolTime}</div>
				<div className="cool-time">{friend.shieldCoolTime}</div>
			</div>
			<div className="sub-wrapper-cool-time">
				<div className="cool-time">{enemy.coolTime}</div>
				<div className="cool-time">{enemy.regenCoolTime}</div>
				<div className="cool-time">{enemy.shieldCoolTime}</div>
			</div>
		</div>
	);
}
