import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TbClockCheck } from "react-icons/tb";
import { BsCheck2All } from "react-icons/bs";
import { showAlertPopup, showConfirmPopup } from '../reactPopupService'

const createdAt = (notif) => {
  const diff = new Date() - new Date(notif.createdAt);
  const timeUnits = [
      { value: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)), unit: 'year' },
      { value: Math.floor(diff / (1000 * 60 * 60 * 24 * 30)), unit: 'month' },
      { value: Math.floor(diff / (1000 * 60 * 60 * 24 * 7)), unit: 'week' },
      { value: Math.floor(diff / (1000 * 60 * 60 * 24)), unit: 'day' },
      { value: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), unit: 'hour' },
      { value: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), unit: 'minute' }
  ];

  for (const { value, unit } of timeUnits) {
      if (value > 0) {
          return `${value} ${unit}${value > 1 ? 's' : ''} ago`;
      }
  }
  return 'just now';        
}

function Notifications({ user, notifications, setNotifications }) {
  const navigate = useNavigate();
  const [noUnread, setNoUnread] = useState(false);
  
  useEffect(() => {
      if (notifications?.length > 0) {
        setNoUnread(false);
      } else {
        setNoUnread(true);
      }
  }, [notifications]);

  async function clickTeamNotif(notif) {
    filterOut(notif.notif_id);
    navigate(`/team/${notif.subject_id}`);
  }

  async function clickClassNotif(notif) {
    if (notif.for === 'accepted') {

      await filterOut(notif.notif_id);
      window.location.href = `/dashboard/${notif.subject_id}/all`;

    } else if (notif.for === 'rejected') {
      await showAlertPopup({
        title: 'Joining Class Rejected',
        message: `${notif.source} has ${notif.for} your request to join ${notif.subject_name}. If this is a mistake, you can request again and contact your professor to accept you.`,
        okay_text: 'Okay'
      })
      await filterOut(notif.notif_id);
    }
  }  

  async function clickActivityNotif(notif) {
    try {
      if (user.position === 'Student') {
        const room_id = await user.visitActivity(notif.subject_id);

        if (room_id) {
          toast.success('Redirecting you to your team\'s assigned room...');
          navigate(`/room/${room_id}`);
        }
      }
    } catch (e) {
      console.error(e.message)
    }
    filterOut(notif.notif_id);
  }      

  async function clickRoomNotif(notif) {
    navigate(`/room/${notif.subject_id}`);

    filterOut(notif.notif_id);
  }

  async function clickInviteNotif(notif) {
    const confirmed = await showConfirmPopup({
      title: 'Team Invite',
      message: `${notif.source} invites you to join the team: ${notif.subject_name}. Will you accept?`,
      confirm_text: 'Accept',
      cancel_text: 'Reject',
    });

    if (confirmed === true) {
      const res = await user.acceptTeamInvite(notif.subject_id);

      if (res) {
        toast.success('Team invite accepted!');
        navigate(`/team/${notif.subject_id}`);
      }
      filterOut(notif.notif_id);
      
    } else if (confirmed === false) {
      toast.success('You have rejected the team invite.');
      filterOut(notif.notif_id);
    }
  }

  async function clickRemoveNotif(notif) {
    await showAlertPopup({
      title: 'You Are Removed',
      message: `You have been removed from this ${notif.for} ${notif.subject_name}.`,
      okay_text: 'Okay',
    });

    filterOut(notif.notif_id);
  };

  async function clickAddNotif(notif) {
    navigate(`/${notif.for !== 'class' ? notif.for : 'dashboard' }/${notif.subject_id}`);
    filterOut(notif.notif_id);
  }

  async function filterOut(notif_id) {
    setNotifications(notifications.filter(n => n.notif_id !== notif_id));
    await user.updateNotifications([notif_id]);
  }

  async function markAllAsRead() {
    setNotifications([]);
    await user.updateNotifications(notifications.map(n => n.notif_id));
  }


  return (
    <div id='notification'>
      <div className='notification-header items-center'>
        <label>Notifications</label>
        <label>{notifications && notifications.length}</label>
      </div>
      <div className='notification-container flex-column'>
        {notifications &&
          <>
            {notifications.map((notif, index) => {
              return (
                <div className='notification-item flex-column' 
                  {...(notif.type === 'team' && { onClick: () => clickTeamNotif(notif) })}
                  {...(notif.type === 'class' && { onClick: () => clickClassNotif(notif) })}
                  {...(notif.type === 'activity' && { onClick: () => clickActivityNotif(notif) })}
                  {...(notif.type === 'room' && { onClick: () => clickRoomNotif(notif) })}
                  {...(notif.type === 'invite' && { onClick: () => clickInviteNotif(notif) })}
                  {...(notif.type === 'remove' && { onClick: () => clickRemoveNotif(notif) })}
                  {...(notif.type === 'add' && { onClick: () => clickAddNotif(notif) })}
                  key={index}>
                  <div className='content'>
                    {notif.type === 'team' &&
                      <label><b>{notif.source}</b> {notif.for} the team <b>{notif.subject_name}</b>.</label>
                    }
                    {notif.type === 'class' &&
                      <label><b>{notif.source}</b> has <b>{notif.for}</b> your request to join <b>{notif.subject_name}</b>.</label>
                    }
                    {notif.type === 'activity' &&
                      <label><b>{notif.source}</b> has created a new activity in {notif.for}: <b>{notif.subject_name}.</b></label>
                    } 
                    {notif.type === 'room' &&
                      <label><b>{notif.source}</b> made a new room for your team <b>{notif.for}</b> in <b>{notif.subject_name}</b>.</label>
                    }
                    {notif.type === 'invite' &&
                      <label><b>{notif.source}</b> invites you to join the team <b>{notif.subject_name}</b>.</label>
                    }
                    {notif.type === 'remove' &&
                      <label><b>{notif.source}</b> has removed you from {notif.for} <b>{notif.subject_name}</b>.</label>
                    }
                    {notif.type === 'add' &&
                      <label><b>{notif.source}</b> has added you to {notif.for} <b>{notif.subject_name}</b>.</label>
                    }

                  </div>
                  <div className='time'>
                    {createdAt(notif)}
                  </div>
                </div>
              )
            })}
            {noUnread &&
            <div className='no-unread items-center flex-column'>
              <TbClockCheck size={60}/>
              <label>No unread notifications.</label>
            </div>
            }
          </>
        }
      </div>
      {notifications &&
        <>
        {!noUnread &&
          <button className='mark-all-notif items-center' onClick={markAllAsRead}>
            Mark All As Read 
          </button>
        }          
        {noUnread &&
          <button className='mark-all-notif items-center gray'>
            Marked All As Read <BsCheck2All className='check' size={18}/>
          </button>
        }
        </>
      }
    </div>
  )
}

export default Notifications