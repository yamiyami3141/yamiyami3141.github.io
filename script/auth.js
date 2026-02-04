// auth.js
(function() {
  const PASS_LIST = {
    "page-a": "", 
    "page-b": ""
  };

  // 自分のタグ（script）から data-id を取得
  const currentScript = document.currentScript;
  const pageId = currentScript.getAttribute('data-id');
  const targetPass = PASS_LIST[pageId];

  if (!targetPass) return;

  let input = "";
  while (true) {
    input = prompt("パスワードを入力してください：");
    if (input === null) {
      location.href = "https://www.google.com";
      break;
    }
    if (btoa(input) === targetPass) {
      break; 
    } else {
      alert("パスワードが違います。");
    }
  }
})();