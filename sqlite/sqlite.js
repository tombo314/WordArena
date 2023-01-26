"use strict";

// 変数宣言 //////
let sqlite = require("sqlite3");
let db = new sqlite.Database("sqlite/users.db");

// 関数宣言 //////
let isNameExist = (users, username)=>{
    for (let user of users){
        if (user["username"]==username){
            return true;
        }
    }
    return false;
}

let isNamePassExist = (users, username, password)=>{
    for (let user of users){
        if (user["username"]==username && user["password"]==password){
            return true;
        }
    }
    return false;
}

// ログイン
exports.login = (username, password, socket)=>{
    new Promise((resolve, reject)=>{
        db.serialize(()=>{
            db.all(`select * from users where username="${username}" and password="${password}"`, (err, rows)=>{
                if (err) throw err;
                if (isNamePassExist(rows, username, password)){
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }).then(()=>{
        socket.emit("login", {value: true});
    }).catch(()=>{
        socket.emit("login", {value: false});
    });
};

// アカウント登録
exports.signin = (username, password, socket)=>{
    new Promise((resolve, reject)=>{
        db.serialize(()=>{
            db.all(`select * from users where username="${username}"`, (err, rows)=>{
                if (err) throw err;
                if (isNameExist(rows, username)){
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }).then(()=>{
        db.run(`insert into users(username, password) values("${username}", "${password}")`);
        socket.emit("signin", {value: true});
    }).catch(()=>{
        socket.emit("signin", {value: false});
    });
};
