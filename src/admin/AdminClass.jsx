import toast from 'react-hot-toast';
import api from '../api';
import Cookies from 'js-cookie';
import { errorHandler, errorHandlerForms } from '../error';
import { errorHandlerAdmin } from './utils/adminError';

export class Admin {
    constructor(admin_uid, first_name, last_name, role) {
        this.admin_uid = admin_uid;
        this.first_name = first_name;
        this.last_name = last_name;
        this.role = role;
    }

    async getAllStudents() {
        try {
            const response = await api.post('/api/admin/students');

            const data = response.data;

            if (data.status === 'ok') {
                return data.students;
            }
            return null;
        } catch (e) {
            errorHandlerAdmin(e);
            return null;
        }
    }
    
    async getAllProfessors() {
        try {
            const response = await api.post('/api/admin/professors');

            const data = response.data;

            if (data.status === 'ok') {
                return data.professors;
            }
            return null;
        } catch (e) {
            errorHandlerAdmin(e);
            return null;
        }
    }

    async getAllCourses() {
        try {
            const response = await api.get('/api/admin/courses');

            const data = response.data;

            if (data.status === 'ok') {
                return data.courses;
            }
            return null;
        } catch (e) {
            errorHandlerAdmin(e);
            return null;
        }
    }

    async getAllClasses() {
        try {
            const response = await api.post('/api/admin/classes');

            const data = response.data;

            if (data.status === 'ok') {
                return data.classes;
            }
            return null;
        } catch (e) {
            errorHandlerAdmin(e);
            return null;
        }
    }

    async getAllTeams(class_id) {
        try {
            const response = await api.post('/api/admin/teams', {
                class_id
            });

            const data = response.data;

            if (data.status === 'ok') {
                return {
                    teams: data.teams,
                    class: data.parent_class
                };
            }
            return null;
        } catch (e) {
            errorHandlerAdmin(e);
            return null;
        }
    }

    async getAllActivities(class_id) {
        try {
            const response = await api.get('/api/admin/activities', {
                params: {
                    class_id
                }
            });

            const data = response.data;

            if (data.status === 'ok') {
                return {
                    activities: data.activities,
                    class: data.parent_class
                }
            }
            return null;
        } catch (e) {
            errorHandlerAdmin(e);
            return null;
        }
    }

    async getAllAssignedRooms(foreign_name, foreign_key) {
        try {
            const response = await api.get('/api/admin/assigned-rooms', {
                params: {
                    foreign_name,
                    foreign_key
                }
            });
            const data = response.data;

            if (data.status === 'ok') {
                return {
                    rooms: data.assigned_rooms,
                    activity: data.parent_activity,
                    team: data.parent_team,
                    class: data.parent_class
                }
            }
            return null;
        } catch (e) {
            errorHandlerAdmin(e);
            return null;
        }
    }

    async getAllSoloRooms(foreign_name, foreign_key) {
        try {
            const response = await api.get('/api/admin/solo-rooms', {
                params: {
                    foreign_name,
                    foreign_key
                }
            });
            const data = response.data;
            if (data.status === 'ok') {
                return {
                    rooms: data.solo_rooms,
                    owner: data.parent_user
                }
            }
            return null;
        } catch (e) {
            errorHandlerAdmin(e);
            return null;
        }
    }

