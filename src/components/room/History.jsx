import React, { useState, useEffect } from 'react'
import { IoIosArrowDown } from "react-icons/io";
import { diffLines } from 'diff';
import convertToReadable from './utils/convertToReadable'

// Component that tracks and displays file changes and user contributions
function History({ viewCount, file, socket, rightDisplay }) {
  // State management for history tracking
  const [history, setHistory] = useState(null);
  const [contributions, setContributions] = useState(null);
  const [retrieved, setRetrieved] = useState(true);
  const [options, setOptions] = useState('all');
  
  // Function to fetch file history from server
  function getHistory() {
    setHistory(null);
    setContributions(null);
    
    socket.emit('get_history', { 
      file_id: file.file_id,
    });
  }

  // Trigger history fetch when file changes
  useEffect(() => {
    if (file) {
      setRetrieved(true);
      getHistory();
    }
  }, [file])
  
  // Socket listeners for history updates
  useEffect(() => {
    // Fetch history on initial load
    socket.on('get_history_result', ({ status, history, contributions }) => {
      if (status === 'ok') {
        setHistory(history);
        // Show contributions if user is a professor that can view contributions
        if (viewCount) {
          setContributions(contributions);
        }
      } else {
        setRetrieved(false)
      }
    });

    // Track real-time edit contributions if the user is has access
    if (viewCount) {
      socket.on('add_edit_count_result', ({ file_id, user_id, first_name, last_name, cons }) => {
        if (file_id === file.file_id) {
          // Update existing contributor or add new one
          setContributions(prev => {
            if (prev.some(contribution => contribution.uid === user_id)) {
              return prev.map(cont => cont.uid === user_id ? { 
                ...cont, 
                edit_count: cont.edit_count + 1 
              } : cont);
            } else {
              return [...prev, { 
                uid: user_id, 
                first_name, 
                last_name, 
                edit_count: 1
              }];
            }
          });
        }
      });
    }
    
    // Handle history updates in real-time
    socket.on('reupdate_history', ({ status, file_id, new_history }) => {
      if (status === 'ok' && file.file_id === file_id) {
        // stores previous history
        const prev_history = history ? history : [];
        
        setHistory(null);

        if (history.length !== 0) {
          // Calculate edit count differences between previous and new history's contributions
          new_history.contributions = new_history.contributions.map(cont => {
            const last_rec = history[0].contributions.find(c => c.uid === cont.uid);
            if (!last_rec) return cont;
            return { ...cont, diff: cont.edit_count - last_rec.edit_count };
          });
        }    
        // Sort contributions by edit count
        new_history.contributions.sort((a, b) => b.edit_count - a.edit_count);

        // Add new history to the top of the list
        setTimeout(() => {
          setHistory([new_history, ...prev_history]);
        }, 500);
      }
    }); 

    return () => {
      socket.off('get_history_result');
      socket.off('add_edit_count_result');
      socket.off('reupdate_history');
    }
  }, [file, history]);

  return ( 
    <div id='history-div' className={`${rightDisplay !== 'history' &&  'inactive'}`}>
      <div className='history-container flex-column'>
        {retrieved &&
        <>
          {!history && !contributions &&
            <div className='loading-line'>
                <div></div>
            </div>
          }
          <div className='history-header flex-column'>
            <h4 className={`name ${!viewCount && 'view'}`}>{file.name}</h4>
            {viewCount &&
            <div id='history-buttons' className='flex-row'>
              <button 
                className={`${options === 'all' ? 'active' : ''}`}
                onClick={() => setOptions('all')}>
                  All
              </button>
              <button
                className={`${options === 'history' ? 'active' : ''}`}
                onClick={() => setOptions('history')}>
                  History
              </button>
              <button 
                className={`${options === 'contributions' ? 'active' : ''}`}
                onClick={() => setOptions('contributions')}>
                  Contributions
              </button>
            </div>
            }
            {contributions && options !== 'history' &&
              <div className='contribution-div'>
                <label className='edit-count-label'>Live Total Edit Count:</label>
                <div className='contribution-list'>
                  {contributions.length !== 0 && contributions.map((cont, index) => {
                    return (
                      <div className='contribution flex-row' key={cont.uid}>
                        <label className='single-line'>{cont?.last_name}, {cont?.first_name} </label>
                        :<span>{cont?.edit_count}</span>
                      </div>
                    )
                  })}
                </div>
                {contributions.length === 0 &&
                  <div className='contribution'>
                    None.
                  </div>
                }
              </div>
            }
          </div>
          <div id='history-list'>
            {history && history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((his, index) => {
              const prevContent = index < history.length - 1 ? history[index + 1].content : '';
              return (
                <HistoryItem
                  key={index}
                  index={index}
                  item={his}
                  prevContent={prevContent}
                  contributions={viewCount}
                  file_type={file.type} 
                  options={options}/>
              )
            })}
            {history && history?.length === 0 && !viewCount &&
              <div className='length-0'>Code history will appear here as you progress.</div>
            }
            {history && history?.length === 0 && viewCount &&
              <div className='length-0'>Code history will appear here as students code over time.</div>
            }
          </div>
        </>
        }
        {!retrieved &&
            <label>Error retrieving History.</label>
        }
      </div>
    </div>
  )
}

