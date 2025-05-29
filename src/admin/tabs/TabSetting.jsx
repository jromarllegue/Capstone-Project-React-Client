import React, { useState, useEffect } from 'react'
import { showAlertPopup, showConfirmPopup } from '../../components/reactPopupService'

function TabSetting({ admin }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    async function startNewSemester() {
        const confirm1 = await showConfirmPopup({
            title: 'Start New Semester',
            message: `Are you sure you want to start a new semester? This will clear away all classes's contents in the database. This includes emptying out students and requests, and clearing all teams, activities, and assigned rooms. Do you want to continue?`,
            confirm_text: 'I Want To Continue',
            cancel_text: 'Cancel',
        });

        if (confirm1) {
            const confirm2 = await showConfirmPopup({
                title: 'Start New Semester',
                message: `This action is irreversible and must only be done when necessary. Are you sure?`,
                confirm_text: 'I Am Sure',
                cancel_text: 'Back',
            });

            if (confirm2) {
                setTimeout(() => {  
                    async function init() {
                        const prompt = window.prompt('Type "clear-all-contents" to continue:');
        
                        if (prompt !== 'clear-all-contents') return alert('Wrong input. No changes were made.');
    
                        const data = await admin.startNewSemester();
        
                        if (data) {
                            await showAlertPopup({
                                title: 'Start New Semester',
                                message: `All classes's contents in the database have been cleared. A new semester can now be started.`,
                                okay_text: 'Okay!'
                            });
                        }
                    }
                    init();
                }, 1000);
            }
        }
    }
 
    return (
    <div id='manage-content'>
        <div id='admin-loading-container'>
        {loading &&
            <div className='loading-line'>
                <div></div>
            </div> 
        }
        </div>
        <div className='manage-header flex-row items-center'>
            <div className='flex-row items-center'>
                <h2>Setting</h2>
            </div>
        </div>
        <div className='setting-div flex-column'>
            <div className='flex-column setting-item items-start width-100'>
                <h3>Start New Semester</h3>
                <button className='admin-delete' onClick={startNewSemester}>
                    Start New Semester
                </button>
                <label>Note: This will clear away all classes's contents including emptying out students and requests, and clearing all teams, activities, and assigned rooms.</label>
            </div>
        </div>



        <div className='flex-row items-center'>

        </div>
    </div>
)
}

export default TabSetting