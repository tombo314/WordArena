"use strict";

let sqlite = require("./sqlite/sqlite");
let http = require("http");
let fs = require("fs");
let socket = require("socket.io");
let server = http.createServer((req, res)=>{
    // ルーティング
    // top
    if (req.url==="/"){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(fs.readFileSync("top/top.html"));
    } else if (req.url==="/top/stylesheet/top.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        res.end(fs.readFileSync("top/stylesheet/top.css"));
    } else if (req.url==="/top/top.js"){
        res.writeHead(200, {"Content-Type": "application/javascript"});
        res.end(fs.readFileSync("top/top.js"));
    }
    // rooms
    else if (req.url==="/rooms"){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(fs.readFileSync("rooms/rooms.html"));
    } else if (req.url==="/rooms/stylesheet/rooms.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        res.end(fs.readFileSync("rooms/stylesheet/rooms.css"));
    } else if (req.url==="/rooms/rooms.js"){
        res.writeHead(200, {"Content-Type": "application/javascript"});
        res.end(fs.readFileSync("rooms/rooms.js"));
    }
    // standby
    else if (req.url==="/standby"){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(fs.readFileSync("standby/standby.html"));
    } else if (req.url==="/standby/stylesheet/standby.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        res.end(fs.readFileSync("standby/stylesheet/standby.css"));
    } else if (req.url==="/standby/standby.js"){
        res.writeHead(200, {"Content-Type": "application/javascript"});
        res.end(fs.readFileSync("standby/standby.js"));
    }
    // battle
    else if (req.url==="/battle"){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(fs.readFileSync("battle/battle.html"));
    } else if (req.url==="/battle/stylesheet/battle.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        res.end(fs.readFileSync("battle/stylesheet/battle.css"));
    } else if (req.url==="/battle/battle.js"){
        res.writeHead(200, {"Content-Type": "application/javascript"});
        res.end(fs.readFileSync("battle/battle.js"));
    }
    // sqlite
    else if (req.url==="/sqlite/sqlite.js"){
        res.writeHead(200, {"Content-Type": "application/javascript"});
        res.end(fs.readFileSync("sqlite/sqlite.js"));
    }
    // data
    else if (req.url==="/battle/data/data.json"){
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(fs.readFileSync("battle/data/data.json"));
    }
    // images
    else if (req.url==="/images/"){
        res.writeHead(200, {"Content-Type": "image/"});
        // res.end();
    }
    // music
    else if (req.url==="/music/"){
        res.writeHead(200, {"Content-Type": "music/"});
        // res.end();
    }
}).listen(process.env.PORT || 8000);
let io = socket(server);

// ソケット通信
io.on("connection", (socket)=>{

    // ログイン
    socket.on("login", (data)=>{
        let username = data.value["username"];
        let password = data.value["password"];
        sqlite.login(username, password, socket);
    });

    // アカウント登録
    socket.on("signup", (data)=>{
        let username = data.value["username"];
        let password = data.value["password"];
        sqlite.signup(username, password, socket);
    });

    // コマンドデータ送信
    socket.on("commandData", (data)=>{
        let commandData = JSON.parse(fs.readFileSync("battle/data/data.json"));
        socket.emit("commandData", commandData);
    });
});
