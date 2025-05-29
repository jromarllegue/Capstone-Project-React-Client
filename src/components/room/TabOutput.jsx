import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MdFullscreen } from "react-icons/md";
import { VscRunAll } from 'react-icons/vsc';

function TabOutput({ outputRef, rightDisplay, startRunOutput, startRunOutputFullView, consoleOpen }) {
  const { room_id } = useParams();
  const navigate = useNavigate();
  // State management for iframe title
  const [iframeTitle, setIframeTitle] = useState('Output');

  // Update title based on iframe content status
  const updateTitle = (current) => {
    current?.src ? setIframeTitle(`Viewing output...`): setIframeTitle('Output');
  };


    return (
      <div className={`flex-column ${rightDisplay !== 'output' && 'inactive'} ${!consoleOpen && 'larger'}`} id='output-div'>
        <div className='output-header items-center'>
          <label className='single-line'><b>{iframeTitle}</b></label>
          <div className='items-center'>
            <button 
              className='output-btn items-center' 
              onClick={startRunOutput}>
              <VscRunAll color={'#505050'} size={20}/>
            </button>
            <button
              className='output-btn items-center' 
              onClick={startRunOutputFullView}>
              <MdFullscreen color={'#505050'} size={20}/>
            </button>
        </div>
        </div>
        <div className="output-container">
          <iframe title='Output' id='output-iframe' ref={outputRef} onLoad={() => updateTitle(outputRef?.current)}>
          </iframe>
        </div>              
      </div>
    )
}

export default TabOutput
