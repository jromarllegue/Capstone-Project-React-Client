export function positionChat() {
    const chatBox = document.getElementById('chat-box-container');
    if (chatBox) {
        chatBox.classList.toggle('left');
    }
} 
export function minimizeChat() {
    const chatBox = document.getElementById('chat-box-container');
    if (chatBox) {
        chatBox.classList.toggle('hidden');
    }
}