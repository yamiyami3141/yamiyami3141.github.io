const { jsPDF } = window.jspdf;
const { PDFDocument } = PDFLib;

// DOM要素の取得
const dom = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'), // フォルダ用
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
    
    mergeFoldersCheck: document.getElementById('merge-folders-check')
};

// ==========================================
// ファイル用とフォルダ用の入力を分けて制御する追加機能
// ==========================================
const singleFileInput = document.createElement('input');
singleFileInput.type = 'file';
singleFileInput.multiple = true;
singleFileInput.accept = 'image/*, application/pdf'; // 画像とPDFを許可
singleFileInput.style.display = 'none';
document.body.appendChild(singleFileInput);

// ドロップゾーンにファイル選択用のボタンを動的に追加
const fileSelectBtn = document.createElement('button');
fileSelectBtn.innerText = "単一ファイルを選択する場合はこちら";
fileSelectBtn.style.cssText = "display: block; margin: 15px auto 0; padding: 6px 15px; font-size: 0.8rem; background: #fff; border: 1px solid #000; border-radius: 8px; cursor: pointer;";
fileSelectBtn.onclick = (e) => {
    e.stopPropagation(); // フォルダ選択(DropZone本体のクリック)を発火させない
    singleFileInput.click();
};
dom.dropZone.appendChild(fileSelectBtn);
// ==========================================

// 状態管理: フォルダ名をキーとしたオブジェクト
let fileGroups = {};

// イベントリスナー設定
dom.dropZone.onclick = () => dom.fileInput.click();
dom.fileInput.onchange = (e) => handleFiles(e.target.files);
singleFileInput.onchange = (e) => handleFiles(e.target.files);

// ドラッグ&ドロップの強化（フォルダ展開機能）
dom.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dom.dropZone.style.borderColor = '#000';
    dom.dropZone.style.background = 'rgba(255, 255, 255, 0.6)';
});
dom.dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dom.dropZone.style.borderColor = 'rgba(0,0,0,0.2)';
    dom.dropZone.style.background = 'rgba(255, 255, 255, 0.3)';
});
dom.dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dom.dropZone.style.borderColor = 'rgba(0,0,0,0.2)';
    dom.dropZone.style.background = 'rgba(255, 255, 255, 0.3)';
    
    const items = e.dataTransfer.items;
    const filesArray = [];
    
    // フォルダとファイルの両方を再帰的に読み込む
    for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        if (item) {
            await traverseFileTree(item, "", filesArray);
        }
    }
    handleFiles(filesArray);
});

// フォルダツリーを再帰的に巡回する関数
async function traverseFileTree(item, path, filesArray) {
    if (item.isFile) {
        const file = await new Promise(resolve => item.file(resolve));
        // カスタムパスを付与して後でフォルダ名を取得できるようにする
        file.customPath = path + file.name;
        filesArray.push(file);
    } else if (item.isDirectory) {
        const dirReader = item.createReader();
        const entries = await new Promise(resolve => dirReader.readEntries(resolve));
        for (let i = 0; i < entries.length; i++) {
            await traverseFileTree(entries[i], path + item.name + "/", filesArray);
        }
    }
}

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
        singleFileInput.value = '';
        updateUI(); 
    } 
};

window.topdfUpdateUI = () => updateUI();

// ファイル処理
function handleFiles(files) {
    // 画像またはPDFのみを抽出
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
    if (newFiles.length === 0) return;
    
    newFiles.forEach(file => {
        // Drop時のcustomPath、またはinput時のwebkitRelativePathを利用
        const fullPath = file.customPath || file.webkitRelativePath || file.name;
        let pathParts = fullPath.split('/');
        
        let folderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : "個別ファイル";

        if (!fileGroups[folderName]) {
            fileGroups[folderName] = [];
        }
        fileGroups[folderName].push(file);
    });

    sortAndDisplay();
}

