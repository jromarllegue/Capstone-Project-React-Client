import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { initSocket } from '../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { BsXLg, BsCheck2, BsExclamationTriangleFill } from 'react-icons/bs';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { getToken, getClass } from '../validator';
import disableCopyPaste from './utils/disableCopyPaste';
import { runOutput, runOutputFullView } from './utils/runOption';
import { html5Snippet } from './utils/codeSnippets';
import Options from './Options';
import FileDrawer from './FileDrawer';
import Members from './Members';
import TabOutput from './TabOutput';
import Console from './Console';
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { linter, lintGutter } from '@codemirror/lint' 
import { javascript  } from '@codemirror/lang-javascript'
import { html, htmlLanguage } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { clouds } from 'thememirror'
import jsLint from './utils/JSesLint'
import _ from 'lodash'

function SoloRoom() {  
  const { room_id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [room_files,  setRoomFiles] = useState([]);
  
  const [activeFile, setActiveFile] = useState(null);

  const socketRef = useRef(null);
  const outputRef = useRef(null);
  
  const [leftDisplay, setLeftDisplay] = useState('files');
  const [rightDisplay, setRightDisplay] = useState('output');
  const [editorTheme, setEditorTheme] = useState(Cookies.get('theme') || 'dark');
  
  const [consoleOpen, setConsoleOpen] = useState(true);

  const [warning, setWarning] = useState(0);
  const [saved, setSaved] = useState(null);
  const editorRef = useRef(null);
  const compartmentRef = useRef(new Compartment());

  useEffect(() => { 
    if (!user) {
      const init = async () => await getToken();
      init().then(token => token ? setUser(getClass(token, token.position)) : navigate('/error/404'));
    } else {
      startRoom();
    }

    async function startRoom () {
      if (user?.position === 'Student') {
        disableCopyPaste();
      }   

      const info = await user.getSoloRoomDetails(room_id);
      setRoom(info);
      setRoomFiles(info.files);

      displayFile(info.files[0]);
      document.title = info.room_name;

      socketRef.current = await initSocket();
    
      socketRef.current.on('update_result_solo', ({ status }) => {
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
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off('update_token');
        socketRef.current.off('update_result');
        socketRef.current.disconnect();
      }
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === 'r') {
        event.preventDefault();
        startRunOutput();
        return;
      }

      if (event.altKey && event.key === '\\') {
        event.preventDefault();
        startRunOutputFullView();
        return;
      }

      if (event.altKey && event.key === 'f') {
        event.preventDefault();
        setLeftDisplay('files');
        return;
      }

      if (event.altKey && event.key === 'o') {
        event.preventDefault();
        setRightDisplay('output');
        return;
      }

      if (event.altKey && event.key === 'l') {
        event.preventDefault();
        if (leftDisplay === '') {
          setLeftDisplay('files');
        } else {
          setLeftDisplay('');
        }
      }
      if (event.altKey && event.key === 'p') {
        event.preventDefault();
        if (rightDisplay === '') {
          setRightDisplay('output');
        } else {
          setRightDisplay('');
        }
      }

      for (let i = 1; i <= room_files.length && i <= 10; i++) {
        if (event.altKey && event.key === i.toString()) {
          event.preventDefault();
          displayFile(room_files[i - 1]);
          break;
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [room_files]);


  function editorListener(e) {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      updateCode(editorRef.current);
    }
  };

  useEffect(() => {
    if (!activeFile) {
      editorRef.current = null;
      return;
    }

    const type = () => {
      if      (activeFile.name.endsWith('.html')) return [html(), htmlLanguage.data.of({ autocomplete: [html5Snippet] })]; 
      else if (activeFile.name.endsWith('.css'))  return css();
      else if (activeFile.name.endsWith('.js'))   return [javascript(), linter(jsLint)]; 
    }
    const theme = editorTheme === 'dark' ? oneDark : clouds;

    const state = EditorState.create({
      doc: activeFile.content,
      extensions: [
        keymap.of([indentWithTab]),
        basicSetup,
        type(),
        compartmentRef.current.of([theme]),
        lintGutter(),
        EditorView.lineWrapping,
        EditorView.updateListener.of(e => {
          if (e.docChanged) {
            updateCode(e);
          }
        }),
      ]
    });

    const editor_div = document.getElementById('editor-div');
    editor_div.innerHTML = '';
    
    editorRef.current = new EditorView({ state, parent: (editor_div) });
    editor_div.addEventListener('keydown', editorListener);

    return () => {
      document.getElementById('editor-div')?.removeEventListener('keydown', editorListener);

      editorRef.current.destroy();
      editorRef.current = null;
    }

  }, [activeFile]);

  useEffect(() => {
    if (editorRef.current) {
      const theme = editorTheme === 'dark' ? oneDark : clouds;
      editorRef.current.dispatch({
        effects: compartmentRef.current.reconfigure([theme])
      });
    }
  }, [editorTheme]);

  function displayFile(file) {
    if (file === null) {
      setActiveFile(null);
      return;
    }
    setActiveFile(file);
  }

  const updateCode = _.debounce((e) => {
    if (!activeFile || !editorRef.current) {
      return;
    }

    const content = e.state.doc.toString();
    const file_updated = { ...activeFile, content };

    setRoomFiles(room_files.map(f => f.name === activeFile.name ? file_updated : f));

    setSaved(<label id='saving'>Saving...</label>);

    socketRef.current.emit('update_code_solo', {
      room_id: room_id,
      file_id: activeFile.file_id,
      content: content,
    });
  }, 500)

  function startRunOutput() {
    runOutput(outputRef.current, room_id, room_files, activeFile, 'solo/');
  }

  function startRunOutputFullView() {
    runOutputFullView(room_id, room_files, activeFile, 'solo/');
  }


  function leaveRoom () {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate('/dashboard');
  }

  return (
    <>
    {user &&
    <main className='room-main'>
      <div className='flex-row items-center' id='room-header'>
          <div className='items-center'>
          {room && socketRef.current &&
            <Options 
              type={'solo'}
              room={room}
              user={user}
              socket={socketRef.current}
              setLeftDisplay={setLeftDisplay}
              setRightDisplay={setRightDisplay}
              setEditorTheme={setEditorTheme}
              outputRef={outputRef}
              startRunOutput={startRunOutput}
              startRunOutputFullView={startRunOutputFullView}/>
          }
          </div>
          {room &&
            <div className='items-center room-logo single-line'>
              {room.room_name}
            </div>
          }
          <div className='items-center'>
            <button className='room-header-options items-center' onClick={ leaveRoom }>
              <VscDebugDisconnect size={23} color={ '#f8f8f8' } /><span>Leave</span> 
            </button>
          </div>
      </div>
      {!(room && socketRef.current) &&
          <div className='loading'>
            <div className='loading-spinner'/>
          </div>
      }
      {room && socketRef.current &&
        <div id='editor-tab' className='flex-row'>
          <aside className={`flex-column ${leftDisplay === '' && 'none'}`} id='left-body'>
            <div className='flex-column side-tab top'>
              <div className='side-tab-buttons flex-row'>
                <button className='remove-side-tab items-center' onClick={() => setLeftDisplay('')}>
                  <BsXLg size={14}/>
                </button>
                <button className={`side-tab-button ${leftDisplay === 'files' && 'active'}`}
                        onClick={() => setLeftDisplay('files')}>
                        Files
                </button>
              </div>
              {leftDisplay === 'files' &&
                <FileDrawer 
                  room={room} 
                  user={user}
                  socket={socketRef.current}
                  room_files={room_files}
                  setRoomFiles={setRoomFiles}
                  activeFile={activeFile}
                  displayFile={displayFile}/>
              }
              </div>
              <Members 
                members={[user]}
                roomUsers={[{ user_id: user.uid, cursor: { color: 'red' } }]}
                inSolo={true}/>
          </aside>
          <div className={`flex-column ${leftDisplay === '' && 'larger'}`} id='center-body'>
            <div className='flex-row' id='editor-section'>
              <div id='editor-container' className={`flex-column  ${editorTheme !== 'dark' && 'light'} ${rightDisplay === '' && 'larger'}`}>
                <div className='file-name-container items-start'>
                  <div id='file-name'>
                      {activeFile &&
                          <label>{activeFile.name}</label>
                      } 
                      {!activeFile &&
                          <label>No file selected.</label>
                      }
                  </div>
                  {activeFile && warning === 0 &&
                  <div id='save-status' className='items-center'>
                      {saved}
                  </div>
                  }
                </div>
                {activeFile &&
                  <div id='editor-div'>
                  </div>
                }
              </div>
              <div className={`flex-column ${rightDisplay === '' && 'none'}`} id='right-body'>
                <div className='side-tab-buttons flex-row'>
                  <button className='remove-side-tab items-center' onClick={() => setRightDisplay('')}>
                    <BsXLg size={14}/>
                  </button>
                  <button className={`side-tab-button ${rightDisplay === 'output' && 'active'}`}
                          onClick={() => setRightDisplay('output')}>
                          Output
                  </button>
                </div>
                <div id='right-section' className='column'>
                  <TabOutput 
                    rightDisplay={rightDisplay}
                    outputRef={outputRef}
                    activeFile={activeFile}
                    startRunOutput={startRunOutput}
                    startRunOutputFullView={startRunOutputFullView}
                    consoleOpen={consoleOpen}/>
                    <Console 
                      rightDisplay={rightDisplay}
                      sharedEnabled={false}
                      consoleOpen={consoleOpen}
                      setConsoleOpen={setConsoleOpen}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </main>
    }
    </>
  )
}

export default SoloRoom