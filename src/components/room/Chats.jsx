import React, { useState, useEffect } from 'react'
import Avatar from 'react-avatar';
import { RiArrowDropDownLine, RiArrowLeftSLine } from 'react-icons/ri';
import { FiMinusCircle } from 'react-icons/fi';
import { positionChat, minimizeChat } from './utils/toggleChat';
import { showConfirmPopup } from '../reactPopupService';

// Main chat component handling real-time messaging between team members
function Chats({room, socket, user}) {
    // State for storing chat messages and current message input
    const [chats, setChats] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        try {
            // Request existing messages when component mounts
            socket.emit('load_messages', {
                room_id: room.room_id,
            });
    
            // Handle initial messages load
            socket.on('messages_loaded', ({chat_data}) => {
                setChats(chat_data);
    
                // Auto-scroll to latest message
                setTimeout(() => {
                    const scroll = document.getElementById('chat-box-scroll');
                    scroll.scrollTop = scroll.scrollHeight;
                },100);
            })

            // Handle new incoming messages
            socket.on('update_messages', ({new_message}) => {
                setChats(prev => [...prev, new_message]);
    
                // Auto-scroll and show chat if minimized for new messages
                setTimeout(() => {
                    const scroll = document.getElementById('chat-box-scroll');
                    scroll.scrollTop = scroll.scrollHeight;

                    const chat_box = document.getElementById('chat-box-container');
                    // Show chat box if message is from another user and chat is hidden
                    if (new_message.sender_uid !== user.uid && chat_box.classList.contains('hidden')) {
                        minimizeChat();
                    }
                },100);
            });

             // Handle message deletion
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
    }, [room]);

    // Handle sending new messages
    function sendMessage(e) {
        e.preventDefault();
        
        socket.emit('send_message', {
            user_id: user.uid,
            first_name: user.first_name,
            last_name: user.last_name,
            room_id: room.room_id,
            message: message,
        });
        
        // Clear input after sending
        setMessage('');
    }


    // Handle message deletion with confirmation
    async function deleteMessage(createdAt) {
        const res = await showConfirmPopup({
            title: 'Delete Message',
            message: 'Do you want to delete this message?',
            confirm_text: 'Delete',
            cancel_text: 'Cancel',
        });
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
            <div id='chat-box-body'>
                <div  className='flex-column' id='chat-box-scroll'>
                    <label id='first-message'>
                        Start a conversation to your teammates within this room.
                    </label>
                    {chats && chats.map((chat, index) => {
                        const self = chat.sender_uid === user.uid;
                        return (
                            <div className={`chat-box-message ${self && 'self'}`} key={index}>
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
                                    {self &&
                                        <button className='items-center' onClick={() => deleteMessage(chat.createdAt)}>
                                            <FiMinusCircle size={20} />
                                        </button>
                                    }
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
