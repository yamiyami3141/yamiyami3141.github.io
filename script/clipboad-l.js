document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    // 選択されたテキストが空でなく、かつ選択範囲がターゲットクラス内か判定
    if (selectedText.length > 0) {
        const anchorNode = selection.anchorNode.parentElement;
        
        if (anchorNode && anchorNode.classList.contains('clipboad-l')) {
            // コピー実行
            copyToClipboard(selectedText);
            
            // 視覚的フィードバック（一瞬だけ背景を変える等）
            anchorNode.style.backgroundColor = "#d1e7dd";
            setTimeout(() => {
                anchorNode.style.backgroundColor = "";
                // コピー後に選択を解除したい場合は以下の行を有効化
                // selection.removeAllRanges(); 
            }, 500);

            console.log("Auto-copied: " + selectedText);
        }
    }
});

// コピー用関数
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
    }
}