export default function disableCopyPaste() {
    document.onkeydown = disableSelectCopy;
    document.addEventListener('contextmenu', event => event.preventDefault());

    function disableSelectCopy(e) {
        var pressedKey = String.fromCharCode(e.keyCode).toLowerCase();
        if ((e.ctrlKey && (pressedKey === "c" || pressedKey === "x" || pressedKey === "v" || pressedKey === "a" || pressedKey === "u")) ||  e.keyCode === 123) {
            return false;
        }
    }
}