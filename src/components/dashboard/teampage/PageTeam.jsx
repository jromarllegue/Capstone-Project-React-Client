import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BsTrash  } from 'react-icons/bs';
import { LuPencilLine } from 'react-icons/lu';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import { getToken, getClass } from '../../validator';
import Header from '../Header';
import UserAvatar from '../../UserAvatar';
import InfoHover from '../../InfoHover';
import AddMember from './AddMember';
import { showConfirmPopup } from '../../reactPopupService'

function PageTeam() {
  const { team_id } = useParams();
  const navigate = useNavigate();
  const [user, setUser ] = useState(null);
  const [team, setTeam] = useState(null);
  const [team_name, setTeamName] = useState('');
  const [showTeamNameInputs, setShowTeamNameInputs] = useState(false);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [permitted, setPermitted] = useState(true);
  const [course_code, setCourseCode] = useState(null);
  const [section, setSection] = useState(null);

  useEffect(() => {
    if (!user) {
      const init = async () => await getToken();
      init().then(token => token ? setUser(getClass(token, token.position)) : navigate('/error/404'));
    } else {
      renderTeam();
    }
  }, [user])

  async function renderTeam () {
    const team_info = await user.getTeamDetails(team_id);
    
    if (team_info.access === 'write') {
      setPermitted(true);

    } else if (team_info.access === 'read') {
      setPermitted(false);
    }
    setTeam(team_info.team_class);
    setTeamName(team_info.team_class.team_name);

    setCourseCode(team_info.course_code);
    setSection(team_info.section);

    document.title = `Team · ${team_info.team_class.team_name}`;
  }


  async function removeMember(uid) {
    const result = confirm('Are you sure you want to remove this student in the team?');

    if (result) {
      await team.removeMember(uid);
      renderTeam();
    }
  }

  async function deleteTeam() {
    const confirm1 = await showConfirmPopup({
      title: 'Delete A Team',
      message: `Are you sure you want to delete the team ${team.team_name}?`,
      confirm_text: 'Delete',
      cancel_text: 'Cancel',
    });
  
    if (confirm1) {
      const confirm2 = await showConfirmPopup({
        title: 'Delete A Team',
        message: `Deleting this team is irreversible and its members will lose a team. Do you want to continue?`,
        confirm_text: 'Continue Deleting',
        cancel_text: 'Cancel',
      });
    
      if (confirm2) {
        const deleted = await team.deleteTeam();

        if (deleted) {
          navigate(`/dashboard/${team.class_id}/all`);
        }
      }
    }
  }

  async function saveTeamName(e) {
    e.preventDefault();
    if (showTeamNameInputs) {
      const result = await team.updateTeamName(team_name);

      if (result) {
        toast.success('Team name updated.');
        await renderTeam();
      }
    }
    setShowTeamNameInputs(!showTeamNameInputs);
  };

  function showSearch() {    
    const add = document.getElementById('add-member');

    if (!showMemberSearch) {
      setShowMemberSearch(true);
      add.textContent = 'Cancel';
      add.classList.value = 'cancel-btn';
    } else {
      setShowMemberSearch(false);
      add.textContent = 'Add Member';
      add.classList.value = 'create-btn';
    }
  }

  return (
    <>
    {user && team &&
    (
      <>
        <Header user={user} base={'Team'} name={team.team_name} />
        <div id='team-main'> 
          <div id='team-container' className='flex-column'>
            <div id='team-header'>
              <div className='flex-row items-center'>
                {!showTeamNameInputs &&
                  <h2>{team.team_name}</h2>
                }
                {showTeamNameInputs &&
                  <form onSubmit={e => saveTeamName(e)}>
                    <input 
                      type='text' 
                      className='page-name-input' 
                      value={team_name} 
                      onChange={(e) => setTeamName(e.target.value)} 
                      required/>
                  </form>
                }
                {user.position === 'Professor' &&
                <button className='reload-btn items-center' onClick={(e) => saveTeamName(e)}>
                    <LuPencilLine size={24} />
                </button>
                }
                <button className='reload-btn items-center' onClick={renderTeam}>
                  <MdLoop size={24} />
                </button>
              </div>
              <div className='two-column-grid'>
                <label>Course: <b>{course_code}</b></label>
                <label>Section: <b>{section}</b></label>
              </div>
            </div>
            <div id='team-members-list'>
              <h3 className='flex-row items-center'>Members<InfoHover size={18} info={'The students who are members of this team. A team can have maximum of 10 members.'}/></h3>
              <table id='members-table'>
                <tbody>
                {team && team.members.map((member, index) => {
                  return (
                    <tr className={`team-member ${user.position === 'Professor' && 'hoverable'}`} key={index}>
                      <td className='col-1'>
                        <UserAvatar name={`${member.last_name}, ${member.first_name.charAt(0)}`} size={30}/>
                      </td>
                      <td className='col-2'>
                        <label className='single-line'>{member.last_name}, {member.first_name}</label>
                      </td>
                      <td className='col-3'>
                        {permitted && user.position === 'Professor' &&
                          <button className='remove-btn' onClick={() => {removeMember(member.uid)}}>Remove</button>
                        }
                      </td>
                    </tr>
                  )
                })}
                {team && team.members.length === 0 &&
                  <tr className='team-member'>
                    <td className='col-1'>
                       This team has no members yet.
                    </td>
                  </tr>

                }
                </tbody>
              </table>
              {permitted &&
                <button 
                  className={`${!showMemberSearch ? 'create' : 'cancel'}-btn`} 
                  onClick={() => {setShowMemberSearch(!showMemberSearch)}}>
                  {!showMemberSearch ? 'Add A Member' : 'Cancel'}
                </button>
              }
              {permitted && showMemberSearch &&
                <AddMember team={team} user={user} renderTeam={renderTeam}/>
              }
            </div>
            <div id='team-footer'>
              
              <Link to={`/dashboard/${team.class_id}/all`}>&lt; BACK TO DASHBOARD</Link>
              {permitted && user.position === 'Professor' &&
                <button id='delete-btn' onClick={deleteTeam}><BsTrash size={20}/><label>Delete Team</label></button>
              }
            </div>
          </div>
        </div>
      </>
    )}
    </>
  )
}

export default PageTeam
