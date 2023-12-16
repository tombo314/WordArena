// 定数を宣言 //////
const AVAILABLE_CHAR = new Set([
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
     0 ,  1 ,  2 ,  3 ,  4 ,  5 ,  6 ,  7 ,  8 ,  9
]);
const TEXT_LEN_LIMIT = 6;

// 変数を宣言 //////

// エレメントを宣言 //////
let elemButtonMake = document.getElementById("js-button-make");
let elemButtonEnter = document.getElementById("js-button-enter");
let elemButtonAIBattle = document.getElementById("js-button-ai-battle");
let elemButtonBack = document.getElementById("js-button-back");
let elemButtonRooms = document.getElementById("js-button-rooms");
let elemBlackSheet = document.getElementById("js-black-sheet");

// 関数を宣言 //////
/** ユーザー名とパスワードのバリデーション -> bool */
let validate=(text)=>{
    for (let v of text){
        if (!AVAILABLE_CHAR.has(v)){
            return false;
        }
    }

    if (text.length<TEXT_LEN_LIMIT){
        return false;
    }
    return true;
};

/** 部屋名のボタンを動的に生成 */
let makeButton = (roomName)=>{
    let elem = document.createElement("button");
    elem.textContent = roomName;
    elem.setAttribute("style", `
        width: 100%;
    `);
};

// イベントを宣言 //////
elemButtonMake.onclick = ()=>{
    // 部屋名のボタンを動的に生成
    // if (validate()){
    //     makeButton();
    // }
};

elemButtonEnter.onclick = ()=>{
    elemButtonRooms.style.visibility = "visible";
    elemBlackSheet.style.visibility = "visible";
};

elemButtonAIBattle.onclick = ()=>{
    alert("AIバトルに移行します。");
    location.href = "/battle";
};

elemButtonBack.onclick = ()=>{
    alert("トップへ戻ります。");
    location.href = "/";
};

elemBlackSheet.onclick = ()=>{
    elemButtonRooms.style.visibility = "hidden";
    elemBlackSheet.style.visibility = "hidden";
};

onkeydown = (e)=>{
    if (e.key=="Escape"){
        elemButtonRooms.style.visibility = "hidden";
        elemBlackSheet.style.visibility = "hidden";    
    }
};