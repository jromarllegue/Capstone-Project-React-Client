import React, { useState, useRef } from 'react'
import Cookies from 'js-cookie';

function Options({type, setLeftDisplay, setRightDisplay, setEditorTheme, setAddNewFile, setDeleteFile, startRunOutput, startRunOutputFullView}) {
    const [isChecked, setIsChecked] = useState(() => {
        if (Cookies.get('theme') === 'dark' || !Cookies.get('theme')) {
            return true;
        } else {
            return false;
        }
    });

    function openMenu(clicked) {
        const option = document.getElementById(`${clicked}-menu`);
        if (option) {
            option?.classList?.toggle('hidden');
        }

        document.querySelectorAll('.options-menu').forEach((menu) => {
            if (menu.id !== option?.id && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
            }
        });
    }

    function addFile() {
        setDeleteFile(false);
        setAddNewFile(true);
        setLeftDisplay('files');

        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');
    }

    function openFile() {
        setLeftDisplay('files');
        setAddNewFile(false);
        setDeleteFile(false);
        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');

        const first_file = document.querySelector('#file-drawer .item');

        if (first_file) {
            first_file.focus();
        }
    }
    
    function deleteFile() {
        setAddNewFile(false);
        setDeleteFile(true);
        setLeftDisplay('files');
        
        const option = document.getElementById(`files-menu`);
        option.classList.toggle('hidden');
    }

    function viewSection (view) {
        if (view === 'files' || view === 'notepad') {
            setLeftDisplay(view);
        } else if (view === 'output' || view === 'history' || view === 'feedback') {
            setRightDisplay(view);
        }
        const option = document.getElementById(`view-menu`);
        option.classList.toggle('hidden');
    }

    function closeSection(direction) {
        if (direction === 'left') {
            setLeftDisplay('');
        } else if (direction === 'right') {
            setRightDisplay('');
        }

        const option = document.getElementById(`view-menu`);
        option.classList.toggle('hidden');
    }

    function changeTheme(checked) {
        const theme = checked ? 'dark' : 'light';
        Cookies.set('theme', theme);
        setIsChecked(checked);
        setEditorTheme(theme);
    }


    function runCode() {
        setRightDisplay('output');
        startRunOutput();
        const option = document.getElementById(`run-menu`);
        option.classList.toggle('hidden');
    }

    function runCodeFull() {
        startRunOutputFullView();
        const option = document.getElementById(`run-menu`);
        option.classList.toggle('hidden');
    }

    return (
        <>
            {type === 'assigned' &&
            <>              
                <button className='room-header-options' onClick={() => openMenu('files')}>
                    Files
                </button>
                <div id='files-menu' className='flex-column options-menu hidden'>
                    <button className='item items-center'  onClick={addFile}>
                        <label>Add File</label><span>Alt + A</span>
                    </button>
                    <button className='item items-center'  onClick={openFile}>
                        <label>Open File</label><span>Alt + [#]</span>
                    </button>
                    <button className='item items-center' onClick={deleteFile}>
                        <label>Delete File</label><span>Alt + X</span>
                    </button>
                </div>
            </>
            }
            {type === 'assigned' &&
            <>
                <button className='room-header-options' onClick={() => openMenu('view')}>
                    View
                </button>
                <div id='view-menu' className={`flex-column options-menu hidden`}>
                    <button className='item items-center' onClick={() => viewSection('files')}>
                        <label>Show Files</label><span>Alt + F</span>
                    </button>
                    <button className='item items-center' onClick={() => viewSection('notepad')}>
                        <label>Show Notepad</label><span>Alt + N</span>
                    </button>
                    <button className='item items-center' onClick={() => viewSection('output')}>
                        <label>Show Output</label><span>Alt + O</span>
                    </button>
                    <button className='item items-center' onClick={() => viewSection('history')}>
                        <label>Show History</label><span>Alt + H</span>
                    </button>
                    <button className='item items-center' onClick={() => viewSection('feedback')}>
                        <label>Show Feedback</label><span>Alt + B</span>
                    </button>
                    <button className='item items-center' onClick={() => closeSection('left')}>
                        <label>Close Left Tabs</label><span>Alt + L</span>
                    </button>
                    <button className='item items-center' onClick={() => closeSection('right')}>
                        <label>Close Right Tabs</label><span>Alt + P</span>
                    </button>

                </div>
            </>
            }
            <button className='room-header-options' onClick={() => openMenu('preferences')}>
                Preferences
            </button>
            <div id='preferences-menu' className={`flex-column options-menu hidden`}>
                <div className='item items-center'>
                    <label>Editor Theme</label>
                    <div className='items-center'>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={(e) => changeTheme(e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
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
        </>
    )
}

export default Options