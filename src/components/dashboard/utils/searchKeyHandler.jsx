export function keySelectors(e, filtered, selectedIndex, setSelectedIndex, addFunction) {
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex(prev => prev < filtered.length - 1 ? prev + 1 : prev);
            break;
        case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
            break;
        case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && filtered[selectedIndex]) {
                addFunction(filtered[selectedIndex]);
            }
            break;
        default:
            setSelectedIndex(-1);
    }
}


export function scrollIntoView(selected, container) {
    selected = document.querySelector(selected);
    container = document.querySelector(container);
    
    if (selected && container) {
        selected.scrollIntoView({ 
            block: 'nearest',
            inline: 'nearest'
        });
    }
}