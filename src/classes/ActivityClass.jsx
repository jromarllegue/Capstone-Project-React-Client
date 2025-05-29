import toast from 'react-hot-toast';
import api from '../api';
import { errorHandler } from '../error';

export default class Activity {
    constructor (activity_id, activity_name, class_id, instructions, open_time, close_time) {
        this.activity_id = activity_id;
        this.activity_name = activity_name;
        this.class_id = class_id;
        this.instructions = instructions;
        this.open_time = open_time;
        this.close_time = close_time;
    }

    async updateInstructions(new_instructions) {
        try {
            const response = await api.post('/api/update-instructions', {
                activity_id: this.activity_id,
                instructions: new_instructions
            });

            const data = response.data;

            if (data.status === 'ok') {
                return true;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async updateDates(new_open_time, new_close_time) {
        try {
            const response = await api.post('/api/update-dates', {
                    activity_id: this.activity_id,
                    open_time: new_open_time,
                    close_time: new_close_time,
            });

            const data = response.data;

            if (data.status === 'ok') {
                toast.success(data.message);
                return true;

            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }

    async deleteActivity() {
        try {
            const response = await api.post('/api/delete-activity', {
                activity_id: this.activity_id
            });

            const data = response.data;

            if (data.status === 'ok') {
                return true;
            }
        } catch (e) {
            errorHandler(e);
            return null;
        }
    }
}