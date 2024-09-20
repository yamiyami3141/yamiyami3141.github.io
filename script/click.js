document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + 'px';
        header.querySelector('.toggle-icon').textContent = content.style.maxHeight ? '-' : '+';
    });
});