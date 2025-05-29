import React, { useState, useEffect, useRef } from 'react'
import { FiSettings, FiLogOut } from 'react-icons/fi';
import UserAvatar from '../components/UserAvatar';
import logo from '../../assets/logo.jpg';
import Cookies from 'js-cookie';

function Header({ admin }) {
    const [signOut, setSignOut] = useState(false);
    const signOutRef = useRef(null);
    
    useEffect(() => {
      function handleClickOutside(event) {
        if (signOutRef.current && !signOutRef.current.contains(event.target)) {
          setSignOut(false);
        }
      }
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [signOutRef]);
  
    function signOutUser() {
      Cookies.remove('token');
      window.location.href = '/admin/login';
    }
  
    return (
        <header className='admin items-center'>
            <div className='left-nav items-center'>
                <div id='header-url' className='flex-row items-center admin'>
                    <img src={logo} alt='logo' />
                    <label><span>PnC</span><span>ode</span> Admin</label>
                </div>
            </div>
            <div className='right-nav items-center'>
                <div className='top-profile flex-row items-center'>
                    <UserAvatar name={admin.last_name + ', ' + admin.first_name.charAt(0)} size={25}/>
                    {admin.last_name}, {admin.first_name}
                </div>
                <div ref={signOutRef}>
                    <button className='btn-icons items-center' onClick={() => setSignOut(!signOut)}><FiLogOut size={24} /></button>
                    {signOut &&
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