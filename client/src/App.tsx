import { BrowserRouter, Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import BattlePage from "./pages/BattlePage";
import RoomsPage from "./pages/RoomsPage";
import StandbyPage from "./pages/StandbyPage";
import TopPage from "./pages/TopPage";

const socket = io();

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<TopPage socket={socket} />} />
				<Route path="/rooms" element={<RoomsPage />} />
				<Route path="/standby" element={<StandbyPage />} />
				<Route path="/battle" element={<BattlePage socket={socket} />} />
			</Routes>
		</BrowserRouter>
	);
}