function HistoryItem ({ item, prevContent, contributions, options }) {
  const [createdAt, setCreatedAt] = useState(convertToReadable(new Date(item.createdAt), 'long'));

  const renderDiff = (current, previous) => {
    const diff = diffLines(previous || '', current);
    let line_num = 1;

    
    return (
      <pre className='history-code'>
        {diff.map((part, index) => {
          if (index !== diff.length - 1) part.value = part.value.slice(0, -1);
          const lines = part.value.split(/\r\n|\r|\n/);

          return lines.map((line, i) => {
            return (
              <div className={`history-line flex-row ${part.added && 'added'} ${part.removed && 'removed'}`} key={i}>
                <div className='line-number items-center'>{`${!part.removed ? line_num++ : '-'}`}</div>
                <div className='line-content'>{line}</div>
              </div>
              );
          });
        })}
      </pre>
    );
  };
  
  return (
    <div className='history-item flex-column'>
      <h4>{createdAt}</h4>
      <div className='body'>
          <div className={`history-content ${options === 'contributions' ? 'hidden' : ''}`}>
            {renderDiff(item.content, prevContent)}
          </div>
          {contributions &&
            <div className={`contribution-div ${options === 'history' ? 'hidden' : ''}`}>
              <label className='edit-count-label'>Contributed Edits:</label>
              <div className='contribution-list'>
                {item.contributions.length !== 0 && 
                  item.contributions.map((cont, index) => {
                  return (
                      <ContributionItem key={index} item={cont}/>
                  )})
                }
              </div>
            </div>
          }
      </div> 
    </div>
  )
}

function ContributionItem({ item }) {
  const [showLines, setShowLines] = useState(false);
  const count = () => {
    if (item?.diff === undefined) {
      return item.edit_count;
    } else {
      return <>{item.diff} <span>(Total: {item.edit_count})</span></>
    }
  }

  return (
    <>
    {item.diff !== 0 &&
      <>
      <div className={`contribution flex-row ${item.lines?.length <= 0 && 'margin'}`}>
        {item.lines && item.lines.length > 0 &&
        <button
          className={`drop-record items-center ${showLines && 'rotated'}`} 
          onClick={() => setShowLines(!showLines)}>
          <IoIosArrowDown size={14}/>
        </button>
        }
        <label className='single-line'>{item.last_name}, {item.first_name} </label>:
        <label className='count'>{count()}</label>
      </div>
      <div className={`contribution-record ${showLines && 'drop'}`}>
        {item.lines && item.lines.map((line, index) => {
          return (
            <div className='history-line flex-row' key={index}>
              <div className='line-number items-center'>{line.line}</div>
              <div className='line-content'>{line.text}</div>
            </div>
          )
        })}
      </div>
      </>
    }
    </>
  )
}

export default History
