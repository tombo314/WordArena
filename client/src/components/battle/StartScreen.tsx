interface StartScreenProps {
	onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
	return (
		<div className="black-sheet">
			<div className="window">
				<p>ゲームを開始しますか？</p>
				<div className="wrapper-button">
					<button type="button" onClick={onStart}>
						OK
					</button>
				</div>
			</div>
		</div>
	);
}
