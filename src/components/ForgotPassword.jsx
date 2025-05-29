import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pnc from '../../assets/pamantasan.jpg'
import full_logo from '../../assets/full_logo.jpg'
import ccs_logo from '../../assets/ccs_logo.jfif'
import { showAlertPopup } from './reactPopupService';

function ForgotPassword() {
    const [ email, setEmail ] = useState('');
    const [ warning, setWarning ] = useState(null);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const navigate = useNavigate();

    async function confirmReset(event) {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            setWarning(null);

            const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'   
                },
                body: JSON.stringify({
                    email,
                })
            })
    
            const data = await response.json(); 
            
            if (data.status === 'ok') {
                await showAlertPopup({
                    title: 'Reset Link Sent',
                    message: 'The reset password link has been sent to your email. Please check your email within 1 hour.',
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
                <form className='form-account login' onSubmit={ confirmReset }>
                    <div className='items-center ccs-logo prof'>
                        <img src={ccs_logo} alt='ccs_logo'/>
                        <img src={full_logo} alt='full_logo'/>
                    </div>
                    <section className='head items-center login'>
                        <label>Forgot Password</label>
                    </section>
                    <div className='account-warning'>
                    {warning && 
                        <label className='label-warning'>{warning}</label>
                    }
                    </div>
                    <div className='input-form login'>
                        <div className='input-div'>
                            <label>Confirm your Email</label>
                            <input 
                                className='input-data'
                                type='text'
                                value={email} 
                                placeholder='Enter your email address'
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            /> 
                        </div>
                    </div>
                    <div className='input-btn items-center signup'>
                        <input  type='submit' 
                                value={isSubmitting ? 'Processing...' : 'Send Reset Link'}
                                disabled={isSubmitting}/>                        
                    </div>
                    <div className='input-btn items-center'>
                        <label>Back to <a href='/'>Log In</a></label>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default ForgotPassword