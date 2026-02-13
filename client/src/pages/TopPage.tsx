import { type KeyboardEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";
import "../styles/top.scss";

const AVAILABLE_CHAR = new Set([
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h",
	"i",
	"j",
	"k",
	"l",
	"m",
	"n",
	"o",
	"p",
	"q",
	"r",
	"s",
	"t",
	"u",
	"v",
	"w",
	"x",
	"y",
	"z",
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z",
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
]);

type Mode = "signup" | "login" | null;

interface TopPageProps {
	socket: Socket;
}

function validate(text: string): boolean {
	for (const v of text) {
		if (!AVAILABLE_CHAR.has(v)) return false;
	}
	return text.length >= 6;
}

export default function TopPage({ socket }: TopPageProps) {
	const navigate = useNavigate();
	const [mode, setMode] = useState<Mode>(null);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [usernameError, setUsernameError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);

	const handleSubmit = () => {
		if (!mode) return;
		const valiUser = validate(username);
		const valiPass = validate(password);
		setUsernameError(!valiUser);
		setPasswordError(!valiPass);
		if (valiUser && valiPass) {
			socket.emit(mode, { value: { username, password } });
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") handleSubmit();
	};

	const handleBack = () => {
		setMode(null);
		setUsername("");
		setPassword("");
		setUsernameError(false);
		setPasswordError(false);
		document.title = "トップ";
	};

	socket.off("login").on("login", (data: { value: boolean }) => {
		if (data.value) {
			alert("ログインに成功しました。");
			sessionStorage.setItem("username", username);
			navigate("/rooms");
		} else {
			alert("ユーザー名またはパスワードが違います。");
		}
	});

	socket.off("signup").on("signup", (data: { value: boolean }) => {
		if (data.value) {
			alert("アカウント登録に成功しました。");
			setMode("login");
			document.title = "ログイン";
			setUsername("");
			setPassword("");
		} else {
			alert("ユーザー名が重複しています。");
		}
	});

	return (
		<>
			<h1>Word Arena</h1>

			{mode === null ? (
				<section>
					<div className="signup-login">
						<button
							type="button"
							onClick={() => {
								setMode("signup");
								document.title = "アカウント登録";
							}}
						>
							アカウント登録
						</button>
						<button
							type="button"
							onClick={() => {
								setMode("login");
								document.title = "ログイン";
							}}
						>
							ログイン
						</button>
					</div>
				</section>
			) : (
				<section>
					{mode === "signup" && <p className="signup-text">アカウント登録</p>}
					{mode === "login" && <p className="login-text">ログイン</p>}

					<div>
						<input
							className="text-field"
							type="text"
							placeholder="ユーザー名"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
					</div>
					{usernameError && (
						<p className="error-text">英数字6文字以上で入力してください</p>
					)}
					<div>
						<input
							className="text-field"
							type="password"
							placeholder="パスワード"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
					</div>
					{passwordError && (
						<p className="error-text">英数字6文字以上で入力してください</p>
					)}
					<button
						type="button"
						className="submit-button"
						onClick={handleSubmit}
					>
						送信
					</button>
					<button type="button" className="back-button" onClick={handleBack}>
						戻る
					</button>
				</section>
			)}
		</>
	);
}