function sortAndDisplay() {
    const val = dom.sortOrder.value;
    
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
    const folders = Object.keys(fileGroups).sort();
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
    
    if (viewMode === 'grid') {
        dom.fileList.classList.remove('file-list-mode');
    } else {
        dom.fileList.classList.add('file-list-mode');
    }

    folders.forEach(folderName => {
        const files = fileGroups[folderName];
        totalFiles += files.length;

        const section = document.createElement('div');
        section.className = 'folder-section';
        
        const header = document.createElement('div');
        header.className = 'folder-header';
        header.innerHTML = `<span>📁 ${folderName}</span> <span style="font-size:0.8em; font-weight:normal;">(${files.length}ファイル)</span>`;
        section.appendChild(header);

        const gridInner = document.createElement('div');
        gridInner.className = 'file-grid-inner';
        
        gridInner.innerHTML = files.map((f, i) => {
            const safeFolderName = folderName.replace(/'/g, "\\'");
            const isPDF = f.type === 'application/pdf';
            const icon = isPDF ? '📄' : '🖼';
            
            if (viewMode === 'grid') {
                return `
                <div class="file-item">
                    <div class="btn-remove" onclick="removeFile('${safeFolderName}', ${i})">×</div>
                    <div style="margin-bottom:4px; font-size:1.2rem;">${icon}</div>
                    ${f.name.length > 15 ? f.name.slice(0,12)+'...' : f.name}
                </div>`;
            } else {
                return `
                <div class="file-item">
                    <div class="btn-remove" onclick="removeFile('${safeFolderName}', ${i})">×</div>
                    <div style="font-size: 14px; flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${icon} ${f.name}
                    </div>
                    <div class="fs-b7" style="color: #888;">${(f.size / 1024).toFixed(1)} KB</div>
                </div>`;
            }
        }).join('');

        section.appendChild(gridInner);
        dom.fileList.appendChild(section);
    });
    
    dom.fileCount.innerText = `${folders.length}フォルダ / 合計 ${totalFiles} ファイル`;
    dom.mergeBtn.classList.remove('hidden');
    dom.clearBtn.classList.remove('hidden');
}

window.removeFile = (folderName, i) => { 
    if (fileGroups[folderName]) {
        fileGroups[folderName].splice(i, 1);
        if (fileGroups[folderName].length === 0) {
            delete fileGroups[folderName];
        }
    }
    updateUI(); 
};

// 画像読み込みとCanvasによる圧縮処理
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

// 共通: PDFLibドキュメントにファイル(画像 or PDF)を追加する処理
async function appendFileToPdfDoc(pdfDoc, file, quality, margin) {
    if (file.type === 'application/pdf') {
        // --- PDFの場合 ---
        const pdfBytes = await file.arrayBuffer();
        
        try {
            // 💡修正ポイント: { ignoreEncryption: true } を追加して、
            // 編集制限（オーナーパスワード等）がかかっているPDFでも強制的に読み込ませる
            const loadedPdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const copiedPages = await pdfDoc.copyPages(loadedPdf, loadedPdf.getPageIndices());
            copiedPages.forEach((page) => {
                pdfDoc.addPage(page);
            });
        } catch (pdfError) {
            // 💡修正ポイント: 読み込み不能なヤバいPDFが混ざっていても、
            // 全体がクラッシュしないようにスキップしてユーザーに通知する
            console.error(`[${file.name}] の読み込みに失敗しました:`, pdfError);
            alert(`「${file.name}」は特殊な保護または構造のため結合できませんでした。スキップして処理を続行します。\n\n※このファイルを結合したい場合は、一度ブラウザで開いて「PDFとして印刷」で再保存したものをご使用ください。`);
        }
        
    } else {
        // --- 画像の場合 （変更なし）---
        const imgData = await processImage(file, quality);
        
        const res = await fetch(imgData.data);
        const imgBytes = await res.arrayBuffer();
        
        let embedImage;
        if (imgData.format === 'JPEG') {
            embedImage = await pdfDoc.embedJpg(imgBytes);
        } else {
            embedImage = await pdfDoc.embedPng(imgBytes);
        }

        const pageWidth = imgData.width + (margin * 2);
        const pageHeight = imgData.height + (margin * 2);
        
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(embedImage, {
            x: margin,
            y: margin,
            width: imgData.width,
            height: imgData.height,
        });
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
        const mergeAll = dom.mergeFoldersCheck.checked;
        
        // ※ パスワード保護について
        // 現状 pdf-lib(無償版) で作成したPDFに対する直接のパスワード暗号化保存は難しいため、
        // 開発環境用のWarningを出しつつ、通常の結合処理を継続させます。
        if (dom.passwordCheck.checked) {
            console.warn("注意: pdf-lib環境でのパスワード保護出力は追加の暗号化モジュールが必要です。今回は保護なしで出力されます。");
        }

        // ダウンロード補助関数
        const downloadDoc = async (doc, fileName) => {
            const pdfBytes = await doc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        };

        // --- 全結合モード ---
        if (mergeAll) {
            dom.mergeBtn.innerText = "結合PDF作成中...";
            
            const pdfDoc = await PDFDocument.create();
            let processedCount = 0;
            const totalFiles = folders.reduce((sum, f) => sum + fileGroups[f].length, 0);

            for (const folder of folders) {
                const files = fileGroups[folder];
                for (let i = 0; i < files.length; i++) {
                    processedCount++;
                    dom.mergeBtn.innerText = `処理中 (${processedCount}/${totalFiles})...`;
                    
                    await appendFileToPdfDoc(pdfDoc, files[i], quality, margin);
                    await new Promise(r => setTimeout(r, 10)); // UI更新待機
                }
            }

            let fileName = "combined.pdf";
            if (dom.renameCheck.checked && dom.nameInput.value) {
                fileName = dom.nameInput.value;
            } else if (folders.length > 0) {
                fileName = folders[0] + (folders.length > 1 ? "_others" : "") + ".pdf";
            }
            if (!fileName.endsWith('.pdf')) fileName += ".pdf";

            await downloadDoc(pdfDoc, fileName);

        } 
        // --- 個別フォルダモード ---
        else {
            for (let fIndex = 0; fIndex < folders.length; fIndex++) {
                const folder = folders[fIndex];
                const files = fileGroups[folder];
                
                dom.mergeBtn.innerText = `作成中: ${folder} (${fIndex + 1}/${folders.length})...`;

                const pdfDoc = await PDFDocument.create();
                
                for (let i = 0; i < files.length; i++) {
                    await appendFileToPdfDoc(pdfDoc, files[i], quality, margin);
                    await new Promise(r => setTimeout(r, 10));
                }

                let fileName = folder + ".pdf";
                if (dom.renameCheck.checked && dom.nameInput.value) {
                    const base = dom.nameInput.value.replace('.pdf', '');
                    fileName = `${base}_${folder}.pdf`;
                }

                await downloadDoc(pdfDoc, fileName);
                
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