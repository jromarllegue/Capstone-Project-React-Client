import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom';
import img from '../../../assets/profile.png'
import UserAvatar from '../UserAvatar';

function SelectTeam({uid, team, hoverable}) {
    const [showMembers, setShowMembers] = useState(false);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
    const hoverTimer = useRef(null);
    const linkRef = useRef(null);

    const handleMouseEnter = () => {
        hoverTimer.current = setTimeout(() => {
            setShowMembers(true);
        }, 800);
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimer.current);
        setShowMembers(false);
    };

    const handleMouseMove = (e) => {
        setHoverPosition({ x: e.clientX, y: e.clientY });
    };
        
    return (
        <>
            <Link 
                ref={linkRef}
                className='team-box flex-column' 
                to={`/team/${team.team_id}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}>
                {team.members.some(member => member.uid === uid) && 
                    <div className='my-team'>My Team</div>
                }
                <div className='team-box-images'>
                    {team.members.slice(0,4).map((member, index) => {
                        return (
                            <img 
                                key={index}
                                className='team-image' 
                                src={img} 
                                alt={member.first_name} 
                            />
                        );
                    })}
                </div>
                <label className='name'>{team.team_name}</label>
                <label className='members'>Members: {team.members.length}</label>
            </Link>
            {hoverable && showMembers && (
                <div 
                    className="team-hover-members"
                    style={{
                        left: hoverPosition.x,
                        top: hoverPosition.y,
                    }}>
                    {team.members.map((member, index) => (
                        <div key={index} className="member-name flex-row items-center">
                            <UserAvatar name={`${member.last_name.charAt(0)}, ${member.first_name.charAt(0)}`} size={20}/>
                            {member.last_name}, {member.first_name}
                        </div>
                    ))}
                    {team.members.length === 0 && <div className='member-name'>No team members yet.</div>}
                </div>
            )}
        </>
    )
}

export default SelectTeam
