import React from 'react'

function ShowId({showId, setShowId}) {
  return (
    <div className='show-id flex-row items-center'>
        <label>Show IDs</label>
        <div className='items-center'>
            <label className="switch">
                <input 
                type="checkbox" 
                checked={showId}
                onChange={() => setShowId(!showId)}
                />
                <span className="slider"></span>
            </label>
        </div>          
    </div>
    )
}

export default ShowId