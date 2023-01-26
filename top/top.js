"use strict";

// 定数を宣言 //////
const ANAVAILABLE_CHAR = new Set([
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
     0 ,  1 ,  2 ,  3 ,  4 ,  5 ,  6 ,  7 ,  8 ,  9
]);

// 変数を宣言 //////
let socket = io();

// エレメント取得 //////
let elemUsernameError = document.getElementById("js-username-error");
let elemPasswordError = document.getElementById("js-password-error");
let elemUsername = document.getElementById("js-username");
let elemPassword = document.getElementById("js-password");
let elemSubmit = document.getElementById("js-submit");

// 関数を宣言 //////
/** ユーザー名とパスワードのバリデーション -> bool */
let validate=(text)=>{
    for (let v of text){
        if (!ANAVAILABLE_CHAR.has(v)){
            return false;
        }
    }
    if (text.length<6){
        return false;
    }
    return true;
};
/** アカウント登録またはログイン -> undefined*/
let submit=(mode)=>{
    let valiUser = validate(elemUsername.value);
    let valiPass = validate(elemPassword.value);
    if (valiUser && valiPass){
        elemUsernameError.style.display = "none";
        elemPasswordError.style.display = "none";
        socket.emit(mode, {value: {
            "username": elemUsername.value,
            "password": elemPassword.value
        }});
    } else {
        if (!valiUser){
            elemUsernameError.style.display = "block";
        } else {
            elemUsernameError.style.display = "none";
        }
        if (!valiPass){
            elemPasswordError.style.display = "block";
        } else {
            elemPasswordError.style.display = "none";
        }
    }
};

// イベントを宣言 //////
// ユーザー情報を送信
elemUsername.onkeydown = (e)=> {
    if (e.key=="Enter"){
        submit("login");
    }
}
elemPassword.onkeydown = (e)=> {
    if (e.key=="Enter"){
        submit("login");
    }
}
elemSubmit.onclick = ()=>{
    // submit("login");
    submit("signin");
}

// ソケット通信を受信 //////
socket.on("login", (data)=>{
    // ログイン成功でtrue、失敗でfalseを受け取る
    if (data.value){
        alert("ログインに成功しました。");
        // 画面を遷移
    } else {
        alert("ログインに失敗しました。");
    }
});

socket.on("signin", (data)=>{
    // アカウント登録成功でtrue、失敗でfalseを受け取る
    if (data.value){
        alert("アカウント登録に成功しました。");
        // 画面を遷移
    } else {
        alert("ユーザー名が重複しています。");
    }
});
