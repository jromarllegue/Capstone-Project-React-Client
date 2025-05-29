import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom';
import { FiBell, FiLogOut } from 'react-icons/fi';
import UserAvatar from '../UserAvatar';
import Cookies from 'js-cookie';
import logo from '../../../assets/logo.jpg';
import Notifications from './Notifications';
import handleMenu from './utils/handleMenu';

function Header({ user, base, name }) {
  const [notifications, setNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const settingsRef = useRef(null);
  const notifsRef = useRef(null);


  useEffect(() => {
    async function getNotifications() {
      const data = await user.getUserNotifications(notifications);
        setNotifications(data);
    }

    getNotifications();
    const interval = setInterval(getNotifications, 10000)

    return () => {
      clearInterval(interval);
    }
  }, [])

  useEffect(() => {  
    function handleClickOutside(e) {
      handleMenu(settingsRef.current, setShowSettings, e.target);
      handleMenu(notifsRef.current, setShowNotifs, e.target);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsRef, notifsRef]);

  async function signOutUser() {
    const signout = await user.signOut();

    if (signout) {
      window.location.href = `/login${user.position === 'Professor' ? '/professor' : ''}`;
    }
  }

  return (
    <header>
      <div className='left-nav items-center'>
        <div id='header-url' className='flex-row items-center'>
            <Link to={'/dashboard'}><img src={logo} alt='logo' /></Link>
            <label className='single-line'><span>{base}</span> / <a href=''>{name}</a> </label>
        </div>
      </div>
      <div className='right-nav items-center'>
        <div className='flex-row top-profile items-center'>
          <UserAvatar name={`${user.last_name.charAt(0)} ${user.first_name.charAt(0)}`} size={25}/>
          <label>{user.last_name}, {user.first_name}</label>
        </div>
        <div ref={notifsRef}>
          <button id='notif-bell' className='btn-icons items-center' onClick={() => setShowNotifs(!showNotifs)}>
            {notifications && notifications.length !== 0 && <div className='count items-center'>{notifications.length}</div>}
            <FiBell size={24} />
          </button>
          {showNotifs &&
            <Notifications user={user} notifications={notifications} setNotifications={setNotifications} />
          }
        </div>
        <div ref={settingsRef}>
          <button className='btn-icons items-center' onClick={() => setShowSettings(!showSettings)}>
            <FiLogOut size={24} />
          </button>
          {showSettings &&
            <button id='signout-btn' onClick={signOutUser}>
              Sign Out
            </button>
          }
        </div>
      </div>
    </header>
  )
}

export default Header
