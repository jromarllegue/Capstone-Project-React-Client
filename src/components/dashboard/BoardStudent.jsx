import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BsListUl } from 'react-icons/bs';
import { FaPlus } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import Header from './Header';
import Sidebar from './Sidebar';
import InfoHover from '../InfoHover';
import SelectRoom from './SelectRoom';
import SelectTeam from './SelectTeam';
import SelectActivity from './SelectActivity';
import CreateTeam from './CreateTeam';
import AddClass from './AddClass';
import { getClass } from '../validator';

function BoardStudent({ auth }) {
    const [student, setStudent ] = useState(getClass(auth, 'Student'));

    const { class_id, select } = useParams();
    const [class_info, setClassInfo] = useState(null);
    const [class_list, setClassList] = useState([]);

    const [list_teams, setListTeams] = useState([]);
    const [list_activities, setListActivities] = useState([]);
    const [list_solo, setListSolo] = useState([]);
    const [loading_teams, setLoadingTeams] = useState(true);
    const [loading_activities, setLoadingActivities] = useState(true);
    const [loading_solo, setLoadingSolo] = useState(true);
    const [team_count, setTeamCount] = useState(0);
    const [activity_count, setActivityCount] = useState(0);
    const [solo_count, setSoloCount] = useState(0);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAddClass, setShowAddClass] = useState(false);
    const [noCourse, setNoCourse] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        async function init() {
            const classes = await student.getEnrolledClasses();
            
            if (classes && classes.length > 0 && !classes.some(c => c.class_id === class_id)) {
                navigate(`/dashboard/${classes[0].class_id}/${select ? select : 'all'}`);
            }
            setClassList(classes);
            displayInformation(classes);

            setLoadingSolo(true);
            displaySoloRooms();
        }
        init();
    }, []);

    useEffect(() => {
        if (class_list.length  > 0) {
            displayInformation(class_list);
        }
    }, [class_id])

    async function displayInformation(classes = []) {
        if (classes.length > 0) {
            const info = classes.find((c) => c.class_id === class_id);
            if (info) {    
                setClassInfo({
                    class_id: info.class_id,
                    course_code: info.course_code,
                    course_title: info.course_title,
                    section: info.section,
                    professor: info.professor
                })

                displayTeams(class_id);
                displayActivities(class_id);    
            } else {
                navigate(`/dashboard/${classes[0].class_id}/${select ? select : 'all'}`);   
            }
        } else {
            setNoCourse(true);
            navigate('/dashboard');
        }
    };
    
    async function displaySoloRooms() {

        const rooms = await student.getSoloRooms();
        if (rooms) {
            setListSolo(rooms);
            setSoloCount(rooms.length);
        } else {
            setListSolo(null);
        }
        setLoadingSolo(false);
    }

    async function displayTeams (class_id) {
        setLoadingTeams(true);

        const teams = await student.getTeams(class_id);
        if (teams) {
            setListTeams(teams);
            setTeamCount(teams.length);
        } else {
            setListTeams(null);
        }
        setLoadingTeams(false); 
    }
    
    async function displayActivities(class_id) {
        setLoadingActivities(true);
        
        const activities = await student.getActivities(class_id)
        if (activities) {
            setListActivities(activities);
            setActivityCount(activities.length);
        } else {
            setListActivities(null);
        }
        setLoadingActivities(false); 
    }

    async function createSoloRoom() {
        const room = await student.createSoloRoom();

        if (room) {
            navigate(`/solo/${room}`);
            toast.success('New solo room has been created.');
        }
    }
    
    function openTeamPopup () {
        setIsModalOpen(true);
    }

    function showSidebar () {
        document.getElementById('sidebar-main').style.left = 0;
    }

    return (
        <>
        <Header user={student} base={'Dashboard'} name={class_info?.course_code} />
        <main id='dashboard-main'>
            <Sidebar user={student} courses={class_list} setShowAddClass={setShowAddClass} />
            <section className='dash-section flex-column'>
                <button id='dash-burger' className='items-center' onClick={ showSidebar }><BsListUl size={ 30 }/></button>
                <div className='display-content flex-column'>
                    {class_info &&
                    <div id='course-info' className='flex-column'>
                        <label className='full-title'>{class_info.course_code} {class_info.course_title}</label>
                        <label className='sub-title'>Section: {class_info.section}</label>
                        <label className='sub-title'>Professor: {class_info.professor}</label>
                    </div>
                    }
                    {class_info &&
                        <>
                            <div className={`separator ${(select === 'activities' || select === 'solo') && 'none'}`} id='show-teams'>
                                <div className='section-title'>
                                    <label className='items-center flex-row'>
                                        Teams <span>({team_count})</span> 
                                        <InfoHover size={18} info={'The list of teams created for this class. You can join one team at a time for one class.'} />
                                    </label>
                                </div>
                                {loading_teams &&
                                     <div className='in-retrieve'>Retrieving...</div>
                                }
                                {!loading_teams &&
                                    <>
                                    {list_teams &&
                                        <TeamBoard  
                                            uid={student.uid} 
                                            teams={list_teams} 
                                            openTeamPopup={openTeamPopup}/>
                                    }
                                    {!list_teams &&
                                     <div className='no-results'>Error. Failed Retrieving teams.</div>                                        
                                    }
                                    </>
                                }
                            </div>
                            <div className={`separator ${(select === 'teams' || select === 'solo') && 'none'}`} id='show-activities'>
                                <div className='section-title'>
                                    <label className='items-center flex-row'>
                                        Activities <span>({activity_count})</span> 
                                        <InfoHover size={18} info={'The list of activities created by your professor. A student must have a team to proceed to an activity.'} />
                                    </label>
                                </div>
                                {loading_activities &&
                                    <div className='in-retrieve'>Retrieving...</div>
                                } 
                                {!loading_activities &&
                                    <>
                                    {list_activities &&
                                        <ActivityBoard 
                                            activities={list_activities} 
                                            student={student} 
                                            class_id={class_id}/>
                                    }
                                    {!list_activities &&
                                        <div className='no-results'>Error. Failed Retrieving activities.</div>      
                                    }
                                    </>
                                }
                            </div>
                        </>
                    }
                    {!class_info && !noCourse &&
                        <div className='in-retrieve'><label>Loading class...</label></div>
                    } 
                    {noCourse &&
                        <div className='no-course'>
                            <label>No classes yet? Click <b>'+ Join Class'</b> on the sidebar.</label>
                        </div>
                    }
                    <div className={`separator ${(select === 'activities' || select === 'teams') && 'none'}`} id='show-solos'>
                        <div className='section-title'>
                            <label className='items-center flex-row'>
                                Solo Rooms <span>({solo_count})</span> 
                                <InfoHover size={18} info={'The list of rooms where you can practice your skills in coding by yourself. You can create up to 5 solo rooms.'} />
                            </label>
                        </div>
                        {loading_solo &&
                            <div className='in-retrieve'>Retrieving...</div>
                        }
                        {!loading_solo &&
                            <>
                            {list_solo &&
                                <>
                                    <SoloRoomBoard rooms={list_solo} displayInfo={displaySoloRooms}/>   
                                    <button className='create-btn' onClick={ createSoloRoom }>Create Solo Room</button>
                                </>

                            }
                            {!list_solo &&
                                <div className='no-results'>Error. Failed Retrieving solo rooms.</div>

                            }
                            </>
                        }
                    </div>
                </div>                
                {
                    isModalOpen && ( <CreateTeam 
                                        user={student} 
                                        class_info={class_info}
                                        exit={() => {setIsModalOpen(false)}} /> )
                }
                {
                    showAddClass && ( <AddClass 
                                    user={student}
                                    exit={() => {setShowAddClass(false)}} 
                                    /> )

                }
            
            </section>
        </main>
        </>
    )
}

