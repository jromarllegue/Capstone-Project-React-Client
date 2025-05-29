import React, { useEffect, useState } from 'react';
import convertTime from '../utils/convertTime';
import InfoHover from '../../InfoHover';

function ManageDates({activity, renderActivity}) {
    const [showAccessInputs, setShowAccessInputs] = useState(false);
    const [open_time, setOpenTime] = useState();
    const [close_time, setCloseTime] = useState();
    const [new_open_time, setNewOpenTime] = useState(activity.open_time);
    const [new_close_time, setNewCloseTime] = useState(activity.close_time);
    
    useEffect(() => {
        setOpenTime(convertTime(activity.open_time));
        setCloseTime(convertTime(activity.close_time));
    }, [activity.open_time, activity.close_time]);

    function toggleAccess(show) {
        const edit = document.getElementById('edit-timeframe');

        if (show === false) {
            setShowAccessInputs(true);
            edit.textContent = 'Cancel';
            edit.classList.value = 'cancel-btn'
        } else {
            setShowAccessInputs(false);
            edit.textContent = 'Edit Timeframe';
            edit.classList.value = 'create-btn'
        }
    }

    async function updateDates() {
        const updated = await activity.updateDates(new_open_time, new_close_time);

        if (updated) {        
            await renderActivity();    
            toggleAccess(true);
        }
    }

    return (
        <div id='display-dates'>
            <h3 className='flex-row items-center'>Access Timeframe<InfoHover size={18} info={'The range of time of day the students can access this activity.'}/></h3>
            <div className='two-column-grid'>
            {!showAccessInputs &&
            <div>
                <label>Open Time: </label>
                <label>{open_time}</label>
            </div>
            }
            {!showAccessInputs &&
                <div>
                    <label>Close Time: </label>
                    <label>{close_time}</label>
                </div>
            }
            {showAccessInputs &&
                <div>
                    <label>Open Time </label>
                    <input type='time' value={new_open_time} onChange={(e) => {setNewOpenTime(e.target.value)}}/>
                </div>
            }
            {showAccessInputs &&
                <div>  
                    <label>Close Time </label>
                    <input type='time' value={new_close_time} onChange={(e) => {setNewCloseTime(e.target.value)}}/>
                </div>
            }
            </div>
            {showAccessInputs &&
                <button className='create-btn' onClick={updateDates}>Save</button>
            }
            <button id='edit-timeframe' className='create-btn' onClick={() => toggleAccess(showAccessInputs)}>Edit Timeframes</button>
        </div>
    )
}


export default ManageDates;