import { HP_MAX } from "../../const";
import type { HpDelta, HpDeltas } from "../../hooks/useHP";

interface HpBarsProps {
	username: string;
	hpFriend: number;
	hpEnemy: number;
	hpDeltasFriend: HpDeltas;
	hpDeltasEnemy: HpDeltas;
}

function IncreaseChip({ delta }: { delta: HpDelta | null }) {
	return (
		<span className="hp-delta-slot hp-delta-slot--increase">
			{delta && (
				<span key={delta.key} className="hp-delta-value hp-delta-value--increase">
					+{delta.amount}
				</span>
			)}
		</span>
	);
}

function DecreaseChip({ delta }: { delta: HpDelta | null }) {
	return (
		<span className="hp-delta-slot hp-delta-slot--decrease">
			{delta && (
				delta.isMiss ? (
					<span key={delta.key} className="hp-delta-value hp-delta-value--miss">
						ミス！
					</span>
				) : (
					<span key={delta.key} className="hp-delta-value hp-delta-value--decrease">
						-{delta.amount}
					</span>
				)
			)}
		</span>
	);
}

export default function HpBars({
	username,
	hpFriend,
	hpEnemy,
	hpDeltasFriend,
	hpDeltasEnemy,
}: HpBarsProps) {
	return (
		<div className="wrapper-status-bar">
			{/* 自分バー: 外側(左)=緑+, 内側(右)=赤- */}
			<div className="status-bar">
				<div className="status-name">
					<span className="status-text">{username}</span>
				</div>
				<div className="status-hp">
					<IncreaseChip delta={hpDeltasFriend.increase} />
					<progress className="progress-bar" value={hpFriend} max={HP_MAX} />
					<DecreaseChip delta={hpDeltasFriend.decrease} />
				</div>
			</div>
			{/* 敵バー: 内側(左)=赤-, 外側(右)=緑+ */}
			<div className="status-bar">
				<div className="status-name">
					<span className="status-text">Enemy</span>
				</div>
				<div className="status-hp">
					<DecreaseChip delta={hpDeltasEnemy.decrease} />
					<progress className="progress-bar" value={hpEnemy} max={HP_MAX} />
					<IncreaseChip delta={hpDeltasEnemy.increase} />
				</div>
			</div>
		</div>
	);
}
