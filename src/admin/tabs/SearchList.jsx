import React from 'react';

export function SearchUserList({ list, filter, selectUser }) {
    const results = list.filter((f) => {
        const uid = f.uid.toLowerCase().includes(filter.toLowerCase());
        const firstThenLast = `${f.first_name} ${f.last_name}`.toLowerCase().includes(filter.toLowerCase());
        const lastThenFirst = `${f.last_name}, ${f.first_name}`.toLowerCase().includes(filter.toLowerCase());
        const combined = `${f.uid} ${f.first_name} ${f.last_name}`.toLowerCase().includes(filter.toLowerCase());
        return (firstThenLast || lastThenFirst || uid || combined);
    });

    return (
    <div className='collection-search-div'>
        <ul className='collection-search-list'>
            {results && results.map((item) => (
                <li key={item.uid}
                    className='flex-row items-center'
                    onClick={() => selectUser(item)}>
                    {item.first_name} {item.last_name}<span>{item.email}</span>
                </li>
            ))}
        </ul>
    </div>
    )
}

export async function searchDropdown(bool, showConst, retrieveFunc) {
    if (bool === false) {
        return setTimeout(() => showConst(false), 300);
    } 
    await retrieveFunc();
    showConst(true);
}
