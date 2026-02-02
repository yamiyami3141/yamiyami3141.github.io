


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
        compression: document.getElementById('compression-level')
    };

    let selectedFiles = [];

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
            selectedFiles = []; 
            // fileInputをリセットしないと同じファイルを再選択できないため
            dom.fileInput.value = '';
            updateUI(); 
        } 
    };

    // ファイル処理
    function handleFiles(files) {
        const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (newFiles.length === 0) return;
        
        selectedFiles = [...selectedFiles, ...newFiles];
        sortAndDisplay();
    }

    function sortAndDisplay() {
        const val = dom.sortOrder.value;
        selectedFiles.sort((a, b) => {
            if (val === 'name-asc') return a.name.localeCompare(b.name, undefined, {numeric: true});
            if (val === 'name-desc') return b.name.localeCompare(a.name, undefined, {numeric: true});
            return b.lastModified - a.lastModified;
        });
        updateUI();
    }

    function updateUI() {
        if (selectedFiles.length === 0) {
            dom.fileList.innerHTML = '';
            dom.fileCount.innerText = '画像未選択';
            dom.mergeBtn.classList.add('hidden');
            dom.clearBtn.classList.add('hidden');
            return;
        }

        dom.fileList.innerHTML = selectedFiles.map((f, i) => `
            <div class="file-item">
                <div class="btn-remove" onclick="removeFile(${i})">×</div>
                <div style="margin-bottom:4px;">🖼img</div>
                ${f.name.length > 15 ? f.name.slice(0,12)+'...' : f.name}
            </div>
        `).join('');
        
        dom.fileCount.innerText = `${selectedFiles.length} 枚選択中`;
        dom.mergeBtn.classList.remove('hidden');
        dom.clearBtn.classList.remove('hidden');
    }

    window.removeFile = (i) => { 
        selectedFiles.splice(i, 1); 
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

    // PDF生成処理
    dom.mergeBtn.onclick = async () => {
        if (selectedFiles.length === 0) return;

        const originalText = dom.mergeBtn.innerText;
        dom.mergeBtn.disabled = true;
        dom.mergeBtn.innerText = "処理中 (0/" + selectedFiles.length + ")...";

        try {
            const quality = parseFloat(dom.compression.value);
            const margin = parseInt(dom.margin.value);
            const usePassword = dom.passwordCheck.checked;
            const password = dom.passwordInput.value;

            let doc = null;

            for (let i = 0; i < selectedFiles.length; i++) {
                dom.mergeBtn.innerText = `処理中 (${i + 1}/${selectedFiles.length})...`;
                
                // 画像処理
                const imgData = await processImage(selectedFiles[i], quality);
                
                // ページサイズ計算
                const pageWidth = imgData.width + (margin * 2);
                const pageHeight = imgData.height + (margin * 2);
                const orient = pageWidth > pageHeight ? 'l' : 'p';

                if (i === 0) {
                    // 1枚目：ドキュメント作成
                    doc = new jsPDF({ 
                        orientation: orient, 
                        unit: 'px', 
                        format: [pageWidth, pageHeight],
                        compress: true 
                    });
                    
                    // パスワード設定（機能がある場合のみ）
                    if (usePassword && password) {
                        if (typeof doc.setEncryption === 'function') {
                            doc.setEncryption(
                                password, password, 
                                ["print", "copy", "modify", "annot-forms"], 
                                "AES_128"
                            );
                        } else {
                            console.warn("暗号化モジュールがロードされていません。");
                            /*alert("パスワード機能は現在の環境で利用できません。通常保存します。");*/
                            alert("パスワード機能は現在仮実装のため利用できません。通常保存します。");
                        }
                    }
                } else {
                    // 2枚目以降：新しいページを追加 (ここが重要！)
                    doc.addPage([pageWidth, pageHeight], orient);
                }
                
                // 画像追加
                doc.addImage(
                    imgData.data, 
                    imgData.format, 
                    margin, 
                    margin, 
                    imgData.width, 
                    imgData.height
                );
                
                await new Promise(r => setTimeout(r, 10));
            }

            const baseName = (dom.renameCheck.checked && dom.nameInput.value) ? dom.nameInput.value : "kotori_collection";
            const fileName = baseName.endsWith('.pdf') ? baseName : baseName + ".pdf";
            
            doc.save(fileName);
            alert("完了しました！");

        } catch (err) {
            console.error(err);
            alert("エラーが発生しました: " + err.message);
        } finally {
            dom.mergeBtn.disabled = false;
            dom.mergeBtn.innerText = originalText;
        }
    };