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
};
/** アカウント登録 */
let registerAccount=()=>{
    let valiUser = validateUsername(elemUsername.value);
    let valiPass = validateUsername(elemPassword.value);
    if (valiUser && valiPass){
        // mysqlに登録
    } else if (!valiUser){
        alert("ユーザー名は半角英数字6文字以上20文字以内で入力してください。");
    } else if (!valiPass){
        alert("パスワードは半角英数字6文字以上20文字以内で入力してください。");
    }
};

// 変数宣言
let socket = io();

// エレメント取得
let elemUsername = document.getElementById("js-username");
let elemPassword = document.getElementById("js-password");
let elemSubmit = document.getElementById("js-submit");

elemUsername.onclick =()=> registerAccount();