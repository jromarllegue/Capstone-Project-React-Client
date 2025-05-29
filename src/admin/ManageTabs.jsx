import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

function ManageTabs({ admin, collection }) {
    const [showArrows, setShowArrows] = useState(false);
    const scrollContainerRef = useRef(null);
    const navigate = useNavigate();
    const isDisplayed = collection === 'students' || collection === 'professors' || collection === 'courses' || collection === 'classes' || collection === 'admins' || collection === 'setting';

    useEffect(() => {
        try {
        checkForArrows();
        window.addEventListener('resize', checkForArrows);

        const buttons = document.querySelectorAll('.manage-button');
        buttons.forEach(button => {
            button.classList.remove('selected');
        });

        const selected = document.getElementById(`${collection}`);

        if (isDisplayed) {
            selected 
            ? selected.classList.add('selected') 
            : navigate('/admin/dashboard/students/');
        }

        return () => window.removeEventListener('resize', checkForArrows);  
        } catch(err) {
            window.location.reload();          
        }
    }, [collection]);

    const checkForArrows = () => {
        if (scrollContainerRef.current) {
            const { scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowArrows(scrollWidth > clientWidth);
        }
    };

    const scroll = (direction) => {
        const container = scrollContainerRef.current;

        if (container) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const switchCollection = (collection) => {
        navigate(`/admin/dashboard/${collection}`);
    }

    return (
    <div id='manages-tab' className={`${!isDisplayed && 'hidden'}`}>
        {isDisplayed &&
            <>            
                {showArrows &&
                    <button className='scroll-arrow items-center left' onClick={() => scroll('left')}>
                        <RiArrowLeftSLine size={20} />
                    </button>
                }
                <nav className='manage-scroll items-center' ref={scrollContainerRef}>
                    <button id='students' onClick={() => switchCollection('students')} className='manage-button'>Students</button>
                    <button id='professors' onClick={() => switchCollection('professors')} className='manage-button'>Professors</button>
                    <button id='courses' onClick={() => switchCollection('courses')} className='manage-button'>Courses</button>
                    <button id='classes' onClick={() => switchCollection('classes')} className='manage-button'>Classes</button>
                    <div className='divider'></div>
                    <button id='admins' onClick={() => switchCollection('admins')} className='manage-button'>Admins</button>
                    {admin.role === 'superadmin' &&
                        <button id='setting' onClick={() => switchCollection('setting')} className='manage-button'>Setting</button>
                    }
                </nav>
                {showArrows &&
                    <button className='scroll-arrow items-center right' onClick={() => scroll('right')}>
                        <RiArrowRightSLine size={20} />
                    </button>
                }
            </>
        }
    </div>
    )
}

export default ManageTabs