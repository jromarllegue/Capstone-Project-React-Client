export function nonEditingKey(e) {
    const isModifierKey = e.altKey || e.ctrlKey || e.metaKey;
    const isNavigationKey = e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End' || e.key === 'PageUp' || e.key === 'PageDown';
    const isFunctionKey = e.key.startsWith('F') && e.key.length > 1;
    
    return isModifierKey || isNavigationKey || isFunctionKey;
}

export function editingKey(key) {
    return key === 'Backspace' || key === 'Delete' || key === 'Tab' || key === 'Enter';
}

export function unknownKey(key) {
    return String(key) === 'Unidentified';
}
  