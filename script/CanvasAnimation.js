class CanvasAnimation {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.elements = [];
        this.presets = {
            o: this.presetO.bind(this),
            x: this.presetX.bind(this)
        };

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
        this.initializeElements();
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.initializeElements(); // キャンバスサイズ変更時に要素を再初期化
    }

    presetO(x, y, s, dx, dy) {
        return {
            x: x,
            y: y,
            r: 12 * s,
            w: 5 * s,
            dx: dx,
            dy: dy,
            draw: function(ctx, t) {
                this.x += this.dx;
                this.y += this.dy;
                
                ctx.beginPath();
                ctx.arc(this.x + Math.sin((50 + x + (t / 10)) / 100) * 3, 
                        this.y + Math.sin((45 + x + (t / 10)) / 100) * 4, 
                        this.r, 0, 2 * Math.PI, false);
                ctx.lineWidth = this.w;
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            }
        };
    }

    presetX(x, y, s, dx, dy, dr, r = 0) {
        return {
            x: x,
            y: y,
            s: 20 * s,
            w: 5 * s,
            r: r,
            dx: dx,
            dy: dy,
            dr: dr,
            draw: function(ctx, t) {
                this.x += this.dx;
                this.y += this.dy;
                this.r += this.dr;
                
                const line = (x, y, tx, ty, c, o = 0) => {
                    ctx.beginPath();
                    ctx.moveTo(-o + ((this.s / 2) * x), o + ((this.s / 2) * y));
                    ctx.lineTo(-o + ((this.s / 2) * tx), o + ((this.s / 2) * ty));
                    ctx.lineWidth = this.w;
                    ctx.strokeStyle = c;
                    ctx.stroke();
                };
                
                ctx.save();
                ctx.translate(this.x + Math.sin((x + (t / 10)) / 100) * 5, 
                              this.y + Math.sin((10 + x + (t / 10)) / 100) * 2);
                ctx.rotate(this.r * Math.PI / 180);
                
                line(-1, -1, 1, 1, '#fff');
                line(1, -1, -1, 1, '#fff');
                
                ctx.restore();
            }
        };
    }

    initializeElements() {
        this.elements = []; // 要素をリセット
        for (let x = 0; x < this.canvas.width; x++) {
            for (let y = 0; y < this.canvas.height; y++) {
                if (Math.round(Math.random() * 8000) == 1) {
                    const s = ((Math.random() * 5) + 1) / 10;
                    if (Math.round(Math.random()) == 1) {
                        this.elements.push(this.presets.o(x, y, s, 0, 0));
                    } else {
                        this.elements.push(this.presets.x(x, y, s, 0, 0, 
                            ((Math.random() * 3) - 1) / 10, (Math.random() * 360)));
                    }
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const time = new Date().getTime();
        for (const element of this.elements) {
            element.draw(this.ctx, time);
        }

        requestAnimationFrame(() => this.animate());
    }
}

// 使用例
document.addEventListener('DOMContentLoaded', () => {
    const canvases = document.querySelectorAll('.animation-canvas');
    canvases.forEach(canvas => new CanvasAnimation(canvas));
});