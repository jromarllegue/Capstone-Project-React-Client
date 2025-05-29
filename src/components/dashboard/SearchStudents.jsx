import React from 'react';
import UserAvatar from '../UserAvatar';

function SearchStudents({students_list, search, addFunction, showEmail, selectedIndex}) {
    const filteredStudents = students_list.filter(student => 
        `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    return (
        <ul id="member-search-list">
            {filteredStudents.length === 0 ? (
                <li className="member-search-item zero">
                    No students found
                </li>
            ) : (
                filteredStudents.map((s, index) => (
                    <li 
                        key={s.uid}
                        className={`member-search-item flex-row items-center ${index === selectedIndex ? 'selected' : ''}`}
                        onClick={() => addFunction(s)}
                    >
                        <UserAvatar name={`${s.last_name}, ${s.first_name.charAt(0)}`} size={24}/>
                        <label className='single-line'>{s.last_name}, {s.first_name}</label>
                        {showEmail && <span className='email single-line'>{s.email}</span>}
                    </li>
                ))
            )}
        </ul>
    );
}

export default SearchStudents;
