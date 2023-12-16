// エレメントを取得する
let elemUsernameFriend = document.getElementById("js-username-friend");

// 変数を宣言・初期化する
let username = sessionStorage.getItem("username");

elemUsernameFriend.textContent = username;