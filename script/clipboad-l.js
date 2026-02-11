document.querySelectorAll(".clipboad-l").forEach(element => {
    let timer;

    // 長押しを検知
    element.addEventListener("touchstart", (e) => {
        // すでに oncontextmenu="return false" がある場合、
        // タイマーが途切れないように念のためここで伝播を確認
        timer = setTimeout(() => {
            const text = element.innerText;
            copyAction(text);
            
            // フィードバック
            element.style.backgroundColor = "rgba(0,0,0,0.1)";
            setTimeout(() => element.style.backgroundColor = "", 200);
            
            alert("コピーしました: " + text);
        }, 800); 
    }, { passive: true });

    // キャンセル処理
    const clear = () => clearTimeout(timer);
    element.addEventListener("touchend", clear);
    element.addEventListener("touchmove", clear);
    element.addEventListener("touchcancel", clear);

    // HTMLの oncontextmenu="return false" と競合しないよう念押し
    element.addEventListener("contextmenu", (e) => {
        e.preventDefault(); 
    });
});

function copyAction(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // スマホで画面がガクッと動かないための対策
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.select();
    // iOS Safari対策として選択範囲を明示的に指定
    textArea.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(textArea);
}