import toast from 'react-hot-toast';
import api from '../api';
import { errorHandler, errorHandlerForms } from '../error';

export default class Team {
    constructor (team_id, team_name, class_id, members) {
        this.team_id = team_id;
        this.team_name = team_name; 
        this.class_id = class_id;
        this.members = members;
    }

    async updateTeamName(team_name) {
        try {
            const response = await api.post('/api/update-team-name', {
                team_id: this.team_id,
                team_name: team_name,
            });

            const data = response.data;

            if (data.status === 'ok') {
                return true;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async checkStudentAvailability(uid) {
        try {
            const response = await api.get('/api/check-student-availability', {
                params: {
                    team_id: this.team_id,
                    uid: uid,
                }
            });

            const data = response.data;

            if (data.status === 'ok') {
                return true;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async inviteStudent(uid) {
        try {
            const response = await api.post('/api/invite-student', {
                team_id: this.team_id,
                uid: uid,
                class_id: this.class_id,
            });

            const data = response.data;

            if (data.status === 'ok') {
                return true;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;            
        }
    }

    async removeMember(uid) {
        try {
            const response = await api.post('/api/remove-member', {
                team_id: this.team_id,
                student_uid: uid,
                class_id: this.class_id,
            });

            const data = response.data;

            if (data.status === 'ok') {
                toast.success(data.message);
            }
        } catch (e) {
            errorHandler(e);
        }
    }

    async deleteTeam() {
        try {
            const response = await api.post('/api/delete-team', {
                team_id: this.team_id,
                team_name: this.team_name,
            });

            const data = response.data;

            if (data.status === 'ok') {
                return true;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }
}