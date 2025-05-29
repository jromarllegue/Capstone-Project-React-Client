import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { initSocket } from '../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { BsXLg } from 'react-icons/bs';
import { VscDebugDisconnect } from 'react-icons/vsc';
import getAdminClass from './utils/adminValidator';
import { handleKeyDownAssigned } from '../components/room/utils/roomHandleKeyDown';
import { runOutput, runOutputFullView } from '../components/room/utils/runOption';
import FileDrawer from '../components/room/FileDrawer';
import TabOutput from '../components/room/TabOutput';
import Members from '../components/room/Members';
import Instructions from '../components/room/Instructions';
import History from '../components/room/History';
import Console from '../components/room/Console';
import Options from './room/AdminOptions';
import Notepad from './room/AdminNotepad';
import EditorTab from './room/AdminEditorTab';
import Chats from './room/AdminChats';
import Feedback from './room/AdminFeedback';

function AdminRoom() {  
  const { room_id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [room, setRoom] = useState(null);
  const [room_files,  setRoomFiles] = useState([]);
  const [members, setMembers] = useState ([]);
  
  const [activity, setActivity] = useState(null);
  const [instructions, setInstructions] = useState(null);

  const [activeFile, setActiveFile] = useState(null);
  const [cursorColor, setCursorColor] = useState(null);

  const [roomUsers, setRoomUsers] = useState([]);
  const [editorUsers, setEditorUsers]  = useState([]);
  const outputRef = useRef(null);

  const socketRef = useRef(null);
  const [socketId, setSocketId] = useState(null);
  
  const [leftDisplay, setLeftDisplay] = useState('files');
  const [rightDisplay, setRightDisplay] = useState('output');
  const [addNewFile, setAddNewFile] = useState(false);
  const [deleteFile, setDeleteFile] = useState(false);
  const [editorTheme, setEditorTheme] = useState(Cookies.get('theme') || 'dark');
  
  const [consoleOpen, setConsoleOpen] = useState(true);

  useEffect(() => {
    if (!admin) {
      const init = async () => await getAdminClass();
      init().then(data => data ? setAdmin(data) : navigate('/error/404'));
    } else {
      startRoom();
    }

    async function startRoom () {
      const info = await admin.getAssignedRoomDetails(room_id);
      setRoom(info.room);
      setRoomFiles(info.files);
      setMembers(info.members);

      setActivity(info.activity);
      setInstructions(info.activity.instructions);

      document.title = `PnCode Admin - ${info.activity.activity_name}`;

      socketRef.current = await initSocket();

      socketRef.current.on('connect_timeout', () => {
        console.error('Connection timeout');
        socketConnectError('Timeout');
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        socketConnectError('Error');
      });
  
      if (info.files.length > 0) {
        displayFile(info.files[0]);
      }
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect_timeout');
        socketRef.current.off('error');
        socketRef.current.disconnect();
      }
    }
  }, [admin, room_id]);

  useEffect(() => {
    if (!admin || !socketRef.current) {
      return;
    }
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_room', { 
        room_id: room_id, 
        user_id: 'user_admin',
        first_name: 'PnCode',
        last_name: 'Admin',
        position: 'Admin'
      })
      
      if (activeFile !== null) {
        socketRef.current.emit('join_editor', {
          room_id,
          file_id: activeFile.file_id,
          user_id: 'user_admin',
        });
      }
    });
    
    socketRef.current.on('get_socket_id', ({ socket_id }) => {
      setSocketId(socket_id);
    });

    socketRef.current.on('room_users_updated', ({ users, message }) => {
      setRoomUsers(users);
      setCursorColor({ color: 'gray', light: '#80808033' });

      if (message) {
        toast.success(message);
      }
    });
    
    socketRef.current.on('editor_users_updated', ({ editors }) => {
      setEditorUsers(editors);
    });

    socketRef.current.on('found_file', ({ file }) => {
      setActiveFile(file);
    });

    return () => {
      socketRef.current.off('connect');
      socketRef.current.off('get_socket_id');
      socketRef.current.off('found_file');
      socketRef.current.off('room_users_updated');
      socketRef.current.off('editor_users_updated');  
    };
  }, [admin, socketRef.current, activeFile]);  

  useEffect(() => {
    if (!admin) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setAddNewFile(true);
        setDeleteFile(false);
        setLeftDisplay('files');
        return;
      }
  
      if (event.altKey && event.key === 'x') {
        event.preventDefault();
        setDeleteFile(true);
        setAddNewFile(false);
        setLeftDisplay('files');
        return;
      }
      
      handleKeyDownAssigned(event, setLeftDisplay, setRightDisplay, room_files, displayFile, startRunOutput, startRunOutputFullView);
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (handleKeyDown) {
        document.removeEventListener('keydown', handleKeyDown);
      }
    }  
  }, [admin, room_files, activeFile]);

  function displayFile(file) {
    if (file === null) {
      setActiveFile(null);
      return;
    }

    socketRef.current.emit('find_file', {
      room_id,
      file_id: file.file_id
    });
  }

  function startRunOutput() {
    runOutput(outputRef.current, room_id, room_files, activeFile, 'admin/');
  }

  function startRunOutputFullView() {
    runOutputFullView(room_id, room_files, activeFile, 'admin/');
  }

  function leaveRoom () {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
      navigate(`/admin/dashboard/activity/${activity.activity_id}/assigned-rooms/${room.room_id}/`);
  }  

  return (
    <>
    {admin &&
    <main className='room-main'>
      <div className='flex-row items-center' id='room-header'>
          <div className='items-center'>
          {room && activity && socketRef.current &&
            <Options 
              type={'assigned'} 
              room={room} 
              socket={socketRef.current}
              setLeftDisplay={setLeftDisplay}
              setRightDisplay={setRightDisplay}
              reloadFile={() => displayFile(activeFile)}
              setEditorTheme={setEditorTheme}
              outputRef={outputRef}
              setAddNewFile={setAddNewFile}
              setDeleteFile={setDeleteFile}
              startRunOutput={startRunOutput}
              startRunOutputFullView={startRunOutputFullView}/>
          }
          </div>
          {room && activity &&
          <>
            <div className='items-center room-logo single-line'>
              {activity.activity_name}
            </div>
            <div className='items-center'>
              <button className='room-header-options items-center' onClick={ leaveRoom }>
                <VscDebugDisconnect size={23} color={ '#f8f8f8' } /><span>Leave</span> 
              </button>
            </div>
          </>
          }
      </div>
      {!(room && activity && socketRef.current) &&
          <div className='loading'>
            <div className='loading-spinner'/>
          </div>
      }
      {room && activity && socketRef.current &&
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
                <button className={`side-tab-button ${leftDisplay === 'notepad' && 'active'}`} 
                        onClick={() => setLeftDisplay('notepad')}>
                        Notepad
                </button>
              </div>
              {leftDisplay === 'files' &&
                <FileDrawer 
                  room={room} 
                  socket={socketRef.current}
                  room_files={room_files}
                  setRoomFiles={setRoomFiles}
                  activeFile={activeFile}
                  displayFile={displayFile}
                  addNewFile={addNewFile}
                  setAddNewFile={setAddNewFile}
                  deleteFile={deleteFile}
                  setDeleteFile={setDeleteFile}
                  editorUsers={editorUsers}
                  roomUsers={roomUsers}/>
              }
              {leftDisplay === 'notepad' &&
                <Notepad 
                  room={room} 
                  socket={socketRef.current}
                  cursorColor={cursorColor}/>
              }
              </div>
            <Members 
              members={members}
              roomUsers={roomUsers}/>
          </aside>
          <div className={`flex-column ${leftDisplay === '' && 'larger'}`} id='center-body'>
            <Instructions 
              instructions={instructions} 
              setInstructions={setInstructions}
              socket={socketRef.current}/>
            <div className='flex-row' id='editor-section'>
              <EditorTab 
                room={room}
                cursorColor={cursorColor}
                socket={socketRef.current}
                activeFile={activeFile}
                editorTheme={editorTheme}
                rightDisplay={rightDisplay}/>
              <div className={`flex-column ${rightDisplay === '' && 'none'}`} id='right-body'>
                <div className='side-tab-buttons flex-row'>
                  <button className='remove-side-tab items-center' onClick={() => setRightDisplay('')}>
                    <BsXLg size={14}/>
                  </button>
                  <button className={`side-tab-button ${rightDisplay === 'output' && 'active'}`}
                          onClick={() => setRightDisplay('output')}>
                          Output
                  </button>
                  <button className={`side-tab-button ${rightDisplay === 'history' && 'active'}`} 
                          onClick={() => setRightDisplay('history')}>
                          History
                  </button>
                  <button className={`side-tab-button ${rightDisplay === 'feedback' && 'active'}`}
                          onClick={() => setRightDisplay('feedback')}>
                          Feedback
                  </button>
                </div>
                <div id='right-section' className={`${rightDisplay === 'output' && 'column'}`}>
                  <TabOutput 
                    rightDisplay={rightDisplay}
                    outputRef={outputRef}
                    startRunOutput={startRunOutput}
                    startRunOutputFullView={startRunOutputFullView}
                    consoleOpen={consoleOpen}/>
                  <Console 
                    rightDisplay={rightDisplay}
                    name={undefined}
                    socketId={socketId}
                    socket={socketRef.current}
                    sharedEnabled={true}
                    consoleOpen={consoleOpen}
                    setConsoleOpen={setConsoleOpen}/>
                  {activeFile &&
                    <History
                      viewCount={true}
                      rightDisplay={rightDisplay}
                      socket={socketRef.current}
                      file={activeFile}/>                         
                  }
                  <Feedback 
                    room={room}
                    socket={socketRef.current}
                    socketId={socketId}
                    rightDisplay={rightDisplay}
                    setRightDisplay={setRightDisplay}/>
                </div>
              </div>
            </div>
          </div>
          <Chats room={room} socket={socketRef.current}/>
        </div>
      }
    </main>  
    }
    </>
  )
}

export default AdminRoom