// エレメントを取得する
let elemUsernameFriend = document.getElementById("js-username-friend");
let elemTime = document.getElementById("js-time");

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