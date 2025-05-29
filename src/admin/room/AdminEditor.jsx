import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import { BsCheck2, BsExclamationTriangleFill } from 'react-icons/bs';
import * as Y from 'yjs'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { linter, lintGutter } from '@codemirror/lint' 
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { clouds } from 'thememirror'
import jsLint from '../../components/room/utils/JSesLint'
import { changeTheme } from '../../components/room/utils/editorExtensions';
import { nonEditingKey, editingKey, unknownKey } from '../../components/room/utils/keyHandler';
import _ from 'lodash'

function Editor({ cursorColor, file, socket, setSaved, editorTheme, warning, setWarning}) {
  const { room_id } = useParams();
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const themeCompartmentRef = useRef(new Compartment());
  
  const editorListener = (event) => {
    try {
      //Ctrl + S to save the code
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (editorRef.current) {
          updateCode(editorRef.current);
        }
        return;
      }    

      if (!nonEditingKey(event) && (event.key.length === 1 || editingKey(event.key) || unknownKey(event.key))) {
        updateAwareness(editorRef.current?.state?.doc?.lineAt(editorRef.current?.state?.selection?.main?.head)?.number || 1);

        warning !== 0 ? setWarning(0) : null;
        debounceUserType();
      } 
    } catch (e) {
      console.error(e);
    }
  };

  const debounceUserType = _.debounce(() => {
    if (editorRef.current) {
      updateCode(editorRef.current);
    }
  }, 200);

  const updateAwareness = (new_line) => {
    if (!providerRef.current || !editorRef.current) {
      return;
    }

    try {
      providerRef.current.awareness.setLocalStateField('user', {
        ...providerRef.current.awareness.getLocalState().user,
        line: new_line,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    editorRef.current ? editorRef.current.destroy() : null;
    providerRef.current ? providerRef.current.destroy() : null;
    
    if (file === null) {
      return;
    }

    try {
      async function init() {
        const ydoc = new Y.Doc();
        
        providerRef.current = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
          `${file.file_id}`, 
          ydoc
        );
        
        providerRef.current.awareness.setLocalStateField('user', {
          userId: 'user_admin',
          name: 'PnCode Admin',
          color: cursorColor.color,
          light: cursorColor.light,
          line: 0,
          position: 'Admin',
        });
      
        const type = () => {
          if      (file.name.endsWith('.html')) return html(); 
          else if (file.name.endsWith('.css'))  return css();
          else if (file.name.endsWith('.js'))   return [javascript(), linter(jsLint)]; 
        }
        const theme = editorTheme === 'dark' ? oneDark : clouds;
        
        providerRef.current.on('synced', () => {
          const users_length = Array.from(providerRef.current.awareness.getStates().values()).length;

          const ytext = ydoc.getText('codemirror');
          let initialContent = ytext.toString();
          if (((initialContent === '' || initialContent === null) && users_length === 1)) {
            ydoc.transact(() => {
              ytext.insert(0, file.content);
            });
            initialContent = file.content;
          }
          
          const state = EditorState.create({
            doc: initialContent,
            extensions: [
              keymap.of([...yUndoManagerKeymap, indentWithTab]),
              type(),
              basicSetup,
              themeCompartmentRef.current.of([theme]),
              yCollab(ytext, providerRef.current.awareness),
              lintGutter(),
              EditorView.lineWrapping,
              EditorView.theme({
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
              }),
            ]
          });
          
          const editor_div = document.getElementById('editor-div');
          editor_div.innerHTML = '';
          
          editorRef.current = new EditorView({ state, parent: (editor_div) });
          editor_div.addEventListener('keydown', editorListener);

          providerRef.current.awareness.on('change', () => {  
            updateAwareness(editorRef.current?.state?.doc?.lineAt(editorRef.current?.state?.selection?.main?.head)?.number || 1);
          });

          setSaved(<label id='saving'>Successfully connected.</label>);
        });

        providerRef.current.on('connection-close', () => {
          console.warn('YJS Connection Closed.');
          providerRef.current.connect();
        });

        providerRef.current.on('connection-error', (error) => {
          console.error('YJS Connection Error:', error);
          setWarning(5);
        });
      };
      init();

    } catch (e) {
      alert('Connection to Websocket has failed. Please refresh the page.');
    }
      
    socket.emit('join_editor', {
      room_id,
      file_id: file.file_id,
      user_id: 'user_admin',
    });

    socket.on('update_result', ({ status }) => {
      if (status === 'ok') {
        setSaved( <label className='items-center' id='saved'>
                      <BsCheck2 size={14}/><span>Saved</span>
                  </label>
                );
      } else {
        setSaved( <label className='items-center' id='unsaved'>
                    <BsExclamationTriangleFill size={13}/><span>Unsaved</span>
                  </label>
                );
      }
    });
    
    return () => {
      socket.off('update_result');

      if (file) {
        socket.emit('leave_editor', {file_id: file?.file_id })
      }

      document.getElementById('editor-div')?.removeEventListener('keydown', editorListener);
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
    }
  }, [file]);

  useEffect(() => {
    changeTheme(editorRef, editorTheme, themeCompartmentRef);
  }, [editorTheme]);
    
  function updateCode (e) {
    let isEmpty = e.state.doc.toString() === '' && e.state.doc === null;
    let allSpaces = new RegExp('^\\s*$').test(e.state.doc.toString());

    if (e.state.doc && !isEmpty && !allSpaces) {
      setSaved( <label id='saving'>Saving...</label>);

      socket.emit('update_code_admin', {
        file_id: file.file_id,
        code: e.state.doc.toString()
      });

      setWarning(0);
    } else if ( isEmpty || allSpaces) {
      setWarning(1);
    }
  }
  
  return (
    <>
      <div id='editor-div'>
      </div>
    </>
  )
}

export default React.memo(Editor);