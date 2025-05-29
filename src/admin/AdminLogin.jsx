import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import pnc from '../../assets/pamantasan.jpg'
import full_logo from '../../assets/full_logo.jpg'
import ccs_logo from '../../assets/ccs_logo.jfif'
import api from '../api';
import { restrictStudent } from '../components/validator';


function AdminLogin() {    
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ warning, setWarning ] = useState(null);
    const [ hasAccess, setHasAccess ] = useState(true);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const navigate = useNavigate();

    // useEffect(() => {
    //     const init = async () => await restrictStudent() ? setHasAccess(true) : navigate('/error/404');
    //     init();
    // }, []);

    async function loginAccount(event) {
        event.preventDefault();
        document.querySelectorAll('.input-data').forEach(input => input.classList.remove('error-2'));
        setIsSubmitting(true);
        setWarning(null);
    
        try {
            await api.post('/api/login/admin', { email, password });            
            navigate('/admin/dashboard/students');            
        } catch (e) {
            setWarning(e?.response?.data?.message || 'Something went wrong. Please try again later.');
            console.error(e.message);
            e?.response?.status === 401 ? document.querySelectorAll('.input-data').forEach(input => input.classList.add('error-2')) : null;
        }
        setPassword('');
        setIsSubmitting(false);
    }

    return (
        <>
        {hasAccess &&
        <div id='login-signup'>
            <main className='form-container items-center login'>
                <form className='form-account login' onSubmit={ loginAccount }>
                    <div className='items-center ccs-logo'>
                        <img src={ccs_logo} alt='ccs_logo'/>
                    </div>
                    <section className='head items-center admin'>
                        <img src={full_logo} alt='full-logo'/><label>Admin</label>
                    </section>
                    <div className='account-warning'>
                    {warning && 
                        <label className='label-warning'>{warning}</label>
                    }
                    </div>
                    <div className='input-form login'>
                        <div className='input-div'>
                            <label>Email</label>
                            <input 
                                className='input-data'
                                type='text'
                                value={email} 
                                placeholder='Enter your email address'
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            /> 
                        </div>
                        <div className='input-div'>
                            <label>Password</label>
                            <input 
                                className='input-data'
                                type='password' 
                                value={password} 
                                placeholder='Enter your password'
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            /> 
                        </div>
                    </div>
                    <div className='input-btn items-center'>
                        <input  type='submit' 
                                value={isSubmitting ? 'Logging In...' : 'Log In'}
                                disabled={isSubmitting}/>                        
                    </div>
                </form>
            </main>
            <main className='photo-container'>
                <img src={pnc} alt='pnc' />
                <div id='orange-hue'/>
            </main>
        </div>
        }
        </>
    )    
}

export default AdminLogin