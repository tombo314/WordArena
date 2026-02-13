"use strict";

let sqlite = require("./sqlite/sqlite");
let express = require("express");
let http = require("http");
let fs = require("fs");
let socket = require("socket.io");

let app = express();
let server = http.createServer(app);

// 静的ファイルの配信
app.use(express.static("."));

// ルーティング（HTMLページ）
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/top/top.html");
});

app.get("/rooms", (req, res) => {
    res.sendFile(__dirname + "/rooms/rooms.html");
});

app.get("/standby", (req, res) => {
    res.sendFile(__dirname + "/standby/standby.html");
});

app.get("/battle", (req, res) => {
    res.sendFile(__dirname + "/battle/battle.html");
});

server.listen(process.env.PORT || 8000);

let io = socket(server);

// ソケット通信
io.on("connection", (socket) => {

    // ログイン
    socket.on("login", (data) => {
        let username = data.value["username"];
        let password = data.value["password"];
        sqlite.login(username, password, socket);
    });

    // アカウント登録
    socket.on("signup", (data) => {
        let username = data.value["username"];
        let password = data.value["password"];
        sqlite.signup(username, password, socket);
    });

    // コマンドデータ送信
    socket.on("commandData", (data) => {
        let commandData = JSON.parse(fs.readFileSync("battle/data/data.json"));
        socket.emit("commandData", commandData);
    });
});
