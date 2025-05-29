import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import ShowId from './ShowId';
import resetInput from '../utils/resetInput';
import animateDrop from '../utils/animateDrop';
import convertToReadable from '../../components/room/utils/convertToReadable';
import { handleCheckboxChange, handleBulkDelete } from '../utils/handleDelete';
import { toggleOne, untoggleAll } from '../utils/toggleButtons';

function TabAdmins({ admin, showId, setShowId }) {
  const [admins, setAdmins] = useState(null);
  const [results, setResults] = useState(admins);
  const selectedRef = useRef(null);

  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const { query } = useParams();

  const [showForm, setShowForm] = useState(null);
  const [email, setEmail] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin');

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => await getAllAdmins();
    init();
  }, []);

  async function getAllAdmins() {
    setLoading(true);
    const data = await admin.getAllAdmins();
    setAdmins(data);
    setResults(data);
    doSearch(data);
  }

  function doSearch(list = []) {
    const q = new URLSearchParams(query).get('q') || '';
    const f = new URLSearchParams(query).get('f') || '';

    if (!(f === 'admin_uid' || f === 'last_name' || f === 'first_name' || f === 'email' || f === 'role' || f === '') === true || !list) {
      navigate('/admin/dashboard/admins/q=&f=');
      return;
    }

    const filtered = list.filter((a) => {
      const admin_uid = String(a.admin_uid).toLowerCase().includes(q.toLowerCase());
      const email = String(a.email).toLowerCase().includes(q.toLowerCase());
      const role = String(a.role).toLowerCase().includes(q.toLowerCase());

      if (f === 'admin_uid') return admin_uid;
      if (f === 'last_name') return String(a.last_name).toLowerCase().includes(q.toLowerCase());
      if (f === 'first_name') return String(a.first_name).toLowerCase().includes(q.toLowerCase());
      if (f === 'email') return email;
      if (f === 'role') return role;

      const combined = `${a.admin_uid} ${a.first_name} ${a.last_name} ${a.role}`.toLowerCase().includes(q.toLowerCase());
      return (admin_uid || email || combined);
    });

    setSearch(q);
    setFilter(f);
    setResults(filtered);
    setLoading(false);
  }

  useEffect(() => {
    if (admins) {
      doSearch(admins);
    }
  }, [admins, query]);

  function searchAdmins(e) {
    e.preventDefault();
    showForm ? setShowForm(null) : null;
    selectedRef.current = null;
    navigate(`/admin/dashboard/admins/q=${search}&f=${filter}`);
  }

  function selectAdmin(admin) {
    if (selectedRef.current?.admin_uid === admin.admin_uid) {
      selectedRef.current = null;
      showForm ? setShowForm(null) : null;
      navigate(-1);
      return;
    }
    selectedRef.current = admin;
    navigate(`/admin/dashboard/admins/q=${admin.admin_uid}&f=admin_uid`);
  }

  function showCreateForm() {
    selectedRef.current = null;

    if (showForm === 'create') {
      setShowForm(null);
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      return;
    }

    setShowForm('create');
    resetInput([setEmail, setFirstName, setLastName, setPassword, setConfirmPassword]);
    setRole('admin');
    setTimeout(() => document.getElementById('first_name')?.focus(), 100);
  }

  function showEditForm() {
    if (showForm === 'edit' || !selectedRef.current?.admin_uid) {
      untoggleAll();
      setShowForm(null);
      return;
    }

    toggleOne('edit');
    setShowForm('edit');
    setEmail(selectedRef.current.email);
    setFirstName(selectedRef.current.first_name);
    setLastName(selectedRef.current.last_name);
    setRole(selectedRef.current.role);
    resetInput([setPassword, setConfirmPassword]);

    animateDrop();
  }

  async function reloadData() {
    await getAllAdmins();
    showForm ? setShowForm(null) : null;
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null;
    navigate('/admin/dashboard/admins/q=&f=');
  }

  async function submitAdmin(e) {
    e.preventDefault();
    setLoading(true);

    if (showForm === 'create') {
      const res = await admin.createAdmin(email, first_name, last_name, password, confirmPassword, role);
      if (res) {
        toast.success('Admin created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/admins/q=${res}&f=admin_uid`);
      } else {
        setLoading(false);
      }
    } else if (showForm === 'edit') {
      const res = await admin.updateAdmin(selectedRef.current.admin_uid, email, first_name, last_name, password, confirmPassword, role);
      if (res) {
        toast.success('Admin updated successfully!');
        await reloadData();
        selectedRef.current = null;
      } else {
        setLoading(false);
      }
    }
  }

  async function deleteAdmin() {
    const success = await handleBulkDelete(admin.deleteAdmin, selectedItems, 'admins', setLoading);

    if (success) {
      toast.success(`Successfully deleted ${selectedItems.length} admins.`);
      setSelectedItems([]);
      await reloadData();
      navigate('/admin/dashboard/admins/q=&f=');
    }
    setLoading(false);
  }

  return (
    <div id='manage-content'>
      <div id='admin-loading-container'>
        {loading &&
          <div className='loading-line'>
            <div></div>
          </div>
        }
      </div>
      <div className='manage-header flex-row items-center'>
        <div className='flex-row items-center'>
          <h4>Administrators</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
          <ShowId showId={showId} setShowId={setShowId}/>
        </div>
        <div className='flex-row items-center'>
          {selectedItems.length > 0 && admin.role === 'superadmin' && (
            <button className='admin-delete' onClick={deleteAdmin}>
              Delete ({selectedItems.length})
            </button>
          )}
          <button className='admin-create items-center' onClick={showCreateForm}>
            Create Admin<FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchAdmins(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='admin_uid'>Admin ID</option>
              <option value='first_name'>First Name</option>
              <option value='last_name'>Last Name</option>
              <option value='email'>Email</option>
              <option value='role'>Role</option>
            </select>
          </div>
          <div className='flex-row width-100 items-center'>
            <input 
              type='text'
              id='search-bar'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for an admin...'
            />
            <button type='submit'>
              <BsSearch size={17}/>
            </button>
          </div>
        </form>
      </div>
      {showForm !== 'create' &&
        <div id='admin-table-container'>
          <table id='admin-table'>
            <thead>
              <tr>
              {admin.role === 'superadmin' &&
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    onChange={(e) => setSelectedItems(e.target.checked ? results.map(a => a.admin_uid) : [])}
                    checked={results?.length > 0 && selectedItems.length === results.length}
                  />
                </th>
                }
                {showId && <th>Admin ID</th>}
                <th>Last Name</th>
                <th>First Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {results && results.map(res => (
                <tr
                  key={res.admin_uid}
                  className={`${selectedRef.current?.admin_uid === res.admin_uid && 'selected'}`}>
                  {admin.role === 'superadmin' &&
                  <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(res.admin_uid)}
                      onChange={() => handleCheckboxChange(res.admin_uid, setSelectedItems)}
                    />
                  </td>
                  }
                  {showId && <td onClick={() => selectAdmin(res)}>{res.admin_uid}</td>}
                  <td onClick={() => selectAdmin(res)}>{res.last_name}</td>
                  <td onClick={() => selectAdmin(res)}>{res.first_name}</td>
                  <td onClick={() => selectAdmin(res)}>{res.email}</td>
                  <td onClick={() => selectAdmin(res)}>{res.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {results && results.length < 1 &&
            <div className='no-results'>
              <label>No results found for "{new URLSearchParams(query).get('q')}".</label>
            </div>
          }
        </div>
      }
      {selectedRef.current &&
        <div id='admin-info-display' className='flex-column'>
          <label><b>Admin ID:</b> {selectedRef.current.admin_uid}</label>
          <label><b>Last Name:</b> {selectedRef.current.last_name}</label>
          <label><b>First Name:</b> {selectedRef.current.first_name}</label>
          <label><b>Email:</b> {selectedRef.current.email}</label>
          <label><b>Role:</b> {selectedRef.current.role}</label>
          <label><b>Created At:</b> {convertToReadable(new Date(selectedRef.current.createdAt), 'long')}</label>
          <label><b>Updated At:</b> {convertToReadable(new Date(selectedRef.current.updatedAt), 'long')}</label>
        </div>
      }
      <div id='admin-table-buttons'>
        {selectedRef.current && ((admin.role === 'superadmin') || (admin.role === 'admin' && admin.admin_uid === selectedRef.current.admin_uid)) &&
          <button className='selected-btn select-edit' onClick={showEditForm}>
            Edit Admin
          </button>
        }
      </div>
      <form id='admin-form' className={`two-column-grid ${!showForm && 'none'}`} onSubmit={submitAdmin}>
        {showForm === 'create' && <h4>Create an admin account:</h4>}
        {showForm === 'edit' && <h4>Edit admin account:</h4>}
        <div/>
        <div className='flex-column'>
          <label>First Name</label>
          <input
            className='input-data'
            id='first_name'
            type='text'
            value={first_name}
            onChange={e => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className='flex-column'>
          <label>Last Name</label>
          <input
            className='input-data'
            type='text'
            value={last_name}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </div>
        <div className='flex-column'>
          <label>Email</label>
          <input
            className='input-data'
            type='text'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='flex-column'>
          <label>Role</label>
          <select
            className='input-data'
            value={role}
            onChange={e => setRole(e.target.value)}
            required
          >
            <option value="admin">Admin</option>
            {admin.role === 'superadmin' && <option value="superadmin">Super Admin</option>}
          </select>
        </div>
        <div className='flex-column'>
          <label className='single-line'>
            {showForm === 'edit' && 'New '}Password
            {showForm === 'edit' &&
              <span className='extra-info'>(Leave blank to remain unchanged.)</span>
            }
          </label>
          <input
            className='input-data'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            {...(showForm === 'create' ? { required: true } : {})}
          />
        </div>
        <div className='flex-column'>
          <label className='single-line'>
            Repeat {showForm === 'edit' && 'New '}Password
            {showForm === 'edit' &&
              <span className='extra-info'>(Leave blank to remain unchanged.)</span>
            }
          </label>
          <input
            className='input-data'
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            {...(showForm === 'create' ? { required: true } : {})}
          />
        </div>
        <div id='admin-form-buttons'>
          <button className='file-add-btn' type='submit'>
            {showForm === 'create' && 'Create'}
            {showForm === 'edit' && 'Update'}
          </button>
          <button className='file-cancel-btn' type='button' onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default TabAdmins