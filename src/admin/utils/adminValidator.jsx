import { Admin, SuperAdmin } from '../AdminClass';
import api from '../../api';

export default async function getAdminClass() {
  try {
    const response = await api.post('/api/admin/verify-token');
    const data = response.data;

    if (data?.status === 'ok') {
      switch (data.auth.role) {
        case 'admin':
          return new Admin(
            data.auth.admin_uid,
            data.auth.first_name,
            data.auth.last_name,
            data.auth.role
          )
        case 'superadmin':
          return new SuperAdmin(
            data.auth.admin_uid,
            data.auth.first_name,
            data.auth.last_name,
            data.auth.role
          )
        default:
          return false;
      }
    }
    return false;
  } catch (e) {
    return e?.response && (e.response.status === 401) ? window.location.href = '/error/404' : false;
  }
}