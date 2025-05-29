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

function TabStudents({ admin, showId, setShowId }) {
  const [students, setStudents] = useState(null);
  const [results, setResults] = useState(students);
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

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => await getAllStudents();
    init();
  }, []);

  async function getAllStudents() {
    setLoading(true);
    const data = await admin.getAllStudents();
    setStudents(data);

    doSearch(data);
  }

  function doSearch(list = []) {
    const q = new URLSearchParams(query).get('q') || '';
    const f = new URLSearchParams(query).get('f') || '';

    if (!(f === 'uid' || f === 'last_name' || f === 'first_name' || f === 'email' || f === '') === true || !list) {
      navigate('/admin/dashboard/students/q=&f=');
      return;
    }

    const filtered = list.filter((s) => {
      const uid = String(s.uid).toLowerCase().includes(q.toLowerCase());
      const email = String(s.email).toLowerCase().includes(q.toLowerCase());


      if (f === 'uid') {
        return uid;

      } else if (f === 'last_name') {
        return `${s.last_name}`.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'first_name') {
        return `${s.first_name}`.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'email') {
        return email;

      } else {
        const lastToFirst = `${s.last_name} ${s.first_name}`.toLowerCase().includes(q.toLowerCase());
        const firstToLast = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        const combined = `${s.uid} ${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        const rev_combined = `${s.uid} ${s.last_name}, ${s.first_name}`.toLowerCase().includes(q.toLowerCase());
        return (uid || lastToFirst || firstToLast || email || combined || rev_combined);
      }
    })

    setSearch(q);
    setFilter(f);
    setResults(filtered);
    setLoading(false);
  }

  useEffect(() => {
    if (students) {
      doSearch(students);
    }
  }, [students, query]);

  function searchStudents(e) {
    e.preventDefault();

    selectedRef.current = null;
    showForm ? setShowForm(null) : null;

    if (search === '' && filter === 'uid') {
      navigate('/admin/dashboard/students/q=&f=');
      return;
    }
    navigate(`/admin/dashboard/students/q=${search}&f=${filter}`);
  }
  
  function selectStudent(student) {
    if (selectedRef.current?.uid === student.uid) {
      selectedRef.current = null;
      showForm ? setShowForm(null) : null;
      navigate(-1);
      return;
    }
    selectedRef.current = student;
    navigate(`/admin/dashboard/students/q=${student.uid}&f=uid`);
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
    setTimeout(() => document.getElementById('first_name')?.focus(), 100);
  }

  function showEditForm() {
    if (showForm === 'edit' || !selectedRef.current?.uid) {
      setShowForm(null);
      untoggleAll();
      return;
    }
    
    toggleOne('edit');
    setShowForm('edit');
    setEmail(selectedRef.current.email); 
    setFirstName(selectedRef.current.first_name);
    setLastName(selectedRef.current.last_name);
    resetInput([setPassword, setConfirmPassword]);
    
    animateDrop();
  }

  async function reloadData() {
    await getAllStudents();
    showForm ? setShowForm(null) : null;
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null; 
    navigate('/admin/dashboard/students/q=&f=');
  }
  
  async function submitStudent(e) {
    e.preventDefault();
    setLoading(true)

    if (showForm === 'create') {
      const res = await admin.createStudent(email, first_name, last_name, password, confirmPassword);
      if (res) {
        toast.success('Student created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/students/q=${res}&f=uid`);
      } else {
        setLoading(false);
      }

    } else if (showForm === 'edit') {
      const res = await admin.updateStudent(selectedRef.current.uid, email, first_name, last_name, password, confirmPassword);
      if (res) {
        toast.success('Student updated successfully!');
        await reloadData();
        selectedRef.current = null;
      } else {
        setLoading(false);
      }
    }
  }

  async function deleteStudent() {
    const success = await handleBulkDelete(admin.deleteStudent, selectedItems, 'students', setLoading);

    if (success) {
      toast.success(`Successfully deleted ${selectedItems.length} students.`);
      setSelectedItems([]);
      await reloadData();
      navigate('/admin/dashboard/students/q=&f=');
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
          <h4>Students</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
          <ShowId showId={showId} setShowId={setShowId}/>
        </div>
        <div className='flex-row items-center'>
          {selectedItems.length > 0 && admin.role === 'superadmin' && (
            <button className='admin-delete' onClick={deleteStudent}>
              Delete ({selectedItems.length})
            </button>
          )}
          <button className='admin-create items-center' onClick={showCreateForm}>
            Create Student<FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchStudents(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='uid'>UID</option>
              <option value='first_name'>First Name</option>
              <option value='last_name'>Last Name</option>
              <option value='email'>Email</option>
            </select>
          </div>
          <div className='flex-row width-100 items-center'>
            <input 
              type='text' 
              id='search-bar'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for a student...' />
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
                  onChange={(e) => setSelectedItems(e.target.checked ? results.map(s => s.uid) : [])}
                  checked={results?.length > 0 && selectedItems.length === results.length}
                />
              </th>
              }
              {showId && <th>UID</th>}
              <th>Last Name</th>
              <th>First Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map(res => (
              <tr 
                key={res.uid} 
                className={`${selectedRef.current?.uid === res.uid && 'selected'}`}>
                  {admin.role === 'superadmin' &&
                  <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(res.uid)}
                      onChange={() => handleCheckboxChange(res.uid, setSelectedItems)}
                    />
                  </td>
                  }
                {showId && <td onClick={() => selectStudent(res)}>{res.uid}</td>}
                <td onClick={() => selectStudent(res)}>{res.last_name}</td>
                <td onClick={() => selectStudent(res)}>{res.first_name}</td>
                <td onClick={() => selectStudent(res)}>{res.email}</td>
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
          <label><b>UID:</b> {selectedRef.current.uid}</label>
          <label><b>Last Name:</b> {selectedRef.current.last_name}</label>
          <label><b>First Name:</b> {selectedRef.current.first_name}</label>
          <label><b>Email:</b> {selectedRef.current.email}</label>
          <label><b>Created At:</b> {convertToReadable(new Date(selectedRef.current.createdAt), 'long')}</label>
          <label><b>Updated At:</b> {convertToReadable(new Date(selectedRef.current.updatedAt), 'long')}</label>
        </div>
      }
      <div id='admin-table-buttons'>
        {selectedRef.current &&
          <>
            <button 
              className='selected-btn' 
              onClick={() => navigate(`/admin/dashboard/classes/q=${selectedRef.current.uid} ${selectedRef.current.first_name} ${selectedRef.current.last_name}&f=student`)}>
              View Student's Classes
            </button>
            {/* <button
              className='selected-btn'
              onClick={() => navigate(`/admin/dashboard/student/${selectedRef.current.uid}/solo-rooms/q=&f=`)}>
              View Solo Rooms
            </button> */}
            <button className='selected-btn select-edit' onClick={showEditForm}>
              Edit Student
            </button>
          </>
        }
      </div>
      <form id='admin-form' className={`two-column-grid ${!showForm && 'none' }`} onSubmit={submitStudent}>
        {showForm === 'create' && <h4>Create a student account:</h4>}
        {showForm === 'edit' && <h4>Edit student account:</h4>}
        <div/>
        <div className='flex-column'>
          <label>First Name</label>
          <input
            className='input-data'  
            id='first_name'
            type='text' 
            value={first_name} 
            onChange={e => setFirstName(e.target.value)} 
            required />
        </div>
        <div className='flex-column'>
          <label>Last Name</label>
          <input
            className='input-data' 
            type='text' 
            value={last_name} 
            onChange={e => setLastName(e.target.value)} 
            required />
        </div>
        <div className='flex-column'>
          <label>Email</label>
          <input
            className='input-data' 
            type='text' 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required />
        </div>
        <div></div>
        <div className='flex-column'>
          <label className='single-line'>{showForm === 'edit' && 'New '}Password
            {showForm === 'edit' &&
              <span className='extra-info'>(Leave blank to remain unchanged.)</span>
            }
          </label>
          <input
            className='input-data' 
            type='password' 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            {...(showForm === 'create' ? { required: true } : {})}/>
        </div>
        <div className='flex-column'>
          <label className='single-line'>Repeat {showForm === 'edit' && 'New '}Password
            {showForm === 'edit' &&
              <span className='extra-info'>(Leave blank to remain unchanged.)</span>
            }
          </label>
          <input
            className='input-data' 
            type='password' 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            {...(showForm === 'create' ? { required: true } : {})}/>
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

export default TabStudents


