import React, { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import { EditorView } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import _ from 'lodash'
import notepadListener from './utils/notepadListener'

function Notepad({room, user, socket, cursorColor, activityOpen}) {
    // Refs management for notepad and websocket provider
    const notepadRef = useRef(null);
    const providerRef = useRef(null);
  
    // Main setup effect for collaborative notes
    useEffect(() => {
        // Cleanup previous instances
        notepadRef.current ? notepadRef.current?.destroy() : null;
        providerRef.current ? providerRef.current?.destroy() : null;
    
        // Initialize notepad with existing content
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
            // Setup YJS document for collaboration
            const ydoc = new Y.Doc();
      
            // Initialize WebSocket provider for real-time collaboration
            providerRef.current = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
                `${room.room_id}-notepad`, 
                ydoc
            );
            
            // Set user awareness state for collaborative cursors
            providerRef.current.awareness.setLocalStateField('user', {
                userId: user.uid,
                name: user.last_name + ', ' + user.first_name,
                color: cursorColor.color,
            });
      
            // Configure editor permissions based on user position
            const setup = () => {
                if (user?.position === 'Student') {
                    return EditorState.readOnly.of(!activityOpen);
                } else if (user?.position === 'Professor') {
                    return EditorState.readOnly.of(true);
                }
            }

             // Handle initial content synchronization
            providerRef.current.on('synced', () => {
                const ytext = ydoc.getText('codemirror');
                let initialContent = ytext.toString();
                // Set initial content if empty and first user
                if (((initialContent === '' || initialContent === null) && providerRef.current.awareness.getStates()?.size === 1)) {
                    ydoc.transact(() => {
                        ytext.insert(0, notes);
                    });
                    initialContent = notes;
                }

                // Create and configure CodeMirror editor instance
                const state = EditorState.create({
                    doc: initialContent,
                    extensions: [
                        keymap.of([...yUndoManagerKeymap, { key: 'Enter', run: (view) => {
                            if (user.position === 'Student' && activityOpen) {
                                view.dispatch(view.state.replaceSelection('\n'));
                            }
                            return true;
                            }}
                        ]),
                        setup(),
                        yCollab(ytext, providerRef.current.awareness),
                        EditorView.lineWrapping,
                    ]
                });

                // Mount editor and setup event listeners
                const notepad = document.getElementById('notepad');
                notepad.innerHTML = '';
                notepadRef.current = new EditorView({ state, parent: (notepad) });

                if (user?.position === 'Student') {
                    notepadRef.current.focus();

                    notepad.addEventListener('keydown', e => notepadListener(e, updateNotes));
                }
            });
        })

        // Cleanup on component unmount
        return () => {
            if (user?.position === 'Student') {
                document.getElementById('notepad')?.removeEventListener('keydown', notepadListener);
            }
            providerRef.current ? providerRef.current?.destroy() : null;
            notepadRef.current ? notepadRef.current?.destroy() : null;
            socket.off('notepad_loaded');
        };
    }, [room, user, socket, cursorColor, activityOpen]);

     // Debounced function to save notepad content
    const updateNotes = _.debounce(() => {
        if (notepadRef.current) {
            socket.emit('save_notepad', {
                room_id: room.room_id,
                content: notepadRef.current.state.doc.toString(),
            });
        }
    }, 500);

    return (    
        <div className='room-top-left'>
            <div id='notepad'/>
        </div>
    )
}

export default Notepad;