    async createStudent(email, first_name, last_name, password, confirmPassword) {
        try {
            const response = await api.post('/api/admin/create-student', {
                email,
                first_name,
                last_name,
                password,
                conf_password: confirmPassword
            });
            const data = response.data;

            if (data.status === 'ok') {
                return data.uid;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async updateStudent(uid, email, first_name, last_name, password, confirmPassword) {
        try {
            const response = await api.post('/api/admin/update-student', {
                uid,
                email,
                first_name,
                last_name,
                password,
                conf_password: confirmPassword
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

    async createProfessor(email, first_name, last_name, password, confirmPassword) {
        try {
            const response = await api.post('/api/admin/create-professor', {
                email,
                first_name,
                last_name,
                password,
                conf_password: confirmPassword
            });
            const data = response.data;

            if (data.status === 'ok') {
                return data.uid;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async updateProfessor(uid, email, first_name, last_name, password, confirmPassword) {
        try {
            const response = await api.post('/api/admin/update-professor', {
                uid,
                email,
                first_name,
                last_name,
                password,
                conf_password: confirmPassword
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

    async createCourse(course_code, course_title) {
        try {
            const response = await api.post('/api/admin/create-course', {
                course_code,
                course_title
            });
            const data = response.data;

            if (data.status === 'ok') {
                return data.course_code;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async updateCourse(old_course_code, new_course_code, course_title) {
        try {
            const response = await api.post('/api/admin/update-course', {
                old_course_code,
                new_course_code,
                course_title
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

    async createClass(course_code, section, professor_uid) {
        try {
            const response = await api.post('/api/admin/create-class', {
                course_code,
                section,
                professor_uid,
            });
            const data = response.data;

            if (data.status === 'ok') {
                return data.class_id;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async updateClass(class_id, course_code, section, professor_uid) {
        try {
            const response = await api.post('/api/admin/update-class', {
                class_id,
                course_code,
                section,
                professor_uid,
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

    async addStudent(class_id, uid) {
        try {
            const response = await api.post('/api/admin/add-student', {
                class_id,
                uid
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

    async acceptRequest(class_id, uid) {
        try {
            const response = await api.post('/api/admin/accept-request', {
                class_id,
                uid
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

    async rejectRequest(class_id, uid) {
        try {
            const response = await api.post('/api/admin/reject-request', {
                class_id,
                uid
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

    async removeStudent(class_id, uids) {
        try {
            const response = await api.post('/api/admin/remove-student', {
                class_id,
                uids
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

    async createTeam(class_id, team_name) {
        try {
            const response = await api.post('/api/admin/create-team', {
                class_id,
                team_name,
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data.team_id;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async updateTeam(team_id, team_name) {
        try {
            const response = await api.post('/api/admin/update-team', {
                team_id,
                team_name,
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

    async getClassStudents(class_id) {
        try {
            const response = await api.post('/api/admin/get-class-students', {
                class_id
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data.students;
            }
            return null;
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async addMember(team_id, uid) {
        try {
            const response = await api.post('/api/admin/add-member', {
                team_id,
                uid
            });
    
            const data = response.data;
    
            if (data.status === 'ok') {
                return true;
            }
            return null;
        } catch(e) {
            errorHandlerForms(e);
            return null;
        }
    }
    
    async removeMember(team_id, uids) {
        try {
            const response = await api.post('/api/admin/remove-member', {
                team_id,
                uids
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

    async createActivity(class_id, activity_name, instructions, open_time, close_time) {
        try {
            const response = await api.post('/api/admin/create-activity', {
                class_id,
                activity_name,
                instructions,
                open_time,
                close_time
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data.activity_id;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async updateActivity(activity_id, activity_name, instructions, open_time, close_time) {
        try {
            const response = await api.post('/api/admin/update-activity', {
                activity_id,
                activity_name,
                instructions,
                open_time,
                close_time
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

    async createAssignedRoom(activity_id, team_id) {
        try {
            const response = await api.post('/api/admin/create-assigned-room', {
                activity_id,
                team_id,
            });

            const data = response.data;

            if (data.status === 'ok') {
                return data.room_id;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async getAssignedRoomDetails(room_id) {
        try {
            const response = await api.get('/api/admin/get-assigned-room-details/', {
                params: {
                    room_id
                }
            });

            const data = response.data;

            if (data.status === 'ok') {

                return { 
                    room: data.room,
                    files: data.files, 
                    activity: data.activity, 
                    members: data.members, 
                };
            } else {
                window.location.href = '/error/404';
                return null;
            }
        } catch (e) {
            errorHandlerAdmin(e);
            return null;
        }
    }

    async createSoloRoom(position, uid) {
        try {
            const response = await api.post('/api/admin/create-solo-room', {
                position, 
                uid
            });
            const data = response.data;

            if (data.status === 'ok') {
                return data.room_id;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async updateSoloRoomName(room_id, new_room_name) {
        try {
            const response = await api.post('/api/admin/update-solo-room-name', {
                room_id,
                new_room_name
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

    async createAdmin(email, first_name, last_name, password, confirmPassword, role) {
        try {
            const response = await api.post('/api/admin/create-admin', {
                email,
                first_name,
                last_name,
                password,
                conf_password: confirmPassword,
                role
            });
            const data = response.data;

            if (data.status === 'ok') {
                return data.admin_uid;
            }
            return null;
        } catch (e) {
            errorHandlerForms(e);
            return null;
        }
    }

    async updateAdmin(admin_uid, email, first_name, last_name, password, confirmPassword, role) {
        try {
            const response = await api.post('/api/admin/update-admin', {
                admin_uid,
                email,
                first_name,
                last_name,
                password,
                conf_password: confirmPassword,
                role
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

    async getAllAdmins() {
        try {
            const response = await api.post('/api/admin/admins');
            const data = response.data;

            if (data.status === 'ok') {
                return data.admins;
            }
            return null;
        } catch (e) {
            errorHandlerAdmin(e);
            return null;
        }
    }
}

export class SuperAdmin extends Admin {
    constructor(admin_uid, first_name, last_name, role) {
        super(admin_uid, first_name, last_name, role);
    }

    async deleteStudent(uids) {
        try {
            const response = await api.post('/api/admin/delete-student', {
                uids
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

    async deleteProfessor(uids) {
        try {
            const response = await api.post('/api/admin/delete-professor', {
                uids
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

    async deleteCourse(course_codes) {
        try {
            const response = await api.post('/api/admin/delete-course', {
                course_codes
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

    async deleteClass(class_ids) {
        try {
            const response = await api.post('/api/admin/delete-class', {
                class_ids
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

    async deleteTeam(team_ids) {
        try {
            const response = await api.post('/api/admin/delete-team', {
                team_ids,
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

    async deleteActivity(activity_ids) {
        try {
            const response = await api.post('/api/admin/delete-activity', {
                activity_ids
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

    async deleteAssignedRoom(room_ids) {
        try {
            const response = await api.post('/api/admin/delete-assigned-room', {
                room_ids
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

    async deleteSoloRoom(room_ids) {
        try {
            const response = await api.post('/api/admin/delete-solo-room', {
                room_ids
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

    async deleteAdmin(admin_uids) {
        try {
            const response = await api.post('/api/admin/delete-admin', {
                admin_uids
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

    async startNewSemester() {
        try {
            const response = await api.post('/api/admin/start-new-semester');
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