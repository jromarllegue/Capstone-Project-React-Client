import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import pnc from '../../assets/pamantasan.jpg'
import full_logo from '../../assets/full_logo.jpg'
import ccs_logo from '../../assets/ccs_logo.jfif'
import { showAlertPopup } from './reactPopupService';

function ResetPassword() {
    const { reset_link } = useParams();
    const [ password, setPassword ] = useState('');
    const [ conf_password, setConfPassword ] = useState('');
    const [ warning, setWarning ] = useState(null);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const navigate = useNavigate();

    async function resetPassword(event) {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            setWarning(null);

            const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'   
                },
                body: JSON.stringify({
                    reset_link,
                    password,
                    conf_password
                })
            })
    
            const data = await response.json(); 
            
            if (data.status === 'ok') {
                await showAlertPopup({
                    title: 'Reset Password Success',
                    message: 'Your password was successfully changed to the new password. You can now log in again.',
                    type: 'success',
                    okay_text: 'Okay'
                });
                navigate(`/login`);
                
            } else if (data.message) {
                setWarning(data.message);
            }
        } catch (e) {
            setWarning('An error occured. Please try again.');
            console.error(e);
        }
        setIsSubmitting(false);
    };

    return (
        <div id='login-signup'>
            <main className='photo-container'>
                <img src={pnc} alt='pnc' />
                <div id='orange-hue'/>
            </main>
            <main className='form-container items-center login'>
                <form className='form-account login' onSubmit={ resetPassword }>
                    <div className='items-center ccs-logo prof'>
                        <img src={ccs_logo} alt='ccs_logo'/>
                        <img src={full_logo} alt='full_logo'/>
                    </div>
                    <section className='head items-center login'>
                        <label>Reset Password</label>
                    </section>
                    <div className='account-warning'>
                    {warning && 
                        <label className='label-warning'>{warning}</label>
                    }
                    </div>
                    <div className='input-form login'>
                    <div className='input-div'>                        
                            <label>New Password</label>
                            <input 
                                className='input-data'
                                type='password'
                                value={password}
                                placeholder='Enter your new password'
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className='input-div'>
                            <label>Confirm New Password</label>
                            <input 
                                className='input-data'
                                type='password'
                                value={conf_password}
                                placeholder='Re-type your new password'
                                onChange={(e) => setConfPassword(e.target.value)}
                                required
                            /> 
                        </div>
                    </div>
                    <div className='input-btn items-center signup'>
                        <input  type='submit' 
                                value={isSubmitting ? 'Processing...' : 'Change Password'}
                                disabled={isSubmitting}/>                        
                    </div>
                </form>
            </main>
        </div>
    )
}

export default ResetPassword