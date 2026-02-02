// PDF.jsのワーカー設定
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const dom = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileList: document.getElementById('file-list'),
    fileCount: document.getElementById('file-count'),
    clearBtn: document.getElementById('clear-btn'),
    convertBtn: document.getElementById('convert-btn'),
    renameCheck: document.getElementById('rename-check'),
    nameInput: document.getElementById('custom-filename'),
    formatSelect: document.getElementById('format-select'),
    qualitySelect: document.getElementById('quality-select'),
    scaleSelect: document.getElementById('scale-select'),
    grayscaleCheck: document.getElementById('grayscale-check'),
    progressContainer: document.getElementById('progress-container'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text')
};

let selectedFiles = [];

dom.dropZone.onclick = () => dom.fileInput.click();
dom.fileInput.onchange = (e) => {
    const pdfs = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    selectedFiles = [...selectedFiles, ...pdfs];
    updateUI();
};

dom.renameCheck.onchange = (e) => dom.nameInput.classList.toggle('hidden', !e.target.checked);
dom.clearBtn.onclick = () => { selectedFiles = []; dom.fileInput.value = ''; updateUI(); };

function updateUI() {
    const hasFiles = selectedFiles.length > 0;
    dom.convertBtn.classList.toggle('hidden', !hasFiles);
    dom.clearBtn.classList.toggle('hidden', !hasFiles);
    dom.fileCount.innerText = hasFiles ? `${selectedFiles.length} 件選択中` : 'PDF未選択';

    const viewMode = document.querySelector('input[name="view-mode"]:checked').value;
    dom.fileList.className = viewMode === 'grid' ? 'file-grid' : 'file-list-mode';

    dom.fileList.innerHTML = selectedFiles.map((f, i) => `
        <div class="file-item">
            <div class="btn-remove" onclick="removeFile(${i})">×</div>
            ${viewMode === 'grid' ? '<div style="font-size:20px;margin-bottom:4px;">📄</div>' : '📄 '}
            <span title="${f.name}" style="display:inline-block; max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${f.name}
            </span>
        </div>
    `).join('');
}

window.removeFile = (i) => { selectedFiles.splice(i, 1); updateUI(); };

dom.convertBtn.onclick = async () => {
    dom.convertBtn.disabled = true;
    dom.progressContainer.style.display = 'block';
    
    const zip = new JSZip();
    const format = dom.formatSelect.value;
    const quality = parseFloat(dom.qualitySelect.value);
    const scale = parseFloat(dom.scaleSelect.value);
    const isGrayscale = dom.grayscaleCheck.checked;
    const ext = format.split('/')[1].replace('jpeg', 'jpg');

    try {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            // ここを pdfjsLib.getDocument に修正
            const loadingTask = pdfjsLib.getDocument(await file.arrayBuffer());
            const pdfDoc = await loadingTask.promise;
            
            let baseName = (dom.renameCheck.checked && dom.nameInput.value.trim()) 
                        ? (selectedFiles.length > 1 ? `${dom.nameInput.value.trim()}_${i+1}` : dom.nameInput.value.trim())
                        : file.name.replace(/\.[^/.]+$/, "");
            
            const folder = zip.folder(baseName);

            for (let p = 1; p <= pdfDoc.numPages; p++) {
                const totalProgress = Math.round(((i / selectedFiles.length) + (p / pdfDoc.numPages / selectedFiles.length)) * 100);
                dom.progressFill.style.width = `${totalProgress}%`;
                dom.progressText.innerText = `${file.name} (${p}/${pdfDoc.numPages}) を処理中...`;

                const page = await pdfDoc.getPage(p);
                const viewport = page.getViewport({ scale: scale });
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // レンダリング
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                // モノクロ処理
                if (isGrayscale) {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    for (let j = 0; j < data.length; j += 4) {
                        const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
                        data[j] = avg;     // R
                        data[j + 1] = avg; // G
                        data[j + 2] = avg; // B
                    }
                    ctx.putImageData(imageData, 0, 0);
                }

                const blob = await new Promise(res => canvas.toBlob(res, format, quality));
                folder.file(`${baseName}_${String(p).padStart(3, '0')}.${ext}`, blob);
                
                canvas.width = 0; canvas.height = 0;
            }
        }

        dom.progressText.innerText = "ZIPを作成中...";
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = (dom.renameCheck.checked && dom.nameInput.value ? dom.nameInput.value : "converted_images") + ".zip";
        link.click();
        dom.progressText.innerText = "ダウンロード完了！";
    } catch (e) {
        console.error(e);
        alert("エラーが発生しました: " + e.message);
    } finally {
        dom.convertBtn.disabled = false;
        setTimeout(() => { dom.progressContainer.style.display = 'none'; }, 3000);
    }
};