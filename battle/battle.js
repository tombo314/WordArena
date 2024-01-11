"use strict";

// エレメントを取得する
let elemUsernameFriend = document.getElementById("js-username-friend");
let elemInputFriend = document.getElementById("js-input-friend");
let elemInputEnemy = document.getElementById("js-input-enemy");
let elemTime = document.getElementById("js-time");
let elemHpFrined = document.getElementById("js-hp-friend");
let elemHpEnemy = document.getElementById("js-hp-enemy");
let elemMessageFriend = document.getElementById("js-message-friend");
let elemMessageEnemy = document.getElementById("js-message-enemy");
let elemCoolTimeFriend = document.getElementById("js-cool-time-friend");
let elemCoolTimeEnemy = document.getElementById("js-cool-time-enemy");

// 変数を宣言・初期化する
let username = sessionStorage.getItem("username");
let socket = io();
let commandData;
let inCoolTimeFriend = false;
let inCoolTimeEnemy = false;

// socket通信
socket.emit("commandData", null);
socket.on("commandData", (data)=>{
    commandData = data["commandData"];
});

// ユーザー名を取得する
elemUsernameFriend.textContent = username;

// カウントダウンを開始する
let startCountDown = (time_sec)=>{
    let set = setInterval(() => {
        let min = Math.floor(time_sec/60);
        let sec = time_sec%60;
        elemTime.textContent = "残り時間: " + `00${min}`.slice(-2)+":"+`00${sec}`.slice(-2);
        if (time_sec==0){
            clearInterval(set);
        }
        time_sec--;
    }, 1000);
};
startCountDown(120);

elemInputFriend.onkeydown = (e)=>{
    if (e.key=="Enter"){
        let command = elemInputFriend.value;
        activateCommand(command, "friend");
    }
};

// コマンドの対象を得る
let getTarget = (commandName, friendOrEnemy)=>{
    let allyOrOpponent = commandData[commandName]["target"];
    let target;
    if (allyOrOpponent=="ally"){
        target = friendOrEnemy;
    } else if (allyOrOpponent=="opponent"){
        if (friendOrEnemy=="friend"){
            target = "enemy";
        } else if (friendOrEnemy=="enemy"){
            target = "friend";
        }
    }
    return target;
};

// メッセージを表示する
let showMessage = (message, friendOrEnemy)=>{
    let showDuration = 100;
    let elem;
    if (friendOrEnemy=="friend"){
        elem = elemMessageFriend;
    } else if (friendOrEnemy=="enemy"){
        elem = elemMessageEnemy;
    }
    elem.value = "";
    setTimeout(()=>{
        elem.value = message;
    }, showDuration);   
};

// クールタイムを発生させる
let generateCoolTime = (coolTimeSec, friendOrEnemy)=>{

    if (friendOrEnemy=="friend"){
        inCoolTimeFriend = true;
    } else if (friendOrEnemy=="enemy"){
        inCoolTimeEnemy = true;
    }

    let set = setInterval(()=>{
        let min = Math.floor(coolTimeSec/60);
        let sec = coolTimeSec%60;
        if (friendOrEnemy=="friend"){
            elemCoolTimeFriend.textContent = "クールタイム " + `00${min}`.slice(-2)+":"+`00${sec}`.slice(-2);
        } else if (friendOrEnemy=="enemy"){
            elemCoolTimeEnemy.textContent = "クールタイム " + `00${min}`.slice(-2)+":"+`00${sec}`.slice(-2);
        }
        if (coolTimeSec<=0){
            clearInterval(set);
            if (friendOrEnemy=="friend"){
                inCoolTimeFriend = false;
                elemCoolTimeFriend = "";
            } else if (friendOrEnemy=="enemy"){
                inCoolTimeEnemy = false;
                elemCoolTimeEnemy = "";
            }
        }
        coolTimeSec--;
    }, 1000);
};

// コマンドを実行する
let activateCommand = (command, friendOrEnemy)=>{

    let damage;
    let target;
    let coolTime;
    let inCoolTime;
    
    // クールタイム中かどうか判定する
    if (friendOrEnemy=="friend"){
        if (inCoolTimeFriend){
            inCoolTime = true;
        } else {
            inCoolTime = false;
        }
    } else if (friendOrEnemy=="enemy"){
        if (inCoolTimeEnemy){
            inCoolTime = true;
        } else {
            inCoolTime = false;
        }
    }

    // コマンドの情報を取得する
    if (command in commandData && !inCoolTime){
        damage = commandData[command]["damage"];
        target = getTarget(command, friendOrEnemy);
        coolTime = commandData[command]["coolTime"];
        generateCoolTime(coolTime, friendOrEnemy);
        showMessage(`activated: ${command}`, friendOrEnemy);
    } else {
        let message;
        if (!(command in commandData)){
            message = "無効なコマンドです";
        } else if (inCoolTime){
            message = "スキルのクールタイム中です";
        }
        showMessage(message, friendOrEnemy);
        return;
    }

    // テキストを初期化する
    if (friendOrEnemy=="friend"){
        elemInputFriend.value = "";
        elemMessageFriend.textContent = "";
    }
    else if (friendOrEnemy=="enemy"){
        elemInputEnemy.valid = "";
        elemMessageEnemy.textContent = "";
    }

    // コマンドの処理を行う
    if (command=="attack"){
        giveDamage(damage, target);
    }
    else if (command=="heal"){
        giveDamage(damage, target);
    }
    else if (command=="flame field"){
        flameField(damage, target);
    }
};

// ダメージを与える
let giveDamage = (damage, friendOrEnemy)=>{
    if (friendOrEnemy=="friend"){
        elemHpFrined.value -= damage;
        if (elemHpFrined.value<=0){
            alert("相手の勝利です。");
        }
    } else if (friendOrEnemy=="enemy"){
        elemHpEnemy.value -= damage;
        if (elemHpEnemy.value<=0){
            alert("あなたの勝利です。");
        }
    }
};

//////////////////////////////////////////////

// スキル関数

let flameField = (damage, friendOrEnemy)=>{
    let elem;
    if (friendOrEnemy=="friend"){
        elem = elemHpFrined;
    } else if (friendOrEnemy=="enemy"){
        elem = elemHpEnemy;
    }
    let set = setInterval(() => {
        giveDamage(damage, friendOrEnemy);
        if (elem.value<=0){
            clearInterval(set);
        }
    }, 1000);
};