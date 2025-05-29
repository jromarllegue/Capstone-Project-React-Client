import React, { useState, useEffect, useRef }  from 'react'
import { BsTrash } from 'react-icons/bs';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { BsX } from 'react-icons/bs'
import converToReadable from './utils/convertToReadable';
import updateFeedbackReacts from './utils/updateFeedbackReacts';
import { showConfirmPopup } from '../reactPopupService';
import _ from 'lodash';
import { EditorView, basicSetup } from 'codemirror';
import { editorType } from './utils/editorExtensions';
import { lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';

function Feedback({ room, user, socket, socketId, rightDisplay, setRightDisplay }) {

  // State management for feedback
  const [feedback, setFeedback] = useState([]);
  const [new_feedback, setNewFeedback] = useState('');
  const [code_quote, setCodeQuote] = useState(null);
  const editorViewRef = useRef(null);

  useEffect(() => {
    //receives selected code from the editor to display in the feedback form
    socket.on('add_code_quote', ({ quote }) => {
      setCodeQuote(quote);
      setRightDisplay('feedback');
    });

    return () => {
      socket.off('add_code_quote');
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
        editorViewRef.current = null;
      }
    }
  }, [socket]);

  // Main socket listeners for feedback operations
  useEffect(() => {  
    try {
      // Initial feedback loading function
      function getFeedback() {
        socket.emit('load_feedback', {
            room_id: room.room_id,
        });
      }
      getFeedback();

      // Displays loaded feedback from the server
      socket.on('feedback_loaded', ({ feedback }) => {
        setFeedback(feedback);

        if (feedback.length > 0) {
          setRightDisplay('feedback');
        }
      });

      // Handles feedback submission results
      socket.on('submit_feedback_result', ({ new_feedback }) => {
        // Update feedback list with the newly submitted feedback
        setFeedback((prev) => {
          const new_feedback_list = [...prev, new_feedback];
          return new_feedback_list.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        });
        setRightDisplay('feedback');        
      });

      // Handles feedback deletion results
      socket.on('delete_feedback_result', ({ feedback_id }) => {
        setFeedback(prev => prev.filter(item => item.feedback_id !== feedback_id));
      });

      // Handles feedback reactions
      socket.on('new_feedback_react', ({ feedback_id, react, socket_id, action }) => {
        // Update feedback list with new reactions if the reaction is not from the current user
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

  //removes code quote from feedback form
  function removeSelectedQuote() {
    setCodeQuote(null);
    if (editorViewRef.current) {
      editorViewRef.current.destroy();
      editorViewRef.current = null;
    }
  }


   // Handle feedback submission
  function submitFeedback(e) {
    e.preventDefault();
    if (user.position === 'Professor') {
      room.submitFeedback(socket, new_feedback, user.uid, user.first_name, user.last_name, code_quote);
      setCodeQuote(null);
    }
    setNewFeedback('');
  }

   // Handle student reactions to feedback
  function reactToFeedback(feed) {
    if (user.position === 'Student') {
      const react = {
        uid: user.uid,
        first_name: user.first_name,
        last_name: user.last_name,
      };

      let action = 'unheart';
      if (!feed.reacts.some((u) => u.uid === user.uid)) {
        action = 'heart';
      }
      
      //Quickly update the feedback list with the new reaction for the current user
      updateFeedbackReacts(setFeedback, feed.feedback_id, react, action);

      // Send the new reaction for the other users in their feedback list
      reactRoom(feed.feedback_id, react, action);
    }
  }

  // Debounced function to prevent rapid socket emissions for reactions
  const reactRoom = _.debounce((feedback_id, react, action) => {
    room.reactToFeedback(socket, feedback_id, react, action)
  }, 1000);
  
  // Handle feedback deletion
  async function deleteFeedback(feedback_id) {
    const result = await showConfirmPopup({
      title: 'Delete Feedback',
      message: 'Do you want to delete your feedback?',
      confirm_text: 'Delete',
      cancel_text: 'Cancel',
    });

    // If the user confirms the deletion, delete the feedback
    if (result) {
      room.deleteFeedback(socket, feedback_id);
    }
  }

  return (
    <div id='feedback-div' className={`${rightDisplay !== 'feedback' && 'inactive'}`}>
      <div id='feedback-container' className='flex-column'>
        <h3>Feedback</h3>
        {user.position === 'Professor' &&
        <form className='flex-column' id='feedback-form' onSubmit={(e) => submitFeedback(e)}>
          <label className='name'>{user.first_name} {user.last_name}</label>
          <textarea
            value={new_feedback}
            placeholder='Enter feedback here...'
            onChange={(e) => setNewFeedback(e.target.value)}
            required
          />
            {code_quote && (
            <div className={`code-quote-container ${!code_quote && 'none'}`}>       
              <div className='code-quote flex-row'>
                <label className='quote-title'>
                  {code_quote.file_name}
                  <span>(line: {`${code_quote.fromLine !== code_quote.toLine 
                    ? `${code_quote.fromLine} - ${code_quote.toLine}`
                    : `${code_quote.fromLine}` 
                  }`})</span>
                </label>
                <button 
                  type='button' 
                  className='quote items-center'
                  onClick={removeSelectedQuote}>
                  <BsX size={20}/>
                </button>
              </div>
              <QuotedCode quoted_code={code_quote} editorView={editorViewRef.current}/>
            </div>
            )}
          <input type='submit' value='Add Feedback' />
        </form>
        }
        {!feedback &&
            <div className='loading-line'>
              <div></div>
            </div>
        }
        {feedback && feedback.length > 0 && feedback.map((feed, index) => {
          const date = converToReadable(new Date(feed.createdAt), 'short');
          const reacted = feed.reacts?.some((u) => u.uid === user.uid);

          return (
            <div className='feedback-item flex-column' key={index}>
              <label className='name'>
                {feed.first_name} {feed.last_name}
              </label>
              <label className='date'>{date}</label>
              <label className='feedback-body'>{feed.feedback_body}</label>
              {user.position === 'Professor' &&
                <button className='delete' onClick={() => deleteFeedback(feed.feedback_id)}>
                  <BsTrash size={20} />
                </button>
              }
              {feed?.quoted_code &&
                <div className='code-quote-container'>       
                  <div className='code-quote flex-row'>
                    <label className='quote-title'>
                      {feed.quoted_code.file_name}
                      <span>(line: {`${feed.quoted_code.fromLine !== feed.quoted_code.toLine 
                        ? `${feed.quoted_code.fromLine} - ${feed.quoted_code.toLine}`
                        : `${feed.quoted_code.fromLine}` 
                      }`})</span>
                    </label>
                  </div>
                  <QuotedCode key={index} id={feed.feedback_id} quoted_code={feed.quoted_code}/>
                </div>
              }
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
                <button className='react items-center' onClick={() => reactToFeedback(feed)}>
                  {user.position === 'Student' && reacted && 
                    <FaHeart size={18} color={'#dc3545'} />
                  }
                  {user.position === 'Student' && !reacted &&
                    <FaRegHeart size={18} color={'var(--gray-dark)'}/>
                  }
                  {user.position === 'Professor' && 
                    <FaHeart size={18} color={'#dc3545'}/>
                  }
                </button>
              </div>
            </div>
          )
        })}
        {feedback && feedback.length === 0 && user.position === 'Student' &&
          <label className='length-0'>Feedback by your professor will appear here.</label>
        }
        {feedback && feedback.length === 0 && user.position === 'Professor' &&
          <label className='length-0'>Your feedback will be seen by your students here.</label>
        }
      </div>
    </div>
  )
}

// Component for displaying quoted code in feedback
function QuotedCode({ id, quoted_code, editorView }) {
  useEffect(() => {
    if (editorView) editorView.destroy();

    // Setup CodeMirror editor instance for code display
    const state = EditorState.create({
      doc: quoted_code.text,
      extensions: [
        basicSetup,
        editorType(quoted_code.file_name.split('.').pop()),
        lineNumbers({
          formatNumber: (n) => String(n - 1 + quoted_code.fromLine)
        }),
        EditorView.theme({
          "&.cm-focused .cm-line.cm-activeLine": {
            backgroundColor: "transparent"
          },
          ".cm-line.cm-activeLine": {
            backgroundColor: "transparent" 
          },
          ".cm-gutters": {
            backgroundColor: "rgba(232, 232, 232, .3)",
            border: "none",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "transparent"
          }
        }),
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
        EditorView.lineWrapping,
      ],
    });

    // Create and mount editor view
    const parent_div = document.getElementById(`code-quote-editor${id ? `-${id}` : ''}`);
    parent_div.innerHTML = '';
    const view = new EditorView({ state, parent: parent_div });

    if (editorView) editorView = view;
  }, [quoted_code]);
  
  return (
    <div className='quote-editor' id={`code-quote-editor${id ? `-${id}` : ''}`}/>
  )
}

export default Feedback