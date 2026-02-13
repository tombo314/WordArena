import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/rooms.scss";

export default function RoomsPage() {
  const navigate = useNavigate();
  const [roomsVisible, setRoomsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setRoomsVisible(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMake = () => alert("開発中です。");
  const handleEnter = () => alert("開発中です。");
  const handleAIBattle = () => {
    alert("AIバトルに移行します。");
    navigate("/battle");
  };
  const handleBack = () => {
    if (confirm("トップへ戻りますか？")) navigate("/");
  };

  return (
    <>
      <h1>Word Arena</h1>

      {roomsVisible && (
        <>
          <button type="button" className="black-sheet" onClick={() => setRoomsVisible(false)} />
          <div className="button-rooms">
            <div className="wrapper-button-room" />
          </div>
        </>
      )}

      <div className="form">
        <button type="button" className="button-big" onClick={handleMake}>
          部屋を作る
        </button>
        <button type="button" className="button-big" onClick={handleEnter}>
          部屋に入る
        </button>
        <br />
        <button type="button" className="button-big" onClick={handleAIBattle}>
          AI対戦
        </button>
        <button type="button" className="button-big" onClick={handleBack}>
          戻る
        </button>
      </div>
    </>
  );
}
