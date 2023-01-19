let http = require("http");
let fs = require("fs");
let socket = require("socket.io");
let server = http.createServer((req, res)=>{
    // top
    if (req.url=="/"){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(fs.readFileSync("top/top.html"));
    } else if (req.url=="/top/top.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        res.end(fs.readFileSync("top/top.css"));
    } else if (req.url=="/top/top.js"){
        res.writeHead(200, {"Content-Type": "application/javascript"});
        res.end(fs.readFileSync("top/top.js"));
    }
    // standby
    else if (req.url=="/standby"){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(fs.readFileSync("standby/standby.html"));
    } else if (req.url=="/standby/standby.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        res.end(fs.readFileSync("standby/standby.css"));
    } else if (req.url=="/standby/standby.js"){
        res.writeHead(200, {"Content-Type": "application/javascript"});
        res.end(fs.readFileSync("standby/standby.js"));
    }
    // battle
    else if (req.url=="/battle"){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(fs.readFileSync("battle/battle.html"));
    } else if (req.url=="/battle/battle.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        res.end(fs.readFileSync("battle/battle.css"));
    } else if (req.url=="/battle/battle.js"){
        res.writeHead(200, {"Content-Type": "application/javascript"});
        res.end(fs.readFileSync("battle/battle.js"));
    }
    // data
    else if (req.url=="/battle/data/data.json"){
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(fs.readFileSync("battle/data/data.json"));
    }
}).listen(process.env.PORT || 8000);
let io = socket(server);

io.on("connection", (socket)=>{
});