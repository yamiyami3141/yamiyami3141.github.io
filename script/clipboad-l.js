// すべてのコピー可能な要素を取得
const copyableElements = document.querySelectorAll(".clipboad-l");

// 長押しと判定する時間（ミリ秒）
const LONG_PRESS_DURATION = 800; 

copyableElements.forEach(element => {
    let timer;

    // 指が触れたとき
    element.addEventListener("touchstart", (e) => {
        timer = setTimeout(() => {
            const text = element.innerText;
            
            // クリップボードAPIを使用してコピー
            navigator.clipboard.writeText(text).then(() => {
                // 成功時の処理
                element.style.backgroundColor = "#e0e0e0"; // 視覚的なフィードバック
                setTimeout(() => element.style.backgroundColor = "", 200);
                
                alert("コピーしました: " + text);
            }).catch(err => {
                console.error("コピーに失敗しました", err);
            });
        }, LONG_PRESS_DURATION);
    }, { passive: true });

    // 指が離れた、または動いたときはキャンセル
    element.addEventListener("touchend", () => clearTimeout(timer));
    element.addEventListener("touchmove", () => clearTimeout(timer));
    element.addEventListener("touchcancel", () => clearTimeout(timer));
});