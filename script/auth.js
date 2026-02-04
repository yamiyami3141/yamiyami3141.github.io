(function() {
  const PASS_LIST = {
    "page-a": "", 
    "page-b": ""
  };

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