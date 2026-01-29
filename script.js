document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('menuOpenBtn');
    const closeBtn = document.getElementById('menuCloseBtn');
    const menu = document.getElementById('mobileMenu');

    // メニューを切り替える関数
    const toggleMenu = (show) => {
        if (show) {
            menu.classList.add('open');
            // メニュー展開時に背後のコンテンツをスクロールさせない
            document.body.style.overflow = 'hidden';
        } else {
            menu.classList.remove('open');
            // メニューを閉じたらスクロールを許可する
            document.body.style.overflow = '';
        }
    };

    // 開くボタンのクリックイベント
    openBtn.addEventListener('click', () => toggleMenu(true));

    // 閉じるボタンのクリックイベント
    closeBtn.addEventListener('click', () => toggleMenu(false));

    // エスケープキーでも閉じられるようにする（アクセシビリティ対応）
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.classList.contains('open')) {
            toggleMenu(false);
        }
    });
});