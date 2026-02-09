(function() {
  const PASS_LIST = {
    "page-a": "bmVw",
    "page-b": ""
  };

  const currentScript = document.currentScript;
  const pageId = currentScript.getAttribute('data-id');
  const targetPass = PASS_LIST[pageId];

  if (!targetPass) return;

  let count = 0;
  const MAX_RETRY = 3;

  while (count < MAX_RETRY) {
    let input = prompt("パスワードを入力してください（残り " + (MAX_RETRY - count) + " 回）：");
    
    if (input === null) {
      location.replace("about:blank");
      return;
    }

    try {
      if (window.btoa(input) === targetPass) {
        return;
      }
    } catch (e) {
    }

    count++;
    if (count < MAX_RETRY) {
      alert("パスワードが違います。再入力してください。");
    }
  }

  alert("挑戦回数を超えました。");
  location.replace("about:blank");
})();