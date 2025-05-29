import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EmailVerification() {
    const [verificationStatus, setVerificationStatus] = useState('Verifying email...');
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        verifyEmail();
    }, []);

    async function verifyEmail() {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/verify-email/${token}`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.status === 'ok') {
                setVerificationStatus('Email verified successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setVerificationStatus('Verification failed. Invalid or expired link.');
            }
        } catch (error) {
            setVerificationStatus('Server error. Please try again later.');
        }
    };

    return (
        <div className="verification-container">
            <label>{verificationStatus}</label>
        </div>
    );
}

export default EmailVerification;