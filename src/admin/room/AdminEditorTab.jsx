import React, { useState, useEffect } from 'react'
import { BsExclamationTriangleFill } from 'react-icons/bs'
import Editor from './AdminEditor'
import { showConfirmPopup } from '../../components/reactPopupService'

function EditorTab({room, cursorColor, socket, activeFile, editorTheme, rightDisplay}) {
    const [warning, setWarning] = useState(0);
    const [saved, setSaved] = useState(null);
    const [alertUp, setAlertUp] = useState(false);

    useEffect(() => {
        async function alertWarning() {    
            if (warning === 5 && alertUp === false) {
                setAlertUp(true);
                const reload = await showConfirmPopup({
                    title: 'Websocket Error',
                    message: 'Unable to connect to websocket. Do you want to reload the page?',
                    confirm_text: 'Reload',
                    cancel_text: 'Wait to reconnect',
                });

                if (reload) {
                    window.location.reload();
                }
                setAlertUp(false);
            }
        }
        alertWarning();
    }, [warning]);


  return (
    <div id='editor-container' className={`flex-column  ${editorTheme !== 'dark' && 'light'} ${rightDisplay === '' && 'larger'}`}>
        <>
            <div className='file-name-container items-start'>
                <div id='file-name'>
                    {activeFile &&
                        <label>{activeFile.name}</label>
                    } 
                    {!activeFile &&
                        <label>No file selected.</label>
                    }
                </div>
                {activeFile &&
                <>
                    {warning === 0 &&
                    <div id='save-status' className='items-center'>
                        {saved}
                    </div>
                    }
                    {warning !== 0 &&
                        <div id='file-warning'>
                            <label className='single-line items-center'>
                                <BsExclamationTriangleFill size={12}/>
                                {warning === 1 &&
                                    <span>Empty documents will not be saved to prevent loss of progress.</span>
                                }
                                {warning === 2 &&
                                    <span>The access for this activity is currently closed.</span>
                                }
                                {warning === 3 &&
                                    <span>You cannot edit the same line with another user.</span>
                                }
                                {warning === 4 &&
                                    <span>Connection to websocket has failed. Reconnecting...</span>
                                }
                                {warning === 5 &&
                                    <span>Error. Unable to connect to Websocket.</span>
                                }
                            </label>
                        </div>
                    }
                </>
                }
            </div>
            {activeFile &&
            <Editor 
                room={room}  
                cursorColor={cursorColor}
                socket={socket} 
                file={activeFile}
                setSaved={setSaved}
                editorTheme={editorTheme}
                warning={warning}
                setWarning={setWarning}/>
            }
        </>
    </div>
  )
}

export default EditorTab