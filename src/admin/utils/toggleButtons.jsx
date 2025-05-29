export function toggleOne(clicked) {
    const btns = document.querySelectorAll('.selected-btn');
    const clicked_btn = document.querySelector(`.select-${clicked}`);

    if (btns && clicked_btn) {
        btns.forEach(btn => btn.classList.add('inactive'));
        clicked_btn.classList.remove('inactive');
    }
}

export function untoggleAll() {
    const btns = document.querySelectorAll('.selected-btn');
    if (btns) {
        btns.forEach(btn => btn.classList.remove('inactive'));
    }
}