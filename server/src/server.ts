import express from "express";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Server } from "socket.io";
import * as db from "./db/sqlite";

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT ?? 8000;

// Viteビルド済みフロントエンドを配信 (本番用)
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));

// SPA フォールバック
app.get("*", (_, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const dataPath = path.join(__dirname, "../data/data.json");

io.on("connection", (socket) => {
  // ログイン
  socket.on("login", (data: { value: { username: string; password: string } }) => {
    const { username, password } = data.value;
    db.login(username, password, socket);
  });

  // アカウント登録
  socket.on("signup", (data: { value: { username: string; password: string } }) => {
    const { username, password } = data.value;
    db.signup(username, password, socket);
  });

  // コマンドデータ送信
  socket.on("commandData", () => {
    const commandData = JSON.parse(readFileSync(dataPath, "utf-8"));
    socket.emit("commandData", commandData);
  });
});
