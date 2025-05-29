import React, { useEffect, useState, useRef } from 'react'
import Cookies from 'js-cookie';
import checkTimeframe from './utils/checkTimeframe';
import handleMenu from '../dashboard/utils/handleMenu';


function Options({type, user, activityOpen, setLeftDisplay, setRightDisplay, setEditorTheme, setAddNewFile, setDeleteFile, startRunOutput, startRunOutputFullView}) {
    // Theme state management with cookie persistence
    const [isChecked, setIsChecked] = useState(() => {
        if (Cookies.get('theme') === 'dark' || !Cookies.get('theme')) {
            return true;
        } else {
            return false;
        }
    });

    // Refs for menu dropdowns
    const fileRef = useRef(null);
    const viewRef = useRef(null);
    const preferenceRef = useRef(null);
    const runRef = useRef(null);

    // Handle clicking outside menus to close them
    useEffect(() => {
        function handleClickOutside(e) {
            handleMenu(fileRef.current, openMenu, e.target);
            handleMenu(viewRef.current, openMenu, e.target);
            handleMenu(preferenceRef.current, openMenu, e.target);
            handleMenu(runRef.current, openMenu, e.target);
        }
        document.addEventListener("mousedown", handleClickOutside);
    
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [])

    // Menu toggle handler
    function openMenu(clicked) {
        if (clicked !== false) {
            if (clicked === 'files' && type === 'assigned') {
            }
    
            const option = document.getElementById(`${clicked}-menu`);
            if (option) {
                option?.classList?.toggle('hidden');
            }
    
            // Close all other menus
            document.querySelectorAll('.options-menu').forEach((menu) => {
                if (menu.id !== option?.id && !menu.classList.contains('hidden')) {
                    menu.classList.add('hidden');
                }
            });

        } else {
            // setTimeout(() => {
            //     document.querySelectorAll('.options-menu').forEach((menu) => {
            //         !menu.classList.contains('hidden') ? menu.classList.add('hidden') : null;
            //     });
            // }, 200)
        }
    }

    // Handle add file option
    function addFile() {
        setDeleteFile(false);
        setAddNewFile(true);
        setLeftDisplay('files');

        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');
    }

    // Handle open file option
    function openFile() {
        setLeftDisplay('files');

        if (setAddNewFile && setDeleteFile) {
            setAddNewFile(false);
            setDeleteFile(false);
        }
        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');

        const first_file = document.querySelector('#file-drawer .item');

        if (first_file) {
            first_file.focus();
        }
    }
    
    // Handle delete file option
    function deleteFile() {
        setAddNewFile(false);
        setDeleteFile(true);
        setLeftDisplay('files');
        
        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');
    }

    // Handle view section option
    function viewSection (view) {
        if (view === 'files' || view === 'notepad') {
            setLeftDisplay(view);
        } else if (view === 'output' || view === 'history' || view === 'feedback') {
            setRightDisplay(view);
        }
        const option = document.getElementById(`view-menu`);
        option.classList.toggle('hidden');
    }

    // Handle close tab option
    function closeSection(direction) {
        if (direction === 'left') {
            setLeftDisplay('');
        } else if (direction === 'right') {
            setRightDisplay('');
        }

        const option = document.getElementById(`view-menu`);
        option.classList.toggle('hidden');
    }

    // Handle change theme option
    function changeTheme(checked, from) {
        const theme = checked ? 'dark' : 'light';
        user.changeTheme(theme);
        setIsChecked(checked);
        setEditorTheme(theme);

        const theme_btn = document.getElementById('editor-theme');
        if (theme_btn && from === 'button') {
            theme_btn.checked = checked;
        }
    }

    // Handle run code option
    function runCode() {
        setRightDisplay('output');
        startRunOutput();
        const option = document.getElementById(`run-menu`);
        option.classList.toggle('hidden');
    }

    // Handle run code full view option
    function runCodeFull() {
        startRunOutputFullView()
        const option = document.getElementById(`run-menu`);
        option.classList.toggle('hidden');
    }

    return (
        <>
        <div ref={fileRef}>
            <button className='room-header-options' onClick={() => openMenu('files')}>
                Files
            </button>
            {activityOpen &&
                <div id='files-menu' className='flex-column options-menu hidden'>
                    {user?.position === 'Student' && type === 'assigned' &&
                        <button className='item items-center'  onClick={addFile}>
                            <label>Add File</label><span>Alt + A</span>
                        </button>
                    }
                    <button className='item items-center'  onClick={openFile}>
                        <label>Open File</label><span>Alt + (#)</span>
                    </button>
                    {user?.position === 'Student' && type === 'assigned' &&
                        <button className='item items-center' onClick={deleteFile}>
                            <label>Delete File</label><span>Alt + X</span>
                        </button>
                    }
                </div>
            }
        </div>
        <div ref={viewRef}>
            <button className='room-header-options' onClick={() => openMenu('view')}>
                View
            </button>
            <div id='view-menu' className={`flex-column options-menu hidden`}>
                <button className='item items-center' onClick={() => viewSection('files')}>
                    <label>Show Files</label><span>Alt + F</span>
                </button>
                {type === 'assigned' &&
                    <button className='item items-center' onClick={() => viewSection('notepad')}>
                        <label>Show Notes</label><span>Alt + N</span>
                    </button>
                }
                <button className='item items-center' onClick={() => viewSection('output')}>
                    <label>Show Output</label><span>Alt + O</span>
                </button>
                {type === 'assigned' &&
                <>
                    <button className='item items-center' onClick={() => viewSection('history')}>
                        <label>Show History</label><span>Alt + H</span>
                    </button>
                    <button className='item items-center' onClick={() => viewSection('feedback')}>
                        <label>Show Feedback</label><span>Alt + B</span>
                    </button>
                </>
                }
                <button className='item items-center' onClick={() => closeSection('left')}>
                    <label>Close Left Tabs</label><span>Alt + L</span>
                </button>
                <button className='item items-center' onClick={() => closeSection('right')}>
                    <label>Close Right Tabs</label><span>Alt + P</span>
                </button>
            </div>
        </div>
        <button className='room-header-options' onClick={() => openMenu('preferences')}>
            Preferences
        </button>
        <div id='preferences-menu' className={`flex-column options-menu hidden`}>
            <div className='item items-center'>
                <label>Editor Theme</label>
                <div className='items-center'>
                    <label className="switch">
                        <input 
                            id='editor-theme'
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => changeTheme(e.target.checked)}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </div>
        <div ref={runRef}>
            <button className='room-header-options' onClick={() => openMenu('run')}>
                Run
            </button>
            <div id='run-menu' className={`flex-column options-menu hidden`}>
                <button className='item items-center' onClick={runCode}>
                    <label>Run</label> <span>Alt + R</span>
                </button>
                <button className='item items-center' onClick={runCodeFull}>
                    <label>Run in Full View <span>Alt + \</span></label>
                </button>
            </div>
        </div>
        </>
    )
}

export default Options