import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { BsChevronLeft } from 'react-icons/bs';
import { FiPlus } from 'react-icons/fi';

function Sidebar({ user, courses, setShowAddClass, setShowStudents }) {
  const {class_id, select} = useParams();
  const navigate = useNavigate();

  function showSelected(selected) {
    navigate(`/dashboard/${class_id}/${selected}`);
    setShowStudents ? setShowStudents(false) : null;
  }

  function showSelectedSection(class_id) {
    navigate(`/dashboard/${class_id}/${select ? select : 'all'}`);
    setShowStudents ? setShowStudents(false) : null;
  }

  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.getElementById('sidebar-main');
      sidebar.style.left = window.innerWidth < 750 ? '-239px' : '0px';
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);  

  function hideSidebar() {
    document.getElementById('sidebar-main').style.left = '-239px';
  }

  return (
    <aside id='sidebar-main' className='flex-column'>
      <button id='sb-remove' className='items-center' onClick={hideSidebar}><BsChevronLeft size={ 25 }/></button>
      <div className='sidebar-section flex-column'>
        <div className='sb-filter'>
          CLASSES
        </div>
        {courses && courses.map((c, index) => {
          return (
            <button 
              key={index}
              className={`sb-ops ${c.class_id === class_id && 'selected'}`} 
              onClick={() => { showSelectedSection(c.class_id) }}>
              <label>{c.course_code} {user.position === 'Professor' && c.section}</label>
            </button>
          )
        })}
        {user.position === 'Student' &&
          <button className='sb-ops add-course items-center' onClick={() => setShowAddClass(true)}>
            <FiPlus size={18}/> JOIN CLASS
          </button>
        }
      </div>
      <div className='sidebar-section flex-column'>
        <div className='sb-filter'>FILTER</div>
        <button 
          className={`sb-ops ${!(select === 'teams' || select === 'activities' || select === 'solo') && 'selected'}`} onClick={() => { showSelected('all') }}>
          <label>All</label>
        </button>
        <button className={`sb-ops ${select === 'teams' && 'selected'}`} onClick={() => { showSelected('teams') }}>
          <label>Teams</label>
        </button>
        <button className={`sb-ops ${select === 'activities' && 'selected'}`} onClick={() => { showSelected('activities') }}>
          <label>Group<span><br/></span>Activities</label>
        </button>
        <button className={`sb-ops ${select === 'solo' && 'selected'}`} onClick={() => { showSelected('solo') }}>
          <label>Solo<span><br/></span>Rooms</label>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar