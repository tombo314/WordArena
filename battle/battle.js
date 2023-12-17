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
    console.log(data["commandData"]);
})

elemUsernameFriend.textContent = username;

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

let getTarget = (friendOrEnemy)=>{
};

let activateCommand = (command, friendOrEnemy)=>{

    let valid = false;

    if (command=="attack"){
        let damage = 20;
        let target;
        if (friendOrEnemy=="friend"){
            target = "enemy";
        } else if (friendOrEnemy=="enemy"){
            target = "friend";
        }
        giveDamage(damage, target);
        valid = true;
    }
    else if (command=="heal"){
        let heal = 20;
        let target;
        if (friendOrEnemy=="friend"){
            target = "friend";
        } else if (friendOrEnemy=="enemy"){
            target = "enemy";
        }
        giveDamage(-heal, target);
        valid = true;
    }
    else if (command=="flame field"){
        let damage = 3;
        let target;
        if (friendOrEnemy=="friend"){
            target = "enemy";
        } else if (friendOrEnemy=="enemy"){
            target = "friend";
        }
        flame_field(damage, target);
        valid = true;
    }

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
    else {
        let invalid_command_message = "無効なコマンドです";
        let show_duration = 100;

        if (friendOrEnemy=="friend"){
            elemMessageFriend.textContent = "";

            setTimeout(()=>{
                elemMessageFriend.textContent = invalid_command_message;
            }, show_duration);
        }
        else if (friendOrEnemy=="enemy"){
            elemMessageEnemy.textContent = "";

            setTimeout(()=>{
                elemMessageEnemy.textContent = invalid_command_message;
            }, show_duration);
        }
    }
};

let giveDamage = (damage, friendOrEnemy)=>{
    if (friendOrEnemy=="friend"){
        elemHpFrined.value = elemHpFrined.value-damage;
    } else if (friendOrEnemy=="enemy"){
        elemHpEnemy.value = elemHpEnemy.value-damage;
    }
};

//////////////////////////////////////////////

// スキル関数

let flame_field = (damage, friendOrEnemy)=>{
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