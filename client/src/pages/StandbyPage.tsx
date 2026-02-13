import "../styles/standby.scss";

export default function StandbyPage() {
	const username = sessionStorage.getItem("username") ?? "";

	return (
		<>
			<h1>Word Arena</h1>
			<h2>待機中... ({username})</h2>
			<div className="wrapper-loader">
				<div className="ball-grid-pulse">
					{Array.from({ length: 9 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static animation elements
						<div key={i} />
					))}
				</div>
			</div>
		</>
	);
}
