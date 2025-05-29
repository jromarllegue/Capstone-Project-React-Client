import React, { useState } from 'react';
import { BsTrash, BsPencilSquare } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { SoloRoom } from '../../classes/RoomClass';
import toast from 'react-hot-toast';
import { showConfirmPopup } from '../reactPopupService'

function SelectRoom({ room, index, displayInfo }) {
  const room_class = new SoloRoom(room.room_id, room.room_name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [new_room_name, setNewRoomName] = useState(room_class.room_name);

  const updatedAt = () => {
    const date = new Date(room.updatedAt);

    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const month = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const paddedHours = formattedHours < 10 ? '0' + formattedHours : formattedHours;

    return `${day}/${month}/${year} ${paddedHours}:${minutes} ${ampm}`;
  };
  const navigate = useNavigate();

  async function updateRoom(e) {
    e.preventDefault()
    const res = await room_class.updateRoomName(new_room_name);

    if (res) {
      toast.success('Room name is updated successfully.');
      displayInfo();
      setIsUpdating(false);
    }
  }

    async function deleteRoom() {
      const confirm = await showConfirmPopup({
        title: 'Delete A Solo Room',
        message: `Are you sure you want to delete ${room_class.room_name}?`,
        confirm_text: 'Delete',
        cancel_text: 'Cancel',
      });
    
      if (confirm) {
        const res = await room_class.deleteRoom();
        if (res) {
          toast.success('Room is deleted successfully.');
          displayInfo();
        }
      }
    }

  return (
    <tr className='list-item'>
      <td className='td-1' onClick={() => navigate(`/solo/${room_class.room_id}`)}>
        {index + 1}
      </td>
      <td className='td-2' onClick={() => !isUpdating ? navigate(`/solo/${room_class.room_id}`) : null}>
        {!isUpdating && room_class.room_name}
        {isUpdating &&
          <form autoComplete='false' onSubmit={(e) => updateRoom(e)}>
            <input  type='text' 
                    value={new_room_name}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    />
            <button className='file-cancel-btn' onClick={() => setIsUpdating(false)} type='button'>Cancel</button>
          </form>
        }
      </td>
      <td className='td-3' onClick={() => { navigate(`/solo/${room_class.room_id}`) }}>
        {updatedAt()}
      </td>
      <td className='td-4 items-center'>
        <button className='items-center none' onClick={() => setIsUpdating(true)}><BsPencilSquare size={20}/></button>
        <button className='items-center none' onClick={deleteRoom}><BsTrash size={20}/></button>
      </td>
    </tr>
  );
}

export default SelectRoom;