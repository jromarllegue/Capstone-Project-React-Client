import React from 'react';
import Avatar from 'react-avatar';

function UserAvatar({ name, size }) {

  return (
    <div className='avatar'>
      <Avatar name={name} size={size} round='50%'/>
    </div>
  )
}

export default UserAvatar