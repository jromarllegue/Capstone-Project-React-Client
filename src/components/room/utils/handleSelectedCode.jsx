export default function handleSelectedCode(e, editorRef, setContextMenu) {
  const state = editorRef.current?.state;
  const from = state.selection.main.from;
  const to = state.selection.main.to;
  const selection = state?.sliceDoc(from, to);
  
  if (selection) {
    // Get line numbers
    const fromLine = state.doc.lineAt(from).number;
    const toLine = state.doc.lineAt(to).number;
    
    // Get complete lines content
    const fromLineStart = state.doc.line(fromLine).from;
    const toLineEnd = state.doc.line(toLine).to;
    const fullLinesSelection = state.sliceDoc(fromLineStart, toLineEnd);

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      selection,
      fullLinesSelection,
      fromLine,
      toLine
    });
  }
}