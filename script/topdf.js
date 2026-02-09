const { jsPDF } = window.jspdf;
const { PDFDocument } = PDFLib;

// DOM要素の取得
const dom = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    mergeBtn: document.getElementById('merge-btn'),
    clearBtn: document.getElementById('clear-all-btn'),
    fileList: document.getElementById('file-list'),
    sortOrder: document.getElementById('sort-order'),
    fileCount: document.getElementById('file-count'),
    
    renameCheck: document.getElementById('rename-check'),
    nameInput: document.getElementById('custom-filename-input'),
    
    passwordCheck: document.getElementById('password-check'),
    passwordInput: document.getElementById('pdf-password-input'),
    
    margin: document.getElementById('margin-size'),
    compression: document.getElementById('compression-level'),
    
    // 追加: フォルダ結合チェックボックス
    mergeFoldersCheck: document.getElementById('merge-folders-check')
};

// 状態管理: フォルダ名をキーとしたオブジェクト
// 例: { "FolderA": [file1, file2], "FolderB": [file3] }
let fileGroups = {};

// イベントリスナー設定
dom.dropZone.onclick = () => dom.fileInput.click();
dom.fileInput.onchange = (e) => handleFiles(e.target.files);

// UI切り替えイベント
dom.sortOrder.onchange = () => sortAndDisplay();

dom.renameCheck.onchange = e => {
    dom.nameInput.classList.toggle('hidden', !e.target.checked);
    if(e.target.checked) dom.nameInput.focus();
};

dom.passwordCheck.onchange = e => {
    dom.passwordInput.classList.toggle('hidden', !e.target.checked);
    if(e.target.checked) dom.passwordInput.focus();
};

dom.clearBtn.onclick = () => { 
    if(confirm("リストを空にしますか？")) { 
        fileGroups = {};
        dom.fileInput.value = '';
        updateUI(); 
    } 
};

// 外部(HTML)から呼び出せるようにGlobalに登録
window.topdfUpdateUI = () => updateUI();

// ファイル処理
function handleFiles(files) {
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (newFiles.length === 0) return;
    
    newFiles.forEach(file => {
        // フォルダ名の取得 (webkitRelativePath が空の場合は "Root" 扱い)
        let pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [];
        // 親フォルダ名を取得 (例: Parent/Child/img.jpg -> Child を採用。直下なら Parent)
        // 基本的にはアップロードした最上位フォルダ(pathParts[0])を採用するのが自然
        let folderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : (pathParts[0] || "未分類");

        if (!fileGroups[folderName]) {
            fileGroups[folderName] = [];
        }
        fileGroups[folderName].push(file);
    });

    sortAndDisplay();
}

function sortAndDisplay() {
    const val = dom.sortOrder.value;
    
    // 各グループ内のファイルをソート
    Object.keys(fileGroups).forEach(folderName => {
        fileGroups[folderName].sort((a, b) => {
            if (val === 'name-asc') return a.name.localeCompare(b.name, undefined, {numeric: true});
            if (val === 'name-desc') return b.name.localeCompare(a.name, undefined, {numeric: true});
            return b.lastModified - a.lastModified;
        });
    });

    updateUI();
}

