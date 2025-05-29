import React, { useState, useEffect } from 'react'
import Avatar from 'react-avatar';
import { RiArrowDropDownLine, RiArrowLeftSLine } from 'react-icons/ri';
import { FiMinusCircle } from 'react-icons/fi';
import { positionChat, minimizeChat } from '../../components/room/utils/toggleChat';

function Chats({ room, socket }) {
    const [chats, setChats] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        try {
            socket.emit('load_messages', {
                room_id: room.room_id,
            });
    
            socket.on('messages_loaded', ({chat_data}) => {
                setChats(chat_data);
    
                setTimeout(() => {
                    const scroll = document.getElementById('chat-box-scroll');
                    scroll.scrollTop = scroll.scrollHeight;
                },100);
            });
    
            socket.on('update_messages', ({new_message}) => {
                setChats(prev => [...prev, new_message]);
    
                setTimeout(() => {
                    const scroll = document.getElementById('chat-box-scroll');
                    scroll.scrollTop = scroll.scrollHeight;
                },100);
            });
    
            socket.on('message_deleted', ({ createdAt }) => {
                setChats(prev => prev.filter(item => item.createdAt !== createdAt));
            });
        } catch (e) {
            alert('An error occured while rendering chats');
            console.error(e);
        }

        return () => {
            socket.off('messages_loaded');
            socket.off('update_messages');
            socket.off('message_deleted');
        }
    }, [room, socket]);

    function sendMessage(e) {
        e.preventDefault();
        
        socket.emit('send_message', {
            user_id: 'user_admin',
            first_name: 'PnCode Admin',
            last_name: '',
            room_id: room.room_id,
            message: message,
        });
        setMessage('');
    }

    function deleteMessage(createdAt) {
        const res = confirm('Delete this message?');
        if (res) {
            socket.emit('delete_message', {
                room_id: room.room_id,
                createdAt: createdAt,
            });
        }
    }

    return (
        <div className='flex-column' id='chat-box-container'>
            <div className='flex-row items-center' id='chat-box-header'>
                <label>Chat</label>
                <div className='flex-row items-center'>
                    <button id='chat-pos-btn' className='items-center' onClick={positionChat}>
                        <RiArrowLeftSLine size={18}/>
                    </button>
                    <button id='chat-min-btn' className='items-center' onClick={minimizeChat}>
                        <RiArrowDropDownLine size={22}/>
                    </button>
                </div>
            </div>
            <div id='chat-box-body' className='admin'>
                <div  className='flex-column' id='chat-box-scroll'>
                    <label id='first-message'>
                        Start a conversation to your teammates within this room.
                    </label>
                    {chats && chats.map((chat, index) => {
                        return (
                            <div className={`chat-box-message ${chat.sender_uid === 'user_admin' ? 'self': ''}`} key={index}>
                                <div className='chat-content items-center'>
                                    <div className='chat-box-message-avatar'>
                                        <Avatar name={`${chat.last_name} ${chat.first_name.charAt(0)}`} size='23' round={true} />
                                    </div>
                                    <div className='chat-box-message-text flex-column'>
                                        <label className='single-line name'>{chat.first_name}</label>
                                        <p className='chat_body'>{chat.chat_body}</p>
                                    </div>                                            
                                </div>
                                <div className='items-center chat-buttons'>
                                    <button className='items-center' onClick={() => deleteMessage(chat.createdAt)}>
                                        <FiMinusCircle size={20} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <form className='flex-row' id='chat-box-footer' onSubmit={(e) => {sendMessage(e)}}>
                {chats &&
                    <>
                        <input type='text' 
                        placeholder='Type a message...' 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required/>
                        <input type='submit' id='send-chat-btn' value='Send'/>
                    </>
                }
            </form>
        </div>
    )
}

export default Chats