import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pnc from '../../assets/pamantasan.jpg'
import ccs_logo from '../../assets/ccs_logo.jfif'
import logo from '../../assets/logo.jpg'
import api from '../api';
import { showAlertPopup } from './reactPopupService'

function Signup() {
    const [ email, setEmail ] = useState('');
    const [ first_name, setFirstName ] = useState('');
    const [ last_name, setLastName ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ conf_password, setConfPassword ] = useState('');
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ errors, setErrors ] = useState({});
    const navigate = useNavigate();

    async function signupAccount(event) {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            setErrors({});
            const response = await api.post(import.meta.env.VITE_APP_BACKEND_URL + '/api/register', {
                email,
                first_name,
                last_name,
                password,
                conf_password
            });
            const data = response.data;
    
            if(data.status === 'ok') {
                await showAlertPopup({
                    title: 'Sign Up Success',
                    message: 'Your account has been created! Please check your email to verify your account to be able to login.',
                    type: 'success',
                    okay_text: 'Okay!'
                });
                navigate('/login');
            }
        } catch (e) {
            const errorMessage = e?.response?.data?.message;
            if (errorMessage?.includes('Name should')) {
                setErrors({ first_name: e?.response?.data.field === 'first_name' ? errorMessage : null, 
                            last_name: e?.response?.data.field === 'last_name' ? errorMessage : null});
            } else if (errorMessage?.includes('email')) {
                setErrors({email: errorMessage});
            } else if (errorMessage?.includes('Password must')) {
                setErrors({password: errorMessage});
            } else if (errorMessage?.includes('Password and Re-typed')) {
                setErrors({conf_password: errorMessage});
            } else {
                setErrors({server_error: 'An error occured. Please try again later.'});
            }
        }
        setIsSubmitting(false);
    };
    
    return (
        <div id='login-signup'>
            <main className='photo-container'>
                <img src={pnc} alt='pnc' />
                <div id='orange-hue'/>
            </main>
            <main className='form-container signup'>
                <form className='form-account signup' onSubmit={signupAccount}>
                    <section className='head items-center signup'>
                        <div className='items-center'> 
                            <img src={ccs_logo} alt='ccs-logo'/>
                            <img src={logo} alt='logo'/>
                        </div>
                        <div className='items-center'>
                            <span>Create</span> an account
                        </div>
                    </section>
                    <div className='input-form'>
                        <div className='input-div'>                        
                            <label>First Name</label>
                            <input 
                                className={`input-data ${errors.first_name ? 'error-2' : ''}`}
                                type='text'
                                value={first_name}
                                placeholder='Enter your first name'
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                            {errors.first_name && <span className='label-warning'>{errors.first_name}</span>}
                        </div>
                        <div className='input-div'>                        
                            <label>Last Name</label>
                            <input 
                                className={`input-data ${errors.last_name ? 'error-2' : ''}`}
                                type='text'
                                value={last_name}
                                placeholder='Enter your last name'
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                            {errors.last_name && <span className='label-warning'>{errors.last_name}</span>}
                        </div> 
                        <div className='input-div'>
                            <label>Email</label>
                            <input 
                                className={`input-data ${errors.email ? 'error-2' : ''}`}
                                type='text'
                                value={email}
                                placeholder='Enter your email address'
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {errors.email && <span className='label-warning'>{errors.email}</span>}
                        </div>  
                        <div/>
                        <div className='input-div'>                        
                            <label>Password</label>
                            <input 
                                className={`input-data ${errors.password ? 'error-2' : ''}`}
                                type='password'
                                value={password}
                                placeholder='Enter your password'
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {errors.password && <span className='label-warning'>{errors.password}</span>}
                        </div>
                        <div className='input-div'>
                            <label>Confirm Password</label>
                            <input 
                                className={`input-data ${errors.conf_password ? 'error-2' : ''}`}
                                type='password'
                                value={conf_password}
                                placeholder='Re-type your password'
                                onChange={(e) => setConfPassword(e.target.value)}
                                required
                            />
                            {errors.conf_password && <span className='label-warning'>{errors.conf_password}</span>}
                        </div>
                    </div>
                    {errors.server_error && <span className='label-warning'>{errors.server_error}</span>}
                    <div className='input-btn items-center signup'>
                        <input  
                            type='submit' 
                            value={isSubmitting ? 'Creating Account...' : 'Create Account'}
                            disabled={isSubmitting}
                        />
                        <label>Already have an account? <a href='/login'>Log in</a></label>
                    </div>                
                </form>
            </main>
        </div>
    )
}

export default Signup