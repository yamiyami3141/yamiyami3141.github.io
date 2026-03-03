import { GoogleGenerativeAI } from "@google/generative-ai";

window.chatApp = () => {
    return {
        userInput: '',
        loading: false,
        showSettings: false,
        authenticated: false,
        passAttempt: '',
        masterPass: 'admin', // 初期パスワード
        attachedFiles: [],
        currentChatId: null,
        chatHistory: [], // {id, title, messages, systemInstruction}
        config: {
            apiKey: '',
            model: 'gemini-2.0-flash-lite-preview-02-05',
            systemInstruction: 'あなたは小鳥Labの優秀な研究助手です。和やかで丁寧な日本語で回答してください。'
        },

        init() {
            // ローカルストレージから復元
            const saved = localStorage.getItem('kotori_chat_history');
            if (saved) this.chatHistory = JSON.parse(saved);
            
            const savedConfig = localStorage.getItem('kotori_chat_config');
            if (savedConfig) this.config = { ...this.config, ...JSON.parse(savedConfig) };

            if (this.chatHistory.length > 0) {
                this.loadChat(this.chatHistory[0].id);
            } else {
                this.createNewChat();
            }
            
            this.$nextTick(() => {
                lucide.createIcons();
                new SakuraAnimation(document.querySelector('.animation-canvas'));
            });
        },

        get currentMessages() {
            const chat = this.chatHistory.find(c => c.id === this.currentChatId);
            return chat ? chat.messages : [];
        },

        createNewChat() {
            const id = Date.now().toString();
            const newChat = {
                id: id,
                title: '新しい会話 ' + (this.chatHistory.length + 1),
                messages: [],
                systemInstruction: this.config.systemInstruction
            };
            this.chatHistory.unshift(newChat);
            this.currentChatId = id;
            this.saveToLocal();
        },

        loadChat(id) {
            this.currentChatId = id;
            this.scrollToBottom();
        },

        deleteChat(id) {
            this.chatHistory = this.chatHistory.filter(c => c.id !== id);
            if (this.currentChatId === id) {
                if (this.chatHistory.length > 0) this.loadChat(this.chatHistory[0].id);
                else this.createNewChat();
            }
            this.saveToLocal();
        },

        async handleFileUpload(e) {
            const files = Array.from(e.target.files);
            for (const file of files) {
                const base64 = await this.toBase64(file);
                this.attachedFiles.push({
                    name: file.name,
                    mimeType: file.type,
                    data: base64.split(',')[1]
                });
            }
        },

        toBase64: file => new Promise((res, rej) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => res(reader.result);
            reader.onerror = rej;
        }),

        async send() {
            if (!this.config.apiKey) {
                alert("先に設定からAPI Keyを入力してください");
                this.showSettings = true;
                return;
            }

            const chat = this.chatHistory.find(c => c.id === this.currentChatId);
            const text = this.userInput.trim();
            const parts = [{ text }];
            
            // ファイル添付がある場合
            this.attachedFiles.forEach(f => {
                parts.push({ inlineData: { mimeType: f.mimeType, data: f.data } });
            });

            chat.messages.push({ role: 'user', content: text });
            this.userInput = '';
            this.loading = true;
            this.scrollToBottom();

            try {
                const genAI = new GoogleGenerativeAI(this.config.apiKey);
                const model = genAI.getGenerativeModel({ 
                    model: this.config.model,
                    systemInstruction: chat.systemInstruction 
                });

                // 履歴をGemini形式に変換
                const history = chat.messages.slice(0, -1).map(m => ({
                    role: m.role,
                    parts: [{ text: m.content }]
                }));

                const result = await model.generateContent({
                    contents: [...history, { role: 'user', parts }]
                });

                const responseText = result.response.text();
                chat.messages.push({ role: 'model', content: responseText });
                
                // タイトルの自動生成（初回のみ）
                if (chat.messages.length === 2) {
                    chat.title = text.substring(0, 15);
                }

            } catch (err) {
                chat.messages.push({ role: 'model', content: "⚠️ エラー: " + err.message });
            } finally {
                this.loading = false;
                this.attachedFiles = [];
                this.saveToLocal();
                this.scrollToBottom();
            }
        },

        saveToLocal() {
            localStorage.setItem('kotori_chat_history', JSON.stringify(this.chatHistory));
            localStorage.setItem('kotori_chat_config', JSON.stringify(this.config));
        },

        renderMarkdown(text) {
            return marked.parse(text.replace(/```/g, '\n```'));
        },

        copyToClipboard(text) {
            navigator.clipboard.writeText(text);
            alert("コピーしました");
        },

        exportChat() {
            const data = JSON.stringify(this.chatHistory.find(c => c.id === this.currentChatId));
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat_export_${Date.now()}.json`;
            a.click();
        },

        importChat(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                const imported = JSON.parse(ev.target.result);
                imported.id = Date.now().toString(); // ID重複防止
                this.chatHistory.unshift(imported);
                this.loadChat(imported.id);
                this.saveToLocal();
            };
            reader.readAsText(file);
        },

        verifyPassword() {
            if (this.passAttempt === this.masterPass) {
                this.authenticated = true;
            } else {
                alert("パスワードが違います");
            }
        },

        saveSettings() {
            this.saveToLocal();
            this.showSettings = false;
            alert("設定を保存しました");
        },

        scrollToBottom() {
            setTimeout(() => {
                const el = document.getElementById('message-list');
                el.scrollTop = el.scrollHeight;
                lucide.createIcons();
            }, 100);
        }
    }
}

// 桜アニメーションクラス (form-sakura.htmlより継承)
class SakuraAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.petals = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
        this.animate();
    }
    resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
    init() {
        for (let i = 0; i < 50; i++) {
            this.petals.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 5 + 5,
                speed: Math.random() * 0.5 + 0.2,
                angle: Math.random() * 360,
                flip: Math.random() * Math.PI,
                flipSpeed: Math.random() * 0.03
            });
        }
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.petals.forEach(p => {
            p.y += p.speed;
            p.flip += p.flipSpeed;
            if (p.y > this.canvas.height) p.y = -10;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle);
            this.ctx.scale(Math.cos(p.flip), 1);
            this.ctx.fillStyle = '#ffebee';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        requestAnimationFrame(() => this.animate());
    }
}