function updateUI() {
    const folders = Object.keys(fileGroups).sort(); // フォルダ名自体は昇順固定
    let totalFiles = 0;
    
    if (folders.length === 0) {
        dom.fileList.innerHTML = '';
        dom.fileCount.innerText = '画像未選択';
        dom.mergeBtn.classList.add('hidden');
        dom.clearBtn.classList.add('hidden');
        return;
    }

    const viewMode = document.querySelector('input[name="view-mode"]:checked').value;
    dom.fileList.innerHTML = '';
    
    // モード切替用クラス制御
    if (viewMode === 'grid') {
        dom.fileList.classList.remove('file-list-mode');
    } else {
        dom.fileList.classList.add('file-list-mode');
    }

    folders.forEach(folderName => {
        const files = fileGroups[folderName];
        totalFiles += files.length;

        // フォルダごとのコンテナ作成
        const section = document.createElement('div');
        section.className = 'folder-section';
        
        // ヘッダー
        const header = document.createElement('div');
        header.className = 'folder-header';
        header.innerHTML = `<span>📁 ${folderName}</span> <span style="font-size:0.8em; font-weight:normal;">(${files.length}枚)</span>`;
        section.appendChild(header);

        // ファイルグリッド
        const gridInner = document.createElement('div');
        gridInner.className = 'file-grid-inner';
        
        // ファイル要素生成
        gridInner.innerHTML = files.map((f, i) => {
            // 注意: removeFileにフォルダ名とインデックスを渡す必要がありますが、
            // HTML属性で文字列を渡すのはエスケープ面倒なので、関数経由またはdatasetを使います。
            // ここではシンプルにonclick文字列生成で対応します。
            const safeFolderName = folderName.replace(/'/g, "\\'");
            
            if (viewMode === 'grid') {
                return `
                <div class="file-item">
                    <div class="btn-remove" onclick="removeFile('${safeFolderName}', ${i})">×</div>
                    <div style="margin-bottom:4px;">🖼</div>
                    ${f.name.length > 15 ? f.name.slice(0,12)+'...' : f.name}
                </div>`;
            } else {
                return `
                <div class="file-item">
                    <div class="btn-remove" onclick="removeFile('${safeFolderName}', ${i})">×</div>
                    <div style="font-size: 14px; flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        🖼 ${f.name}
                    </div>
                    <div class="fs-b7" style="color: #888;">${(f.size / 1024).toFixed(1)} KB</div>
                </div>`;
            }
        }).join('');

        section.appendChild(gridInner);
        dom.fileList.appendChild(section);
    });
    
    dom.fileCount.innerText = `${folders.length}フォルダ / 合計 ${totalFiles} 枚`;
    dom.mergeBtn.classList.remove('hidden');
    dom.clearBtn.classList.remove('hidden');
}

// 削除関数（フォルダ名とインデックスを受け取る）
window.removeFile = (folderName, i) => { 
    if (fileGroups[folderName]) {
        fileGroups[folderName].splice(i, 1);
        if (fileGroups[folderName].length === 0) {
            delete fileGroups[folderName];
        }
    }
    updateUI(); 
};

// 画像読み込みとCanvasによる圧縮処理（既存コード維持）
const processImage = (file, quality) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                // モノクロ変換処理
                if (document.getElementById('grayscale-check').checked) {
                    ctx.filter = 'grayscale(100%)';
                }

                ctx.drawImage(img, 0, 0, img.width, img.height);
                
                const finalFormat = (quality < 1.0) ? 'image/jpeg' : file.type;
                const compressedData = canvas.toDataURL(finalFormat, quality);
                
                resolve({
                    data: compressedData,
                    width: img.width,
                    height: img.height,
                    format: finalFormat === 'image/jpeg' ? 'JPEG' : 'PNG'
                });
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// 共通: PDFに画像を追加する処理
async function addImagesToDoc(doc, files, quality, margin) {
    let pageAdded = false;

    // もし既存ページがある状態(docが真っ白でない)なら改ページフラグを調整
    // jsPDFの初期ページ判定が難しいため、呼び出し元で制御するか、
    // ここでは「リストの最初以外は改ページ」とする
    
    // ただし、jsPDF作成直後は1ページ目が空で存在するため、
    // 「このドキュメントへの書き込みが初回かどうか」を知る必要がある。
    // 簡易的に、doc.internal.pages.lengthなどをチェックするか、
    // 呼び出し側でループ制御する。
    // 今回は「渡されたfiles」を順番に追加するロジックにする。
    
    for (let i = 0; i < files.length; i++) {
        // 画像処理
        const imgData = await processImage(files[i], quality);
        
        const pageWidth = imgData.width + (margin * 2);
        const pageHeight = imgData.height + (margin * 2);
        const orient = pageWidth > pageHeight ? 'l' : 'p';

        // ページ追加ロジック
        // 現在のページが「初期作成直後の空ページ」かつ「まだ何も描画していない」場合の判定は難しいので、
        // setPage(1) してサイズ変更するか、addPageするか。
        // ここでは呼び出し元で new jsPDF しているので、
        // 1枚目は setPage、2枚目以降(または結合時の次画像)は addPage という制御が必要。
        
        // 簡易策: 常にaddPageし、最後に空白の1ページ目を削除する手もあるが、
        // ここでは「docの現在のページ数が1かつコンテンツがない」と仮定して、
        // 1枚目はリサイズ、それ以降は追加とする。
        
        const isFirstPageOfDoc = (doc.internal.pages.length - 1 === 1) && (i === 0) && (!doc.hasImageAdded); 

        if (isFirstPageOfDoc) {
            // 1ページ目のサイズ変更と向き設定はjsPDFのバージョンによっては複雑
            // なので、最も確実な「常にaddPageして、最後に先頭(空白)を削除」方式を採用するか、
            // あるいは単純に：
            doc.deletePage(1); // デフォルトのA4ページを削除
            doc.addPage([pageWidth, pageHeight], orient);
        } else {
            doc.addPage([pageWidth, pageHeight], orient);
        }
        
        doc.addImage(
            imgData.data, 
            imgData.format, 
            margin, 
            margin, 
            imgData.width, 
            imgData.height
        );
        doc.hasImageAdded = true; // カスタムフラグ

        // UI更新(少し待機)
        await new Promise(r => setTimeout(r, 10));
    }
}


// PDF生成処理（メイン）
dom.mergeBtn.onclick = async () => {
    const folders = Object.keys(fileGroups).sort();
    if (folders.length === 0) return;

    const originalText = dom.mergeBtn.innerText;
    dom.mergeBtn.disabled = true;

    try {
        const quality = parseFloat(dom.compression.value);
        const margin = parseInt(dom.margin.value);
        const usePassword = dom.passwordCheck.checked;
        const password = dom.passwordInput.value;
        const mergeAll = dom.mergeFoldersCheck.checked; // 結合するかどうか

        // --- 全結合モード ---
        if (mergeAll) {
            dom.mergeBtn.innerText = "結合PDF作成中...";
            
            // 1つのドキュメントを作成
            const doc = new jsPDF({ compress: true });
            doc.hasImageAdded = false; // フラグ初期化

            // 全フォルダをループ
            let processedCount = 0;
            const totalFiles = folders.reduce((sum, f) => sum + fileGroups[f].length, 0);

            for (const folder of folders) {
                const files = fileGroups[folder];
                
                // 画像追加ループ
                for (let i = 0; i < files.length; i++) {
                    processedCount++;
                    dom.mergeBtn.innerText = `処理中 (${processedCount}/${totalFiles})...`;
                    
                    const imgData = await processImage(files[i], quality);
                    const pageWidth = imgData.width + (margin * 2);
                    const pageHeight = imgData.height + (margin * 2);
                    const orient = pageWidth > pageHeight ? 'l' : 'p';

                    // 最初の1枚目だけ既存ページ置換、それ以外は追加
                    if (processedCount === 1) {
                         // デフォルトページを削除して追加
                         doc.deletePage(1);
                         doc.addPage([pageWidth, pageHeight], orient);
                    } else {
                        doc.addPage([pageWidth, pageHeight], orient);
                    }

                    doc.addImage(imgData.data, imgData.format, margin, margin, imgData.width, imgData.height);
                    
                    // 暗号化設定（初回のみ設定すれば効く）
                    if (processedCount === 1 && usePassword && password) {
                         if (typeof doc.setEncryption === 'function') {
                            doc.setEncryption(password, password, ["print", "copy", "modify"], "AES_128");
                        } else {
                            console.warn("暗号化不可");
                        }
                    }
                    await new Promise(r => setTimeout(r, 10));
                }
            }

            // 保存名決定
            let fileName = "combined.pdf";
            if (dom.renameCheck.checked && dom.nameInput.value) {
                fileName = dom.nameInput.value;
            } else if (folders.length > 0) {
                fileName = folders[0] + (folders.length > 1 ? "_others" : "") + ".pdf";
            }
            if (!fileName.endsWith('.pdf')) fileName += ".pdf";

            doc.save(fileName);

        } 
        // --- 個別フォルダモード ---
        else {
            for (let fIndex = 0; fIndex < folders.length; fIndex++) {
                const folder = folders[fIndex];
                const files = fileGroups[folder];
                
                dom.mergeBtn.innerText = `作成中: ${folder} (${fIndex + 1}/${folders.length})...`;

                const doc = new jsPDF({ compress: true });
                
                // 画像追加ループ
                for (let i = 0; i < files.length; i++) {
                    const imgData = await processImage(files[i], quality);
                    const pageWidth = imgData.width + (margin * 2);
                    const pageHeight = imgData.height + (margin * 2);
                    const orient = pageWidth > pageHeight ? 'l' : 'p';

                    if (i === 0) {
                        doc.deletePage(1);
                        doc.addPage([pageWidth, pageHeight], orient);
                        // パスワード設定
                        if (usePassword && password) {
                             if (typeof doc.setEncryption === 'function') {
                                doc.setEncryption(password, password, ["print", "copy", "modify"], "AES_128");
                            }
                        }
                    } else {
                        doc.addPage([pageWidth, pageHeight], orient);
                    }

                    doc.addImage(imgData.data, imgData.format, margin, margin, imgData.width, imgData.height);
                    await new Promise(r => setTimeout(r, 10));
                }

                // 保存名決定（フォルダ名優先）
                let fileName = folder + ".pdf";
                
                // もし「名前指定」がある場合、連番などをつける
                if (dom.renameCheck.checked && dom.nameInput.value) {
                    const base = dom.nameInput.value.replace('.pdf', '');
                    fileName = `${base}_${folder}.pdf`;
                }

                doc.save(fileName);
                
                // ブラウザが連続ダウンロードを処理できるように少し待機
                await new Promise(r => setTimeout(r, 800));
            }
        }

        alert("完了しました！");

    } catch (err) {
        console.error(err);
        alert("エラーが発生しました: " + err.message);
    } finally {
        dom.mergeBtn.disabled = false;
        dom.mergeBtn.innerText = originalText;
    }
};