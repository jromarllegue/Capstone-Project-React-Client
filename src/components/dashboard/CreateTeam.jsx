import React, { useState } from 'react';
import { BsXLg } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import InfoHover from '../InfoHover';

function CreateTeam({ user, class_info, exit }) {
  const [team_name, setTeamName] = useState('');
  const [ warning, setWarning ] = useState(null);
  const navigate = useNavigate();

  async function submitTeam(e) {
    e.preventDefault();
    setWarning(null);

    if (team_name.length > 30) {
      setWarning('Team name must be up to 30 characters long.');
      return;
    }

    const created = await user.createTeam(team_name, class_info.class_id);
    if (created) {
      toast.success('New team created successfully.');
      navigate(`/team/${created}`);
    }
  }

  return (
    <div id='popup-gray-background' className='items-start'>
      <div id='create-popup' className='team'>
        <div className='scroll'>
          <div id='popup-close'onClick={ exit } >
            <BsXLg size={ 18 }/>
          </div>
          <form autoComplete='off' onSubmit={(e) => submitTeam(e)}>
            <h3 className='head'>Create A New Team</h3>
            <div className='flex-row two-column-grid'>
                <label><b>Course:</b> {class_info.course_code}</label>
                <label><b>Section:</b> {class_info.section}</label>
            </div>
            <div className='flex-column'>
              <h4>Team Name <InfoHover size={16} info={'The name this team will be called.'}/> </h4>
              <input 
                className='input-data'
                type='text'
                maxLength={30}
                value={team_name}
                placeholder='Enter your team name'
                onChange={(e) => setTeamName(e.target.value)}
                required/>
                {warning && <label className='warning'>{warning}</label>}
            </div>
            <div className='flex-row footer'>
              <input 
                type='submit' 
                id='popup-submit' 
                value='Create Team' 
              />
              <input type='button' id='popup-cancel' value='Cancel' onClick={exit}/>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTeam;