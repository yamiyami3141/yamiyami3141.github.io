// すべてのコピー可能な要素を取得
var copyableElements = document.querySelectorAll(".clipboad");

// 各要素にダブルクリックイベントリスナーを追加
copyableElements.forEach(function(element) {
    element.addEventListener("dblclick", function() {
        // コピー対象のテキストを取得
        var text = this.innerText;

        // 一時的なテキストエリアを作成
        var tempTextArea = document.createElement("textarea");
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);

        // テキストを選択
        tempTextArea.select();

        // クリップボードにコピー
        document.execCommand("copy");

        // 一時的なテキストエリアを削除
        document.body.removeChild(tempTextArea);

        // コピー完了のメッセージを表示
        alert("コピーしました: " + text);
    });
});