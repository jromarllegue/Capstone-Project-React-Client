import React, { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast';
import { MdLoop } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa6';
import SearchStudents from './SearchStudents';
import { showConfirmPopup } from '../reactPopupService';
import handleMenu from './utils/handleMenu';
import { keySelectors, scrollIntoView } from './utils/searchKeyHandler';

function StudentList({user, class_info, showStudents}) {
    const [students, setStudents] = useState([]);
    const [requests, setRequests] = useState([]);
    const [switchView, setSwitchView] = useState(false);
    
    const [newStudent, setNewStudent] = useState('');
    const [otherStudents, setOtherStudents] = useState(null);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showOtherStudentList, setShowOtherStudentList] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const addStudentRef = useRef(null);

    useEffect(() => {
        getStudents();
    }, [class_info?.class_id]);

    useEffect(() => {
        if (showAddStudent) {
            getOtherStudents();
        }
    }, [showAddStudent]);

    useEffect(() => {  
        function handleClickOutside(e) {
          handleMenu(addStudentRef.current, setShowOtherStudentList, e.target);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [addStudentRef]);    

    useEffect(() => {
        if (selectedIndex >= 0) {
            scrollIntoView('.member-search-item.selected', '#search-results-div');
        }
    }, [selectedIndex]);

    function handleKeyDown(e) {
        if (!showOtherStudentList || newStudent === '') {
            return;
        }
        
        const filtered = otherStudents.filter((stud) => 
            `${stud.first_name} ${stud.last_name}`.toLowerCase().includes(newStudent.toLowerCase()) || 
            `${stud.last_name}, ${stud.first_name}`.toLowerCase().includes(newStudent.toLowerCase())
        );

        keySelectors(e, filtered, selectedIndex, setSelectedIndex, addStudentToClass);
    }

    async function getStudents() {
        try {
            const info = await user.getCourseStudents(class_info.class_id, 'all');
            if (info) {
                setStudents(info.students);
                setRequests(info.requests);
            }
        } catch (e) {
            toast.error('An error occured while retrieving class students.');
            console.error(e);
        }
    }

    async function getOtherStudents() {
        try {
            document.getElementById('new-student-input').focus();
            const others = await user.getOtherStudents(class_info.class_id);
            others ? setOtherStudents(others) : null;
        } catch (e) {
            toast.error('An error occured while retrieving students.');
            console.error(e);
        }
    }

    async function addStudentToClass(student) {
        setShowOtherStudentList(false);
        setNewStudent(`${student.last_name}, ${student.first_name}`);
        setSelectedIndex(-1);
        
        const added = await user.addStudentToClass(class_info.class_id, student.uid);

        if (added) {
            setOtherStudents(prev => prev.filter(s => s.uid !== student.uid));
            setRequests(prev => prev.filter(s => s.uid !== student.uid));
            setStudents(prev => [...prev, student].sort((a, b) => a.last_name.localeCompare(b.last_name)));
            setNewStudent('');
        }
    }

    async function removeStudent(student) {
        const result = await showConfirmPopup({
            title: 'Remove Student',
            message: `Are you sure you want to remove this ${student.first_name} ${student.last_name} from the class?`,
            confirm_text: 'Remove Student',
            cancel_text: 'Cancel'
        });

        if (result) {
            const info = await user.removeStudent(class_info.class_id, student.uid);
            if (info) {
                getStudents();
            }
        }
    }

    async function acceptRequest(uid) {
        const info = await user.acceptRequest(class_info.class_id, uid);
        if (info) {
            getStudents();
        }
    }

    async function rejectRequest(uid) {
        const info = await user.rejectRequest(class_info.class_id, uid);
        if (info) {
            getStudents();
        }
    }

    return (
        <div id='course-table' className={`flex-column items-center ${!showStudents && 'none'}`}>   
            <div className='student-list-button items-center'>
                <button className={`stud-btn ${switchView === false && 'active'}`} onClick={() => setSwitchView(false)}>
                    Students ({students.length})
                </button>
                <button className={`req-btn ${switchView === true && 'active'}`} onClick={() => setSwitchView(true)}>
                    Requests ({requests.length})
                </button>
                <button className='reload-btn items-center' onClick={getStudents}>
                    <MdLoop size={20}/>
                </button>
            </div>                 
            {students && !switchView &&
                <>
                <div className='add-student items-center'>
                    {showAddStudent &&
                        <div className='add-input items-center'>
                            <label>Add Student: </label>
                            <div className='items-center' ref={addStudentRef}>
                                <input 
                                    id='new-student-input'
                                    type='text' 
                                    value={newStudent}
                                    onFocus={() => {setShowOtherStudentList(true)}}
                                    onChange={(e) => setNewStudent(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder='Enter the name of the student...' />
                                    {showOtherStudentList && newStudent !== '' && 
                                        <div id='search-results-div' className='width-100'>
                                        {otherStudents &&
                                            <SearchStudents 
                                                students_list={otherStudents} 
                                                search={newStudent} 
                                                addFunction={addStudentToClass}
                                                showEmail={true}
                                                selectedIndex={selectedIndex}
                                            />
                                        }
                                        </div>
                                    }
                            </div>
                        </div>
                    }
                    <button 
                        className={`dashboard-${!showAddStudent ? 'add' : 'cancel'} items-center`} 
                        onClick={() => setShowAddStudent(!showAddStudent)}>
                        {!showAddStudent && <><FaPlus size={18}/> Add Student</>}
                        {showAddStudent && 'Cancel'}
                    </button>
                </div>
                <table className='student-list'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className='name'>{student.last_name}, {student.first_name}</td>
                                    <td className='single-line'>{student.email}</td>
                                    <td className='tbl-btn'>
                                        <button className='remove-btn' onClick={() => removeStudent(student)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>                    
                </table>
                {students && students.length === 0 && 
                    <div className='length-0'>
                        No students found.
                    </div>
                }
                </>                
            }
            {requests && switchView &&
                <>
                <table className='student-list'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((student, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{student.last_name}, {student.first_name}</td>
                                    <td className='tbl-btn'>
                                        <div className='flex-row items-center'>
                                            <button className='accept-btn' onClick={() => acceptRequest(student.uid)}>
                                                Accept
                                            </button>
                                            <button className='remove-btn' onClick={() => rejectRequest(student.uid)}>
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {requests && requests.length === 0 && 
                    <div className='length-0'>
                        No requests found.
                    </div>
                }
                </>
            }
        </div>
    )
}

export default StudentList
