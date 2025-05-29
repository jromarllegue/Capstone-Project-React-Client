import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Home() {
    const navigate = useNavigate();
    useEffect(() => {
        async function init() {
            try {
                await api.post('/api/verify-token');
                navigate('/dashboard');
            } catch (e) {
                navigate('/login');
            }
        }
        init();
    }, []);
    return <></>
}

export default Home;