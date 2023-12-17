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

// 変数を宣言・初期化する
let username = sessionStorage.getItem("username");
let socket = io();
let commandData;

// socket通信
socket.emit("commandData", null);
socket.on("commandData", (data)=>{
    commandData = data["commandData"];
});

elemUsernameFriend.textContent = username;

// カウントダウンを開始する
let startCountDown = (time_sec)=>{
    let set = setInterval(() => {
        let min = Math.floor(time_sec/60);
        let sec = time_sec%60;
        elemTime.textContent = `00${min}`.slice(-2)+":"+`00${sec}`.slice(-2);
        if (time_sec==0){
            clearInterval(set);
        }
        time_sec--;
    }, 1000);
};

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
    elem.textContent = "";
    setTimeout(()=>{
        elem.textContent = message;
    }, showDuration);   
};

// コマンドを実行する
let activateCommand = (command, friendOrEnemy)=>{
    let valid = false;

    if (command=="attack"){
        let damage = commandData[command]["value"];
        let target = getTarget(command, friendOrEnemy);
        giveDamage(damage, target);
        valid = true;
    }
    else if (command=="heal"){
        let heal = commandData[command]["value"];
        let target = getTarget(command, friendOrEnemy);
        giveDamage(-heal, target);
        valid = true;
    }
    else if (command=="flame field"){
        let damage = commandData[command]["value"];
        let target = getTarget(command, friendOrEnemy);
        flameField(damage, target);
        valid = true;
    }

    // コマンドが有効のとき
    if (valid){
        if (friendOrEnemy=="friend"){
            elemInputFriend.value = "";
            elemMessageFriend.textContent = "";
        }
        else if (friendOrEnemy=="enemy"){
            elemInputEnemy.valid = "";
            elemMessageEnemy.textContent = "";
        }
    }
    // コマンドが無効のとき
    else {
        let invalidCommandMessage = "無効なコマンドです。";
        showMessage(invalidCommandMessage, friendOrEnemy);
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
        elem.value -= damage;
        if (elem.value<=0){
            clearInterval(set);
        }
    }, 1000);
}