import { Student, Professor } from '../classes/UserClass';
import api from '../api'

async function restrictStudent() {
    try {
        const res = await api.post('/api/login-access');
        return res?.data?.access;
    } catch (e) {
        return e?.response && (e.response.status === 401) ? window.location.href = '/error/404' : true;
    }
}

async function getToken() {
    try {
        const response = await api.post('/api/verify-token');
        const data = response.data;

        return data?.status === 'ok' ? data.auth : false;
    } catch (e) {
        return e?.response && (e.response.status === 401) ? window.location.href = '/' : false;
    }
}

function getClass(auth, position) {
    if (auth.position === position) {
        switch (position) {
            case 'Student':
                return new Student(
                        auth.uid,
                        auth.first_name,
                        auth.last_name,
                        auth.position,
                );
            case 'Professor':
                return new Professor(
                    auth.uid, 
                    auth.first_name, 
                    auth.last_name, 
                    auth.position, 
                );
        }
    }
    return removeAccess();
}

function removeAccess() {
    window.location.href = '/error/404';
    return null;
}

export { restrictStudent, getToken, getClass };