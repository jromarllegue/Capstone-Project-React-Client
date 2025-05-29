export function noText(doc) {
    return (doc === '' && doc === null) || new RegExp('^\\s*$').test(doc);
} 
export function editedLine(editor, key) {
    const line = editor.state.doc.lineAt(editor.state.selection.main.head).number;
    return key !== 'Enter' ? line : line - 1;
}

export function editedLineText(line, code, key) {
    try {
        const text = code.line(line)?.text;
        return key !== false ? text : null;
    } catch (e) { 
        return null;
    }
}