import React, { useEffect, useState, useRef } from 'react'
import SearchStudents from '../SearchStudents';
import { BsPersonPlus } from 'react-icons/bs';
import { showConfirmPopup, showAlertPopup } from '../../reactPopupService';
import handleMenu from '../utils/handleMenu';
import { keySelectors, scrollIntoView } from '../utils/searchKeyHandler';

function AddMember({team, user}) {
    const [search, setSearch] = useState('');
    const [student_list, setStudentList] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const addMemberRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    useEffect(() => {
        async function init() {
            const students = await user.getCourseStudents(team.class_id, 'students');
            const filtered = students.filter((s) => {
                return !team.members.map((m) => { 
                    return m.uid; 
                }).includes(s.uid);
            });         
            setStudentList(filtered);
        }
        init();
    }, [team.members]);

    useEffect(() => {  
        function handleClickOutside(e) {
            handleMenu(addMemberRef.current, setShowResults, e.target);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [addMemberRef]);    

    function handleKeyDown (e) {
        if (!showResults || search === '') {
            return;
        }
        
        const filtered = student_list.filter((stud) => 
            `${stud.first_name} ${stud.last_name}`.toLowerCase().includes(search.toLowerCase()) || 
            `${stud.last_name}, ${stud.first_name}`.toLowerCase().includes(search.toLowerCase())
        );

        keySelectors(e, filtered, selectedIndex, setSelectedIndex, addStudentToTeam);
    };

    useEffect(() => {
        if (selectedIndex >= 0) {
            scrollIntoView('.member-search-item.selected', '#search-results-div');
        }
    }, [selectedIndex]);


    async function addStudentToTeam(student) {
        setSearch(`${student.first_name} ${student.last_name}`);
        setShowResults(false);
        setSelectedIndex(-1);

        const isAvailable = await team.checkStudentAvailability(student.uid);
        if (!isAvailable) return;

        const confirmed = await showConfirmPopup({
            title: 'Add Student To Team',
            message: `Do you want to add ${student.first_name} ${student.last_name} to team ${team.team_name}?`,
            confirm_text: 'Add Student',
            cancel_text: 'Cancel'
        })

        if (confirmed) {
            const invited = await team.inviteStudent(student.uid);
            if (invited) {
                await showAlertPopup({
                    title: 'Student Invited!',
                    message: `A team invite has been sent to ${student.first_name} ${student.last_name}.`,
                    okay_text: 'Okay'
                })
                setSearch('');
            }
        }
    }

    return (
        <div className='add-member-div flex-row'>
            <div className='items-center'>
                <BsPersonPlus size={20} />
            </div>
            <div className='flex-column add-member-search' ref={addMemberRef}>
                <input
                    className='input-data'
                    type='text' 
                    value={search} 
                    placeholder='Search for a student by their name'
                    onFocus={() => {setShowResults(true)}}
                    onChange={(e) => {setSearch(e.target.value)}}
                    onKeyDown={handleKeyDown}
                />
                {search !== '' && showResults &&
                    <div id='search-results-div' className='width-100'>
                        <SearchStudents 
                            students_list={student_list} 
                            search={search} 
                            addFunction={addStudentToTeam}
                            selectedIndex={selectedIndex}
                        />
                    </div>
                }
            </div>
        </div>
    )
}

export default AddMember
