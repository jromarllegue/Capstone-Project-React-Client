import React, { useState } from 'react'
import { BsXLg } from 'react-icons/bs';
import { showAlertPopup } from '../reactPopupService';


function AddClass({user, exit}) {
  const [course_code, setCourseCode] = useState('');
  const [section, setSection] = useState('');


  async function requestClass(e) {
    e.preventDefault();
    const request = await user.requestCourse(course_code, section);

    if (request) {
      exit();

      showAlertPopup({
        title: 'Request Sent!',
        message: 'Your request has been sent to the class professor.',
        type: 'success',
        okay_text: 'Okay',
      });
    }
  }

  return (
    <div id='popup-gray-background' className='items-start'>
      <div id='create-popup' className='course'>
        <div className='scroll'>
          <div id='popup-close'onClick={ exit } >
            <BsXLg size={ 18 }/>
          </div>
          <form autoComplete='off' onSubmit={(e) => requestClass(e)}>
            <h3 className='head'>Join A Class</h3>
            <div className='flex-row two-column-grid'>
              <div className='flex-column'>
                <h4 className='single-line'>
                  Course Code
                  <span className='extra-info'>(Ex. CCS110)</span>
                </h4>
                <input 
                  className='input-data'
                  type='text'
                  value={course_code}
                  placeholder='Course code'
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                />
              </div>
              <div className='flex-column'>
                <h4 className='single-line'>
                  Section
                  <span className='extra-info'>(Ex. 1IT-A)</span>
                </h4>
                <input 
                  className='input-data'
                  type='text'
                  value={section}
                  placeholder='Section'
                  onChange={(e) => setSection(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='flex-row footer'>
              <input 
                type='submit' 
                id='popup-submit' 
                value='Join Course' 
              />
              <input type='button' id='popup-cancel' value='Cancel' onClick={exit}/>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddClass