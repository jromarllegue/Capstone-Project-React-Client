import React, { useEffect } from 'react'
import { BsFillTriangleFill } from "react-icons/bs";
import toast from 'react-hot-toast';

function Instructions({instructions, setInstructions, socket}) {
    useEffect(() => {
        // Socket listener for real-time instruction updates
        socket.on('instructions_updated', ({ new_instructions }) => {
            setInstructions(new_instructions);
            toast.success('Instructions has been updated.');
        });

        return () => {
            socket.off('update_instructions');
        }
    }, [socket]);


    // Toggle instructions panel visibility with animation
    function toggleInstructions() {
        const instruc = document.getElementById('instructions-container');
        instruc.classList.toggle('opened');
    
        // Apply toggle classes to multiple elements
        const toOpen = [document.querySelector('#instructions-container'), 
                        document.querySelector('#instructions-container #p'),
                        document.querySelector('#editor-header #btn')];

        toOpen.forEach(item => item.classList.toggle('closed'));
    }
    

    return (
        <div className='flex-row' id='editor-header'>
            <div id='instructions-container'>
                <p id='p'><b>Instructions:  </b>{instructions}</p>
            </div>
            <button id='btn' onClick={toggleInstructions}>
                <label><BsFillTriangleFill size={12}/></label>
            </button>
        </div>
    )
}

export default Instructions