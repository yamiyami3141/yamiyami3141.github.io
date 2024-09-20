document.addEventListener('DOMContentLoaded', () => {
    const leftSidebar = document.querySelector('.left-sidebar');
    const content = document.querySelector('.content');
    const leftToggle = document.getElementById('left-toggle');

    function toggleSidebar(sidebar, toggle) {
        sidebar.classList.toggle('open');
        toggle.classList.toggle('sidebar-open');
        adjustContentMargin();
    }

    function adjustContentMargin() {
        const leftOpen = leftSidebar.classList.contains('open');

        if (window.innerWidth > 8000) {
            content.style.marginLeft = leftOpen ? 'var(--sidebar-width)' : '0';
        } else {
            content.style.marginLeft = '0';
        }
    }

    leftToggle.addEventListener('click', () => toggleSidebar(leftSidebar, leftToggle));

    // 画面外クリックでサイドバーを閉じる
    document.addEventListener('click', (e) => {
        if (!leftSidebar.contains(e.target) && !leftToggle.contains(e.target)) {
            leftSidebar.classList.remove('open');
            leftToggle.classList.remove('sidebar-open');
        }
        adjustContentMargin();
    });

    // ウィンドウのリサイズ時にサイドバーの状態を調整
    window.addEventListener('resize', adjustContentMargin);

    // 初期状態の設定
    adjustContentMargin();
});