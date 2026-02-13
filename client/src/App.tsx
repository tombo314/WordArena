import { BrowserRouter, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";
import TopPage from "./pages/TopPage";
import RoomsPage from "./pages/RoomsPage";
import StandbyPage from "./pages/StandbyPage";
import BattlePage from "./pages/BattlePage";

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
