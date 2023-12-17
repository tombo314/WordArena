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

let activateCommand = (command, friend_or_enemy)=>{

    let valid = false;

    if (command=="attack"){
        let damage = 20;
        let target;
        if (friend_or_enemy=="friend"){
            target = "enemy";
        } else if (friend_or_enemy=="enemy"){
            target = "friend";
        }
        giveDamage(damage, target);
        valid = true;
    }
    else if (command=="heal"){
        let heal = 20;
        let target;
        if (friend_or_enemy=="friend"){
            target = "friend";
        } else if (friend_or_enemy=="enemy"){
            target = "enemy";
        }
        giveDamage(-heal, target);
        valid = true;
    }
    else if (command=="flame field"){
        let damage = 3;
        let target;
        if (friend_or_enemy=="friend"){
            target = "enemy";
        } else if (friend_or_enemy=="enemy"){
            target = "friend";
        }
        flame_field(damage, target);
        valid = true;
    }

    if (valid){
        if (friend_or_enemy=="friend"){
            elemInputFriend.value = "";
            elemMessageFriend.textContent = "";
        }
        else if (friend_or_enemy=="enemy"){
            elemInputEnemy.valid = "";
            elemMessageEnemy.textContent = "";
        }
    }
    else {
        let invalid_command_message = "無効なコマンドです";
        let show_duration = 100;

        if (friend_or_enemy=="friend"){
            elemMessageFriend.textContent = "";

            setTimeout(()=>{
                elemMessageFriend.textContent = invalid_command_message;
            }, show_duration);
        }
        else if (friend_or_enemy=="enemy"){
            elemMessageEnemy.textContent = "";

            setTimeout(()=>{
                elemMessageEnemy.textContent = invalid_command_message;
            }, show_duration);
        }
    }
};

let giveDamage = (damage, friend_or_enemy)=>{
    if (friend_or_enemy=="friend"){
        elemHpFrined.value = elemHpFrined.value-damage;
    } else if (friend_or_enemy=="enemy"){
        elemHpEnemy.value = elemHpEnemy.value-damage;
    }
};

//////////////////////////////////////////////

// スキル関数

let flame_field = (damage, friend_or_enemy)=>{
    let elem;
    if (friend_or_enemy=="friend"){
        elem = elemHpFrined;
    } else if (friend_or_enemy=="enemy"){
        elem = elemHpEnemy;
    }
    let set = setInterval(() => {
        elem.value -= damage;
        if (elem.value<=0){
            clearInterval(set);
        }
    }, 1000);
}