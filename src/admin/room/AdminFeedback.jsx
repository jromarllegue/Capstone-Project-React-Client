import React, { useState, useEffect }  from 'react'
import { BsTrash } from 'react-icons/bs';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import converToReadable from '../../components/room/utils/convertToReadable';
import updateFeedbackReacts from '../../components/room/utils/updateFeedbackReacts';
import { showConfirmPopup } from '../../components/reactPopupService';

function Feedback({ room, socket, socketId, rightDisplay, setRightDisplay }) {
  const [feedback, setFeedback] = useState([]);
  const [new_feedback, setNewFeedback] = useState('');

  useEffect(() => {  
    try {
      function getFeedback() {
        socket.emit('load_feedback', {
            room_id: room.room_id,
        });
      }
      getFeedback();

      socket.on('feedback_loaded', ({ feedback }) => {
        setFeedback(feedback);

        if (feedback.length > 0) {
          setRightDisplay('feedback');
        }
      });

      socket.on('submit_feedback_result', ({ new_feedback }) => {
        setFeedback((prev) => {
          const new_feedback_list = [...prev, new_feedback];
          return new_feedback_list.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        });
        
        setRightDisplay('feedback');
      });

      socket.on('delete_feedback_result', ({ feedback_id }) => {
        setFeedback(prev => prev.filter(item => item.feedback_id !== feedback_id));
      });

      socket.on('new_feedback_react', ({ feedback_id, react, socket_id, action }) => {
        if (socket_id !== socketId) {
          updateFeedbackReacts(setFeedback, feedback_id, react, action);
        }
      });
    } catch (e) {
      alert('An error occured while rendering feedback.');
      console.error(e);
    }

    return () => {
      socket.off('feedback_loaded');
      socket.off('submit_feedback_result');
      socket.off('delete_feedback_result');
      socket.off('new_feedback_react');
    }
  }, [room, socketId]);

  function submitFeedback(e) {
    e.preventDefault();
 
    socket.emit('submit_feedback', {
        room_id: room.room_id,
        user_id: 'user_admin',
        first_name: '',
        last_name: 'PnCode Admin',
        new_feedback: new_feedback,
    });
    setNewFeedback('');

    document.getElementById('feedback')?.focus();
  }

  async function deleteFeedback(feedback_id) {
    const res = await showConfirmPopup({
      title: 'Delete Message',
      message: 'Do you want to delete this feedback?',
      confirm_text: 'Delete',
      cancel_text: 'Cancel',
    });

    if (res) {
        socket.emit('delete_feedback', {
            room_id: room.room_id,
            feedback_id
        }); 
    }
  }

  return (
    <div id='feedback-div' className={`${rightDisplay !== 'feedback' && 'inactive'}`}>
      <div id='feedback-container' className='flex-column'>
        <h3>Feedback</h3>
        <form className='flex-column' id='feedback-form' onSubmit={(e) => submitFeedback(e)}>
          <label className='name'>PnCode Admin</label>
          <div className='flex-row'>
            <textarea
            id='feedback'
            value={new_feedback} 
            placeholder='Enter feedback here...' 
            onChange={e => setNewFeedback(e.target.value)}
            required/>
          </div>
          <div>
            <input type='submit' value='Add Feedback'/>
          </div>
        </form>
        {feedback && feedback.length > 0 && feedback.map((feed, index) => {
          const date = converToReadable(new Date(feed.createdAt), 'short');

          return (
            <div className='feedback-item flex-column' key={index}>
              <label className='name'>
                  {feed.first_name} {feed.last_name}
                  {index === 0 && <span>•<span>New</span></span>}
              </label>
              <label className='date'>{date}</label>
              <label className='feedback-body'>{feed.feedback_body}</label>
              <button className='delete' onClick={() => deleteFeedback(feed.feedback_id)}>
                <BsTrash size={20} />
              </button>
              <div className='flex-row items-center react-div'> 
                <div className='count'>
                  {feed.reacts.length} 
                  {feed.reacts.length > 0 &&
                  <div className='reacted-list flex-column'>
                    {feed.reacts.map((u, index) => (
                    <label key={index} className='reacted-user'>
                      {u.first_name} {u.last_name}
                    </label>
                    ))}
                  </div>
                  }
                </div>
                <button className='react items-center'>
                  <FaHeart size={18} color={'#dc3545'}/>
                </button>
              </div>
          </div>
        )})}
        {feedback && feedback.length === 0 &&
          <label className='length-0'>No feedback from the professor yet.</label>
        }
      </div>
    </div>
  )
}

export default Feedback