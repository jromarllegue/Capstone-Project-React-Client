import { EditorState } from '@codemirror/state'
import { EditorView } from 'codemirror'
import { linter } from '@codemirror/lint' 
import { javascript } from '@codemirror/lang-javascript'
import { html, htmlLanguage } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { html5Snippet, jquerySnippet, bootstrapSnippet } from './codeSnippets';
import jsLint from './JSesLint'
import { oneDark } from '@codemirror/theme-one-dark'
import { clouds } from 'thememirror'

export function changeTheme (editorRef, editorTheme, themeCompartmentRef) {
    if (editorRef.current) {
        const theme = editorTheme === 'dark' ? oneDark : clouds;
        editorRef.current.dispatch({
          effects: themeCompartmentRef.current.reconfigure([theme])
        });
    }  
}

export function editorType(type) {
    if (type === 'html') {
        return [html(), htmlLanguage.data.of({ autocomplete: [html5Snippet, jquerySnippet, bootstrapSnippet ] }),];
    } else if (type === 'css') {
        return css();
    } else {
        return [javascript(), linter(jsLint)];
    }
}

export function editorAccess(position, activityOpen) {
    return EditorState.readOnly.of(position === 'Student' ? !activityOpen : true);
}

export const editorStyle = EditorView.theme({
    '.cm-ySelectionInfo': {
        top: '-6px !important',
        display: 'inline-block !important',
        opacity: '1 !important',
        padding: '2px !important',
        transition: 'none !important'
    },
    '.cm-line': {
        position: 'relative'
    }
});