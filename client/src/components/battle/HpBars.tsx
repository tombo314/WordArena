import { HP_MAX } from "../../const";

interface HpBarsProps {
	username: string;
	hpFriend: number;
	hpEnemy: number;
}

export default function HpBars({ username, hpFriend, hpEnemy }: HpBarsProps) {
	return (
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
	);
}
