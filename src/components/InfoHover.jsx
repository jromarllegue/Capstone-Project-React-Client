import { BsQuestionCircleFill } from 'react-icons/bs';
import React from 'react'

function InfoHover({size, info}) {
  return (
    <div className='info-hover-container'>
        <BsQuestionCircleFill className='icon-info' size={size} />
        <div className='info-hover'>
            <label>{info}</label>
        </div>
    </div>
  )
}

export default InfoHover