export default BoardStudent


function TeamBoard({uid,  teams, openTeamPopup }) {
    teams.sort((a, b) => {
        const hasTargetMemberA = a.members.some(member => member.uid === uid);
        const hasTargetMemberB = b.members.some(member => member.uid === uid);
        
        if (hasTargetMemberA && !hasTargetMemberB) return -1;
        if (!hasTargetMemberA && hasTargetMemberB) return 1;

        return 0;
    });

    const [showPlus, setShowPlus] = useState(() => {
        const userHasTeam = teams.some(t => t.members.some(m => m.uid === uid));
        return !userHasTeam;
    });
    
    return (
        <div id='team-selection' className='flex-row'>
            {showPlus &&
                <button className='team-plus flex-column items-center' onClick={openTeamPopup}>
                    <span><FaPlus size={35}/></span>
                    <label>Create Team</label>
                </button> 
            }
            {teams.map((team) => (
                <SelectTeam 
                    key={team.team_id} 
                    uid={uid} 
                    team={team} 
                />
            ))}
        </div>
    )
}

function ActivityBoard({activities, student, class_id}) {
    const navigate = useNavigate();

    async function goToAssignedRoom(activity_id) {
        const room_id = await student.visitActivity(activity_id);

        if (room_id) {
            navigate(`/room/${room_id}`);
        }
    }

    if (activities.length === 0) {
        return ( <div className='no-results'>
                    You have no activity to do yet.
                </div> 
        );
    } else {
        return (<div id='activity-selection' className='flex-column items-center'>
                    {activities.map((activity, index) => (
                        <SelectActivity 
                            key={activity.activity_id}  
                            onClick={() => goToAssignedRoom(activity.activity_id)} 
                            activity={activity} 
                            index={index} />
                    ))}
                </div>
        )
    }
}

function SoloRoomBoard({rooms, displayInfo}) {
    if (rooms.length === 0) {
        return ( <div className='no-results'>
                    No room is created yet.
                </div> 
        );
    } else {
        return ( <table className='solo-table'>
                    <tbody>
                        <tr className='list-head'>
                            <th className='col-1'>#</th>
                            <th className='col-2'>Room Name</th>
                            <th className='col-3'>Date Updated</th>
                            <th className='col-4'></th>
                        </tr>
                        {rooms.map((room, index) => (
                            <SelectRoom 
                                key={room.room_id} 
                                room={room} 
                                index={index}
                                displayInfo={displayInfo}/>
                        ))}
                        
                    </tbody>
                </table> 
        );
    }
}