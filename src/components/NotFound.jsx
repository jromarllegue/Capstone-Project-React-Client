import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className='flex-column items-center'>
        <br/>
        <h1>404 Not Found</h1>
        <p>{`Looks like something went wrong. :(`}</p>
        <br/>
        <Link to={'/'}>Go to Home Page</Link>
    </div>
  )
}

export default NotFound