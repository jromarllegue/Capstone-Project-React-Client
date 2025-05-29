import React, { useState, useEffect, useRef } from 'react'
import { FaHtml5, FaCss3, FaJs } from 'react-icons/fa';
import { BsTrash } from 'react-icons/bs';
import { FiPlus } from 'react-icons/fi';

// Component that manages file listing, creation and deletion in the room
function FileDrawer({room, socket, room_files, activityOpen, setRoomFiles, activeFile, displayFile, addNewFile, setAddNewFile, deleteFile, setDeleteFile, editorUsers, roomUsers}) {
    // State management for file operations
    const [new_file_name, setNewFileName] = useState('');
    const [new_file_type, setNewFileType] = useState('html');
    const [warning, setWarning] = useState(null);
    const addFileRef = useRef(null);
    const deleteFileRef = useRef(null);

    // Socket listeners for file operations
    useEffect(() => {
      // Handle new file creation response
      socket.on('file_added', ({ status, file, message }) => {
        if (status === 'ok') {
            setWarning(null);
            setAddNewFile(false);
            setNewFileName('');

            // add new file to the list of files
            setRoomFiles(prevFiles => [...prevFiles, file]);
        } else {
            setWarning(message);
        }
      });

      // Handle file deletion response
      socket.on('file_deleted', ({ status, file_id, message }) => {
        if (status === 'ok') {
            setWarning(null);
            setDeleteFile(false);

            // Update file list after deletion
            let files = room_files.filter(file => file.file_id !== file_id);
            setRoomFiles(prevFiles => prevFiles.filter(file => file.file_id !== file_id));

            // Handle active file changes after deletion
            if (files.length !== 0 && activeFile && activeFile.file_id === file_id) {
                displayFile(files[0]);
            } else if (files.length === 0) {
                displayFile(null);
            }
        } else {
            setWarning(message);
        }
      });
    
      return () => {
        socket.off('file_added');
        socket.off('file_deleted');
      }
    }, [room_files, activeFile]);
    
    // Focus management for file operations
    useEffect(() => {
        if (addNewFile && addFileRef.current) addFileRef.current.focus();
        if (deleteFile && deleteFileRef.current) deleteFileRef.current.focus();
    }, [addNewFile, deleteFile]);
      
     // Handle file selection and deletion
    function useFile(file) {
        if (!deleteFile) {
            displayFile(file);
        } else {
          // Double confirmation for file deletion
            const result1 = confirm(`Do you want to delete ${file.name}?`);

            if (result1) {
                const result2 = confirm('Deleting a file cannot be undone. Are you sure you want to continue?');

                if (result2) {
                    socket.emit('delete_file', {
                        file_id: file.file_id,
                        room_id: room.room_id,
                        active: activeFile?.file_id
                    });
                }
            }
        }
    }

    // Handle new file creation
    function addFile(e) {
        e.preventDefault();

        //Send new file details to server
        socket.emit('add_file', {
            room_id: room.room_id,
            file_name: new_file_name,
            file_type: new_file_type
        });        
    }

    return (
        <div className='room-top-left'> 
            <div id='file-drawer'>
                <label className='head'>
                    <span>#</span>
                    <span>Icon</span>
                    <span>Name</span>
                </label>
                {room_files.map((file, index) => {
                    const user_count = editorUsers ? editorUsers.find(edt => edt.id === file.file_id)?.users : null;

                    return (
                        <button className={`${activeFile && file.file_id === activeFile?.file_id ? 'active-file' : ''} items-center flex-row item`} 
                            key={index} 
                            onClick={() => useFile(file)}>
                            <div className='items-center file-name'>
                                <div className='items-center'>
                                    <span>{index + 1}</span>
                                    { file.type === 'html' && <FaHtml5 size={22}/> }
                                    { file.type === 'css' && <FaCss3 size={22}/> }
                                    { file.type === 'js' && <FaJs size={22}/> }
                                </div>
                                <div className='text items-center'>
                                    <label className='single-line'>{file.name}</label>
                                </div>
                            </div>
                            {!deleteFile && user_count && user_count?.length > 0 &&
                                <div className='user-count items-center'>
                                    {user_count.length}
                                    {roomUsers &&
                                        <div className='reacted-list flex-column'>
                                        {user_count.slice(0,4).map((u, index) => {
                                            const file_user = roomUsers.find(m => m.user_id === u.user_id);
                                            return file_user ?
                                                <label
                                                    key={index} 
                                                    className={`reacted-user ${file_user.position !== 'Student' && 'gray' }`} 
                                                    style={{ borderLeft: `${file_user.cursor.color} 5px solid` }}>
                                                    {file_user.last_name}
                                                </label>
                                            : null
                                        })}
                                        {user_count.length > 4 &&
                                            <label className='reacted-user'>
                                                + {roomUsers.length - 4}
                                            </label>
                                        }
                                        </div>
                                    }
                                </div>
                            }
                            {deleteFile &&
                                <label className='file-delete items-center'> 
                                    <BsTrash size={18}/>
                                </label>
                            }
                        </button>    
                    )})
                }
                {deleteFile &&
                    <>
                        <div className='flex-row file-form-btn'>
                            <button className='file-cancel-btn' ref={deleteFileRef} onClick={() => setDeleteFile(false)}>Cancel</button>
                        </div>
                        {warning && <label className='label-warning'>{warning}</label>}
                    </>
                }
                {addNewFile &&
                    <form onSubmit={(e) => addFile(e)}>
                        <div className='flex-row file-form'>
                            { new_file_type === 'html' && <FaHtml5 size={22}/> }
                            { new_file_type === 'css' && <FaCss3 size={22}/> }
                            { new_file_type === 'js' && <FaJs size={22}/> }
                            <input
                                type='text'
                                className='file-name-input'
                                value={new_file_name}
                                onChange={(e) => setNewFileName(e.target.value)}
                                ref={addFileRef}
                                required/>
                            <select value={new_file_type} onChange={(e) => setNewFileType(e.target.value)}>
                                <option value='html'>. HTML</option>
                                <option value='css'>. CSS</option>
                                <option value='js'>. JS</option>
                            </select>
                        </div>
                        <div className='flex-row file-form-btn'>
                            <input type='submit' value='Add' className='file-add-btn'/>
                            <button className='file-cancel-btn' onClick={() => setAddNewFile(false)}>Cancel</button>
                        </div>
                        {warning && <label className='label-warning'>{warning}</label>}
                    </form>
                }
                {!addNewFile && activityOpen === true && !deleteFile &&
                    <button className='add-file items-center' onClick={() => setAddNewFile(true)}>
                        <FiPlus size={17}/> Add File
                    </button>
                }
            </div>
        </div>
    )
}

export default FileDrawer