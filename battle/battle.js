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
let elemGameStart = document.getElementById("js-game-start");
let elemBlackSheet = document.getElementById("js-black-sheet");

// 変数を宣言・初期化する
let username = sessionStorage.getItem("username");
let socket = io();
let commandData;
let inCoolTimeFriend = false;
let inCoolTimeEnemy = false;
let gameStarted = false;
let gameEnded = false;

// debugモード
let isDebug = true;

// socket通信
socket.emit("commandData", null);
socket.on("commandData", (data)=>{
    commandData = data["commandData"];
});

// ユーザー名を取得する
elemUsernameFriend.textContent = username;

// イベントハンドラ
elemGameStart.onclick = ()=>{
    gameStart();
};

onkeydown = (e)=>{
    if (e.key=="Enter" && !gameStarted && !isDebug){
        gameStart();
    }
}

elemInputFriend.onkeydown = (e)=>{
    if (e.key=="Enter"){
        let command = elemInputFriend.value;
        activateCommand(command, "friend");
    }
};

// debug
if (isDebug){
    elemBlackSheet.style.display = "none";
}

let setCountDown;
/** カウントダウンを開始する */
let startCountDown = (time_sec)=>{
    setCountDown = setInterval(() => {
        let min = Math.floor(time_sec/60);
        let sec = time_sec%60;
        elemTime.textContent = "残り時間 " + `00${min}`.slice(-2)+":"+`00${sec}`.slice(-2);
        if (time_sec<=0 && !gameEnded){
            gameEnd();
        }
        time_sec--;
    }, 1000);
};

/** カウントダウンを終了する */
let stopCountDown = ()=>{
    clearInterval(setCountDown);
}

/** コマンドの対象を得る */
let getTarget = (commandName, friendOrEnemy, damageOrDefense)=>{
    let targetSelect;
    if (damageOrDefense=="damage"){
        targetSelect = "damageTarget";
    } else if (damageOrDefense=="defense"){
        targetSelect = "defenseTarget";
    }
    let commandTarget = commandData[commandName][targetSelect];
    let target;
    if (friendOrEnemy=="friend"){
        target = commandTarget;
    }
    else if (friendOrEnemy=="enemy"){
        if (commandTarget=="friend"){
            target = "enemy";
        } else if (commandTarget=="enemy"){
            target = "friend";
        }
    }
    return target;
};


/** メッセージを表示する */
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

/** クールタイムを発生させる */
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
                elemCoolTimeFriend.textContent = "";
            } else if (friendOrEnemy=="enemy"){
                inCoolTimeEnemy = false;
                elemCoolTimeEnemy.textContent = "";
            }
        }
        coolTimeSec--;
    }, 1000);
};

/** コマンドを実行する */
let activateCommand = (command, friendOrEnemy)=>{

    let damage;
    let damageTarget;
    let defense;
    let defenseTarget;
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
    
    // コマンドが有効のとき
    if (command in commandData && !inCoolTime){
        // コマンドの情報を取得する
        damage = commandData[command]["damage"];
        damageTarget = getTarget(command, friendOrEnemy, "damage");
        defense = commandData[command]["defense"];
        defenseTarget = getTarget(command, friendOrEnemy, "defense");
        coolTime = commandData[command]["coolTime"];
        generateCoolTime(coolTime, friendOrEnemy);
        showMessage(`activated: ${command}`, friendOrEnemy);
    }
    // コマンドが無効のとき
    else {
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
        giveDamage(damage, damageTarget);
    }
    else if (command=="heal"){
        giveDamage(damage, damageTarget);
    }
    else if (command=="flame field"){
        giveSlipDamage(damage, damageTarget);
    }
};

// ダメージを与える
let giveDamage = (damage, friendOrEnemy)=>{
    let elem;
    if (friendOrEnemy=="friend"){
        elem = elemHpFrined;
    } else if (friendOrEnemy=="enemy"){
        elem = elemHpEnemy;
    }
    elem.value -= damage;
    if (elem.value<=0){
        gameEnd();
    }
};

// スリップダメージを与える
let giveSlipDamage = (damage, friendOrEnemy)=>{
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

// ゲーム開始
let gameStart = ()=>{
    gameStarted = true;
    elemBlackSheet.style.display = "none";
    let gameDuration = 180;
    startCountDown(gameDuration);
};

// ゲーム終了
let gameEnd = ()=>{
    gameEnded = true;
    elemInputFriend.disabled = true;
    elemMessageFriend.value = "";
    stopCountDown();
    if (elemHpFrined.value<elemHpEnemy.value){
        alert("相手の勝利です");
    } else if (elemHpFrined.value>elemHpEnemy.value){
        alert("あなたの勝利です");
    } else {
        alert("引き分けです");
    }
};