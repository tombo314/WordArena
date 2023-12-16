"use strict";

// 変数宣言 //////
let sqlite = require("sqlite3");
let db = new sqlite.Database("sqlite/users.db");

// 関数宣言 //////
/** データベースにユーザー名が登録されているか -> bool */
let isNameExist = (users, username)=>{
    for (let user of users){
        if (user["username"]===username){
            return true;
        }
    }
    return false;
}

/** データベースにユーザー名とパスワードが登録されてるか -> bool */
let isNamePassExist = (users, username, password)=>{
    for (let user of users){
        if (user["username"].toString()===username && user["password"].toString()===password){
            return true;
        }
    }
    return false;
}

/** アカウント登録 */
exports.signup = (username, password, socket)=>{
    new Promise((resolve, reject)=>{
        db.serialize(()=>{
            db.all(`select * from users where username="${username}"`, (err, rows)=>{
                if (err) throw err;
                // ユーザー名が登録されていなかったら
                if (!isNameExist(rows, username)){
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }).then(()=>{
        db.run(`insert into users(username, password) values("${username}", "${password}")`);
        socket.emit("signup", {value: true});
    }).catch(()=>{
        socket.emit("signup", {value: false});
    });
};

/** ログイン */
exports.login = (username, password, socket)=>{
    new Promise((resolve, reject)=>{
        db.serialize(()=>{
            db.all(`select * from users where username="${username}" and password="${password}"`, (err, rows)=>{
                if (err) throw err;
                // ユーザー名とパスワードが正しかったら
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
