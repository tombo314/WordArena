const sqlite = require("./sqlite/sqlite");
const express = require("express");
const http = require("node:http");
const fs = require("node:fs");
const socket = require("socket.io");

const app = express();
const server = http.createServer(app);

// 静的ファイルの配信
app.use(express.static("."));

// ルーティング（HTMLページ）
app.get("/", (_, res) => {
    res.sendFile(`${__dirname}/top/top.html`);
});

app.get("/rooms", (_, res) => {
    res.sendFile(`${__dirname}/rooms/rooms.html`);
});

app.get("/standby", (_, res) => {
    res.sendFile(`${__dirname}/standby/standby.html`);
});

app.get("/battle", (_, res) => {
    res.sendFile(`${__dirname}/battle/battle.html`);
});

server.listen(process.env.PORT || 8000);

const io = socket(server);

// ソケット通信
io.on("connection", (socket) => {

    // ログイン
    socket.on("login", (data) => {
        const username = data.value["username"];
        const password = data.value["password"];
        sqlite.login(username, password, socket);
    });

    // アカウント登録
    socket.on("signup", (data) => {
        const username = data.value["username"];
        const password = data.value["password"];
        sqlite.signup(username, password, socket);
    });

    // コマンドデータ送信
    socket.on("commandData", (data) => {
        const commandData = JSON.parse(fs.readFileSync("battle/data/data.json"));
        socket.emit("commandData", commandData);
    });
});
