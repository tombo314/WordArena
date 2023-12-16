// エレメントを取得する
let elemUsernameFriend = document.getElementById("js-username-friend");
let elemInputFriend = document.getElementById("js-input-friend");
let elemTime = document.getElementById("js-time");
let elemHpFrined = document.getElementById("js-hp-friend");
let elemHpEnemy = document.getElementById("js-hp-enemy");

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
        activateCommand(command);
        elemInputFriend.value = "";
    }
};

let activateCommand = (command)=>{
    if (command=="attack"){
        let damage = 20;
        giveDamage(damage, "enemy");
    } else if (command=="heal"){
        let heal = 20;
        giveDamage(-heal, "friend");
    }
};

let giveDamage = (damage, friend_or_enemy)=>{
    if (friend_or_enemy=="friend"){
        elemHpFrined.value = elemHpFrined.value-damage;
    } else if (friend_or_enemy=="enemy"){
        elemHpEnemy.value = elemHpEnemy.value-damage;
    }
};