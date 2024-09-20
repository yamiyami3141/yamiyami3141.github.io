class Slideshow {
    constructor(id) {
        this.id = id;
        this.slideIndex = 0;
        this.slideshowElement = document.getElementById(id);
        this.slides = this.slideshowElement.getElementsByClassName("slide");
        this.dots = this.slideshowElement.nextElementSibling.getElementsByClassName("dot");
        this.slideInterval = null;
        this.slideDuration = 5000;
        this.isHovered = false;
        this.isPaused = false;

        this.initializeSlideshow();
        this.lastInteractionTime = Date.now();
    }

    initializeSlideshow() {
        this.showSlides();
        this.startSlideShow();
        this.addEventListeners();
    }

    showSlides() {
        for (let i = 0; i < this.slides.length; i++) {
            this.slides[i].classList.remove("active");
            this.dots[i].classList.remove("active");
        }
        
        this.slides[this.slideIndex].classList.add("active");
        this.dots[this.slideIndex].classList.add("active");
    }

    startSlideShow() {
        this.stopSlideShow();
        if (!this.isHovered && !this.isPaused) {
            const currentTime = Date.now();
            const timeSinceLastInteraction = currentTime - this.lastInteractionTime;
            const remainingTime = Math.max(0, this.slideDuration - timeSinceLastInteraction);

            this.slideInterval = setTimeout(() => {
                this.slideIndex = (this.slideIndex + 1) % this.slides.length;
                this.showSlides();
                this.startSlideShow();
            }, this.slideDuration);
        }
    }

    stopSlideShow() {
        if (this.slideInterval) {
            clearTimeout(this.slideInterval);
            this.slideInterval = null;
        }
    }

    changeSlide(n) {
        this.stopSlideShow();
        this.slideIndex = (this.slideIndex + n + this.slides.length) % this.slides.length;
        this.showSlides();
        this.isPaused = false;
        this.lastInteractionTime = Date.now();
        this.startSlideShow();
    }

    currentSlide(n) {
        this.stopSlideShow();
        this.slideIndex = n - 1;
        this.showSlides();
        this.isPaused = false;
        this.lastInteractionTime = Date.now();
        this.startSlideShow();
    }

    addEventListeners() {
        this.slideshowElement.addEventListener('mouseenter', () => {
            this.isHovered = true;
            this.stopSlideShow();
        });

        this.slideshowElement.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.isPaused = false;
            this.startSlideShow();
        });

        // スライドのクリックイベントを追加
        Array.from(this.slides).forEach(slide => {
            slide.addEventListener('click', (e) => {
                // デフォルトのリンク動作を防止
                e.preventDefault();
                // クリックされたリンクのhref属性を取得
                const href = slide.getAttribute('href');
                // 新しいタブでリンクを開く
                if (href) {
                    window.open(href, '_blank');
                }
            });
        });

        // クリック操作後の自動再生を制御するためのイベントリスナー
        const prevButton = this.slideshowElement.querySelector('.prev');
        const nextButton = this.slideshowElement.querySelector('.next');
        const dotContainer = this.slideshowElement.nextElementSibling;

        [prevButton, nextButton, dotContainer].forEach(element => {
            element.addEventListener('click', () => {
                this.isPaused = false;
                this.startSlideShow();
            });
        });
    }

    static changeSlide(n, id) {
        const slideshow = Slideshow.instances.find(s => s.id === id);
        if (slideshow) {
            slideshow.changeSlide(n);
            Slideshow.resetAllSlideshows(id);
        }
    }

    static currentSlide(n, id) {
        const slideshow = Slideshow.instances.find(s => s.id === id);
        if (slideshow) {
            slideshow.currentSlide(n);
            Slideshow.resetAllSlideshows(id);
        }
    }

    static resetAllSlideshows(exceptId) {
        Slideshow.instances.forEach(slideshow => {
            if (slideshow.id !== exceptId) {
                slideshow.stopSlideShow();
                slideshow.lastInteractionTime = Date.now();
                slideshow.startSlideShow();
            }
        });
    }
}

// スライドショーのインスタンスを格納する配列
const slideshows = [];

// スライドショーの初期化
document.addEventListener('DOMContentLoaded', () => {
    // すべてのスライドショーを初期化
    document.querySelectorAll('.slideshow-container').forEach(container => {
        slideshows.push(new Slideshow(container.id));
    });

    // グローバル関数として定義（HTML内のonclick属性から呼び出すため）
    window.changeSlide = (n, id) => {
        const slideshow = slideshows.find(s => s.id === id);
        if (slideshow) slideshow.changeSlide(n);
    };

    window.currentSlide = (n, id) => {
        const slideshow = slideshows.find(s => s.id === id);
        if (slideshow) slideshow.currentSlide(n);
    };
});