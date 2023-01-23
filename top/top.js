"use strict";

// 定数宣言
const ANAVAILABLE_CHAR = new Set([
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
     0 ,  1 ,  2 ,  3 ,  4 ,  5 ,  6 ,  7 ,  8 ,  9
]);

// 関数宣言
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
/** アカウント登録 */
let registerAccount=()=>{
    let valiUser = validate(elemUsername.value);
    let valiPass = validate(elemPassword.value);
    if (valiUser && valiPass){
        elemUsernameError.style.display = "none";
        elemPasswordError.style.display = "none";
        // mysqlに登録 -> /mysql/mysql.js
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

// 変数宣言
let socket = io();

// エレメント取得
let elemUsernameError = document.getElementById("js-username-error");
let elemPasswordError = document.getElementById("js-password-error");
let elemUsername = document.getElementById("js-username");
let elemPassword = document.getElementById("js-password");
let elemSubmit = document.getElementById("js-submit");

elemUsername.onkeydown = (e)=> {
    if (e.key=="Enter"){
        registerAccount();
    }
}
elemPassword.onkeydown = (e)=> {
    if (e.key=="Enter"){
        registerAccount();
    }
}

elemSubmit.onclick = ()=>{
    registerAccount();
}