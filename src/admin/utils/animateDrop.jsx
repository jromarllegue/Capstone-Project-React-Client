export default function animateDrop () {
    setTimeout(() => {
        const buttons = document.querySelector('#admin-table-buttons');
        window.scrollTo({ top: buttons?.scrollHeight + 600 , behavior: 'smooth' });
    }, 300);
}