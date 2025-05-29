import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BsTrash, BsPlus } from 'react-icons/bs';
import { FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Header from '../Header';
import InfoHover from '../../InfoHover';
import { getToken, getClass } from '../../validator';
import ManageDates from './ManageDates';
import { MdLoop } from 'react-icons/md';
import { showConfirmPopup } from '../../reactPopupService'

function PageActivity() {
    const { activity_id } = useParams();
    const navigate = useNavigate();
    const [professor, setProfessor ] = useState(null);
    const [activity, setActivity] = useState(null);
    const [room_list, setRoomList] = useState([]);
    const [no_room_list, setNoRoomList] = useState([]);
    const [deleted_list, setDeletedList] = useState([]);
    const [instructions, setInstructions] = useState('');
    const [showInstructionInputs, setShowInstructionInputs] = useState(false);
    const [course_code, setCourseCode] = useState(null);
    const [section, setSection] = useState(null);
  
    useEffect(() => {
        if (!professor) {
            const init = async () => await getToken();
            init().then(token => token ? setProfessor(getClass(token, 'Professor')) : navigate('/error/404'));
        } else {
            renderActivity();
        }
    }, [professor])

    async function renderActivity () {
        const act_info = await professor.getActivityDetails(activity_id);
        setActivity(act_info.activity_class);
        setInstructions(act_info.activity_class.instructions);
        setRoomList(act_info.rooms.filter(room => room.owner_id !== ''));
        setDeletedList(act_info.rooms.filter(room => room.owner_id === ''));
        setNoRoomList(act_info.no_rooms);

        setCourseCode(act_info.course_code);
        setSection(act_info.section);
    
        document.title = `Activity · ${act_info.activity_class.activity_name}`;
    }
    
    async function spectateRoom (room_id) {
        navigate(`/room/${room_id}`);
    }

    async function updateInstructions () {
        setShowInstructionInputs(false);

        const result = await activity.updateInstructions(instructions);
        if (result) {
            toast.success('Instructions successfully updated.');
            await renderActivity();
        }
    }

    async function deleteActivity () {
        const confirm1 = await showConfirmPopup({
            title: 'Delete An Activity',
            message: `Are you sure you want to delete the activity ${activity.activity_name}?`,
            confirm_text: 'Delete',
            cancel_text: 'Cancel',
        });
        
        if (confirm1) {
            const confirm2 = await showConfirmPopup({
                title: 'Delete An Activity',
                message: `Deleting this activity is irreversible and students will lose their work. Do you want to continue?`,
                confirm_text: 'Continue Deleting',
                cancel_text: 'Cancel',
            });
        
            if (confirm2) {
                const deleted = await activity.deleteActivity();
                if (deleted) {
                    navigate(`/dashboard/${activity.class_id}/all`);
                }
            }
        }
    }

    return (
        <>
        {professor && activity && room_list &&
        <>
            <Header user={professor} base={'Activity'} name={activity.activity_name}/>
            <div id='activity-main'> 
                <div id='activity-container' className='flex-column'>
                    <div id='activity-header'>
                        <div className='flex-row items-center'>
                            <h2>{activity.activity_name}</h2>
                            <button className='reload-btn items-center' onClick={renderActivity}>
                                <MdLoop size={24} />
                            </button>
                        </div>
                        <div className='two-column-grid'>
                            <label>Course: <b>{course_code}</b></label>
                            <label>Section: <b>{section}</b></label>
                        </div>
                    </div>
                    <div className='flex-column'>
                    <h3 className='flex-row items-center'>Instructions<InfoHover size={18} info={'The instructions to be followed by the students for this activity.'}/></h3>
                    {!showInstructionInputs &&
                        <p className='instructions'>{activity.instructions}</p>
                    }
                    {showInstructionInputs &&
                        <textarea   
                            className='instructions'
                            value={instructions} 
                            onChange={(e) => setInstructions(e.target.value)}/>
                    }
                        <div>
                            {showInstructionInputs &&
                                <button className='create-btn' onClick={updateInstructions}>Save</button>
                            }
                            <button 
                                className={`${!showInstructionInputs ? 'create-btn' : 'cancel-btn'}`} 
                                onClick={() => setShowInstructionInputs(!showInstructionInputs)}>
                                {!showInstructionInputs ? 'Edit Instructions' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                    <div id='activity-room-list'>
                        <h3 className='flex-row items-center'>Rooms<InfoHover size={18} info={'The list of rooms assigned for each team in this activity. Rooms will be created as teams join the activity.'}/></h3>
                            <div className='two-column-grid'>
                            {room_list.length > 0 && room_list.map((room, index) => {
                                return (
                                    <div className={`assigned-item flex-row items-center`} onClick={() => {spectateRoom(room.room_id)}} key={index}>
                                        <div className='col-1'>{index + 1}</div>
                                        <div className='col-2'>
                                            <label className='single-line'>{room.room_name.slice(0, -4)}<span>{room.room_name.slice(-4)}</span></label>
                                        </div>
                                        <div className='col-3 flex-row'>
                                            <label><Link to={`/room/${room.room_id}`} className='items-center'>View Room <FaChevronRight size={18}/></Link></label>
                                        </div>
                                    </div>
                                )
                            })}
                            {deleted_list.length > 0 && deleted_list.map((del, index) => {
                                return (
                                    <div className={`assigned-item flex-row items-center team-deleted`} key={index}>
                                        <div className='col-1'>{room_list.length + index + 1}</div>
                                        <div className='col-2'>
                                            <label className='single-line'>{del.room_name.slice(0, -4)}<span>{del.room_name.slice(-4)}</span></label>
                                        </div>
                                        <div className='col-3 flex-row'>
                                            <label><Link to={`/room/${del.room_id}`} className='items-center'>View Room <FaChevronRight size={18}/></Link></label>
                                        </div>
                                    </div>
                                )
                            })}
                            {no_room_list.length > 0 && no_room_list.map((team, index) => {
                                return (
                                    <div className={`assigned-item flex-row items-center no-room`} key={index}>
                                        <div className='col-1'>{room_list.length + deleted_list.length + index + 1}</div>
                                        <div className='col-2'>
                                            <label className='single-line'>{team.team_name}</label>
                                        </div>
                                        <div className='col-3 flex-row'>
                                            <b>No Room Yet</b>
                                        </div>
                                    </div>
                                )
                            })}

                            </div>
                    </div>
                    <ManageDates activity={activity} renderActivity={renderActivity}/>

                    <div id='activity-footer'>
                    <Link to={`/dashboard/${activity.class_id}/all`}>&lt; BACK TO DASHBOARD</Link>
                        <button id='delete-btn' onClick={deleteActivity}><BsTrash size={20}/><label>Delete Activity</label></button>
                    </div>
                </div>
            </div>
        </>
        }
        </>
    )
}

export default PageActivity