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
				<div className="status-name">
					<span className="status-text">{username}</span>
				</div>
				<div className="status-hp">
					<progress className="progress-bar" value={hpFriend} max={HP_MAX} />
				</div>
			</div>
			<div className="status-bar">
				<div className="status-name">
					<span className="status-text">Enemy</span>
				</div>
				<div className="status-hp">
					<progress className="progress-bar" value={hpEnemy} max={HP_MAX} />
				</div>
			</div>
		</div>
	);
}
