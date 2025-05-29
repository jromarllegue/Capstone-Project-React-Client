import React, { useState, useEffect } from 'react'
import { BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Switch({ room, activity }) {
    // State management for available assigned rooms within the activity
    const [room_links, setRoomLinks] = useState([]);
    const navigate = useNavigate();

    // Initialization for room selection
    useEffect(() => {
        setRoomLinks(activity.other_rooms);
    }, [room, activity]);

    // Navigate to selected room
    function switchRoom(room_id) {
        navigate(`/room/${room_id}`);
    }

    // Handle arrow navigation between rooms
    function arrowSwitch(arrow) {
        // Find current room index
        const currentIndex = room_links.findIndex(r => r.room_id === room.room_id);
        let newIndex;
    
        // Determine new index based on arrow direction
        if (arrow === 'left') {
            newIndex = (currentIndex - 1 + room_links.length) % room_links.length;
        } else if (arrow === 'right') {
            newIndex = (currentIndex + 1) % room_links.length;
        }
    
        // Navigate to new room
        const newRoomId = room_links[newIndex].room_id;
        switchRoom(newRoomId);
    }
    
  return (
    <div id='switch-rooms' className='flex-row items-center'>
        {room_links.length > 1 &&
            <button className='items-center' onClick={() => arrowSwitch('left')}>
                <BsCaretLeftFill size={18}/>
            </button>
        }
        <select id='room-select' value={room.room_id} onChange={(e) => switchRoom(e.target.value)}>
            {room_links.map((room_link) => {
                return (
                    <option 
                        key={room_link.room_id}
                        value={room_link.room_id}>
                        {room_link.room_name}
                    </option>
                )
            })}
        </select>
        {room_links.length > 1 &&
            <button className='items-center' onClick={() => arrowSwitch('right')}>
                <BsCaretRightFill size={18}/>
            </button>
        }
    </div>
  )
}

export default Switch