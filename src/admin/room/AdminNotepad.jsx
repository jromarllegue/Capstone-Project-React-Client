import React, { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import { EditorView } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import _ from 'lodash'
import notepadListener from '../../components/room/utils/notepadListener'

function Notepad({room, socket, cursorColor}) {
    const notepadRef = useRef(null);
    const providerRef = useRef(null);

    useEffect(() => {
        try {
            notepadRef.current ? notepadRef.current?.destroy() : null;
            providerRef.current ? providerRef.current?.destroy() : null;

            if (cursorColor) {
                async function init() {  
                    return new Promise((resolve) => {
                        socket.emit('load_notepad', {
                            room_id: room.room_id,
                        });
                    
                        socket.on('notepad_loaded', ({ notes }) => {
                            resolve(notes);
                        });
                    });
                }
                init().then((notes) => {
                    const ydoc = new Y.Doc();
                    
                    providerRef.current = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
                        `${room.room_id}-notepad`, 
                        ydoc
                    );
                    
                    providerRef.current.awareness.setLocalStateField('user', {
                        userId: 101,
                        name: 'PnCode Admin',
                        color: cursorColor?.color || '#808080',
                    });
            
                    providerRef.current.on('synced', () => {
                        const ytext = ydoc.getText('codemirror');
                        let initialContent = ytext.toString();
                        if (((initialContent === '' || initialContent === null) && providerRef.current.awareness.getStates()?.size === 1)) {
                            ydoc.transact(() => {
                                ytext.insert(0, notes);
                            });
                            initialContent = notes;
                        }
            
                        const state = EditorState.create({
                            doc: initialContent,
                            extensions: [
                                keymap.of([...yUndoManagerKeymap, { key: 'Enter', run: (view) => {
                                    view.dispatch(view.state.replaceSelection('\n'))
                                    return true
                                    }}
                                ]),
                                yCollab(ytext, providerRef.current.awareness),
                                EditorView.lineWrapping,
                            ]
                        });
            
                        const notepad = document.getElementById('notepad');
                        notepad.innerHTML = '';
                        notepadRef.current = new EditorView({ state, parent: (notepad) });
                        notepad.addEventListener('keydown', e => notepadListener(e, updateNotes));
                    });
                });
            }
        } catch (e) {
            alert('An error occured while rendering notepad.');
            console.error(e);
        }
    
        return () => {
            document.removeEventListener('keydown', notepadListener);
            if (providerRef.current) {
                providerRef.current.disconnect();
                providerRef.current.destroy();
                providerRef.current = null;
            }
            if (notepadRef.current) {
                notepadRef.current.destroy();
                notepadRef.current = null;
            }
            socket.off('notepad_loaded');
            socket.off('room_users_updated');
        }
    }, [room, socket, cursorColor]);

    const updateNotes = _.debounce(() => {
        if (notepadRef.current) {
            socket.emit('save_notepad', {
                room_id: room.room_id,
                content: notepadRef.current.state.doc.toString(),
            });
        }
    }, 200);

    return (    
        <div className="room-top-left">
            <div id='notepad'/>
        </div>
    )
}

export default Notepad;
