"use strict";

// 定数を宣言 //////
const AVAILABLE_CHAR = new Set([
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
     0 ,  1 ,  2 ,  3 ,  4 ,  5 ,  6 ,  7 ,  8 ,  9
]);

// 変数を宣言 //////
let signinLoginMode;
let socket = io();

// エレメントを宣言 //////
let elemUsernameError = document.getElementById("js-username-error");
let elemPasswordError = document.getElementById("js-password-error");
let elemUsername = document.getElementById("js-username");
let elemPassword = document.getElementById("js-password");
let elemSubmit = document.getElementById("js-submit");
let elemBack = document.getElementById("js-back");
let elemSigninPage = document.getElementById("js-signin-page");
let elemLoginPage = document.getElementById("js-login-page");
let elemForm = document.getElementById("js-form");
let elemSigninLogin = document.getElementById("js-signin-login");
let elemSigninText = document.getElementById("js-signin-text");
let elemLoginText = document.getElementById("js-login-text");

// 関数を宣言 //////
/** ユーザー名とパスワードのバリデーション -> bool */
let validate=(text)=>{
    for (let v of text){
        if (!AVAILABLE_CHAR.has(v)){
            return false;
        }
    }
    if (text.length<6){
        return false;
    }
    return true;
};

/** アカウント登録またはログイン */
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

// イベントを宣言 ////
// ユーザー情報を送信 Enter
elemUsername.onkeydown = (e)=> {
    if (e.key==="Enter"){
        submit(signinLoginMode);
    }
};

// ユーザー情報を送信 Enter
elemPassword.onkeydown = (e)=> {
    if (e.key==="Enter"){
        submit(signinLoginMode);
    }
};

// 送信ボタン Enter クリック
elemSubmit.onclick = ()=>{
    submit(signinLoginMode);
};

// 戻るボタン
elemBack.onclick = ()=>{
    elemForm.style.display = "none";
    elemSigninLogin.style.display = "block";
    elemSigninText.style.display = "none";
    elemLoginText.style.display = "none";
    elemUsername.value = "";
    elemPassword.value = "";
    document.title = "トップ";
};

// アカウント登録画面に遷移
elemSigninPage.onclick = ()=>{
    elemForm.style.display = "block";
    elemSigninLogin.style.display = "none";
    elemSigninText.style.display = "block";
    signinLoginMode = "signin";
    document.title = "アカウント登録";
};

// ログイン画面に遷移
elemLoginPage.onclick = ()=>{
    elemForm.style.display = "block";
    elemSigninLogin.style.display = "none";
    elemLoginText.style.display = "block";
    signinLoginMode = "login";
    document.title = "ログイン";
};

// ソケット通信を受信 //////
socket.on("login", (data)=>{
    // ログイン成功でtrue、失敗でfalseを受け取る
    if (data.value){
        alert("ログインに成功しました。");
        sessionStorage.setItem("username", elemUsername.value);
        location.href = "/rooms";
        // 画面を遷移
    } else {
        alert("ユーザー名またはパスワードが違います。");
    }
});

socket.on("signin", (data)=>{
    // アカウント登録成功でtrue、失敗でfalseを受け取る
    if (data.value){
        alert("アカウント登録に成功しました。");
        signinLoginMode = "login";
        document.title = "ログイン";
        elemLoginText.style.display = "block";
        elemSigninText.style.display = "none";
        elemUsername.value = "";
        elemPassword.value = "";
        elemPassword.blur();
        // 画面を遷移
    } else {
        alert("ユーザー名が重複しています。");
    }
});