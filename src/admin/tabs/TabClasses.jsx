import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BsSearch, BsPersonPlus } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import { SearchUserList, searchDropdown } from './SearchList';
import ShowId from './ShowId';
import resetInput from '../utils/resetInput';
import animateDrop from '../utils/animateDrop';
import convertToReadable from '../../components/room/utils/convertToReadable';
import { handleCheckboxChange, handleBulkDelete, handleBulkRemove } from '../utils/handleDelete';
import { toggleOne, untoggleAll } from '../utils/toggleButtons';

function TabClasses({ admin, showId, setShowId }) {
  const [classes, setClasses] = useState(null);
  const [results, setResults] = useState(classes);
  const selectedRef = useRef(null);
  const [class_students, setClassStudents] = useState([]);
  const [class_requests, setClassRequests] = useState([]);

  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { query } = useParams();

  const [showForm, setShowForm] = useState(null);
  const [showStudentList, setShowStudentList] = useState(false);
  const [showRequestList, setShowRequestList] = useState(false);
  
  const [course_code, setCourseCode] = useState('');
  const [section, setSection] = useState('');
  const [professor_uid, setProfessorUid] = useState('');
  
  const [professor_list, setProfessorList] = useState(null);
  const [course_list, setCourseList] = useState(null);

  const [student_list, setStudentList] = useState(null);  
  const [student_input, setStudentInput] = useState('');
  const [showStudents, setShowStudents] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const init = async () => await getAllClasses();
    init();
  }, []);
  
  async function getAllClasses() {
    setLoading(true);
    const data = await admin.getAllClasses();
    setClasses(data);
    setResults(data);
    
    doSearch(data);
  }

  function doSearch (list = []) {
    const q = new URLSearchParams(query).get('q') || '';
    const f = new URLSearchParams(query).get('f') || '';

    if (!(f === 'class_id' || f === 'course_code' || f === 'section' || f === 'professor' || f === 'student' || f === 'request' || f === '') === true || !list) {
      navigate('/admin/dashboard/classes/q=&f=');
      return;
    }

    const filtered = list.filter((cl) => {
      const prof_combined = `${cl.professor_uid} ${cl.professor}`.toLowerCase().includes(q.toLowerCase());
      const stud_combined = cl.students.some((s) => {
        const uid = s.uid.toLowerCase().includes(q.toLowerCase());
        const name = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        const rev_name = `${s.last_name}, ${s.first_name}`.toLowerCase().includes(q.toLowerCase());
        const combined = `${s.uid} ${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        return (uid || name || rev_name || combined);
      });
      const req_combined = cl.requests.some((r) => {
        const uid = r.uid.toLowerCase().includes(q.toLowerCase());
        const name = `${r.first_name} ${r.last_name}`.toLowerCase().includes(q.toLowerCase());
        const rev_name = `${r.last_name}, ${r.first_name}`.toLowerCase().includes(q.toLowerCase());
        const combined = `${r.uid} ${r.first_name} ${r.last_name}`.toLowerCase().includes(q.toLowerCase());
        return (uid || name || rev_name || combined);
      })

      if (f === 'class_id') {
        return cl.class_id.toLowerCase().includes(q.toLowerCase());
      } else if (f === 'course_code') {
        return cl.course_code.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'section') {
        return cl.section.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'professor') {
        return prof_combined;
      
      } else if (f === 'student') {
        return stud_combined;

      } else if (f === 'request') {
        return req_combined;

      } else {
        const combined = `${cl.class_id} ${cl.course_code} ${cl.section}`.toLowerCase().includes(q.toLowerCase());
        return (combined || prof_combined || stud_combined || req_combined);
      }
    })
 
    setSearch(q);
    setFilter(`${f ? f : ''}`);
    setResults(filtered);
    setLoading(false);
  } 

  useEffect(() => {
    if (classes) {
      doSearch(classes);
    }
  }, [classes, query]);

  function searchClasses(e) {
    e.preventDefault();
    showForm ? setShowForm(null) : null;
    selectedRef.current = null;
    setClassStudents([]);
    setClassRequests([]);

    if (search === '' && filter === 'class_id') {
      navigate('/admin/dashboard/classes/q=&f=');
      return;
    }
    navigate(`/admin/dashboard/classes/q=${search}&f=${filter}`);
  }
  
  function selectClass(class_data) {
    if (selectedRef.current?.class_id === class_data.class_id) {
      selectedRef.current = null;
      showForm ? setShowForm(null) : null;
      setClassStudents([]);
      setClassRequests([]);
      setShowStudentList(false);
      setShowRequestList(false);
      navigate(-1);
      return;
    }
    
    selectedRef.current = class_data;
    setSelectedStudents([]);
    setClassStudents(class_data.students);
    setClassRequests(class_data.requests);
    navigate(`/admin/dashboard/classes/q=${class_data.class_id}&f=class_id`);
  }

  async function showCreateForm() {
    setLoading(true);
    setShowStudentList(false);
    setShowRequestList(false);
    selectedRef.current = null;
    setClassStudents([]);
    setClassRequests([]);
    
    if (showForm === 'create') {
      setShowForm(null);
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      setLoading(false);
      return;
    }

    setProfessorList(await admin.getAllProfessors());
    setCourseList(await admin.getAllCourses());
    setShowForm('create');
    resetInput([setCourseCode, setSection, setProfessorUid]);
    setLoading(false);
    setTimeout(() => document.getElementById('course_code')?.focus(), 100);
  }

  async function showEditForm() {
    setShowStudentList(false);
    setShowRequestList(false);

    if (showForm === 'edit' || !selectedRef.current?.course_code) {
      untoggleAll();
      setShowForm(null);
      return;
    }
    
    toggleOne('edit');
    setProfessorList(await admin.getAllProfessors());
    setCourseList(await admin.getAllCourses());
    setShowForm('edit');
    setCourseCode(selectedRef.current.course_code);
    setSection(selectedRef.current.section);
    setProfessorUid(selectedRef.current.professor_uid);

    animateDrop();
  }

  function manageList(manage) {
    showForm ? setShowForm(null) : null;
    if (manage === 'students') {
      showStudentList ?  untoggleAll() : toggleOne('stud')
      setShowStudentList(!showStudentList);
      setShowRequestList(false);
    } else if (manage === 'requests') {
      showRequestList ?  untoggleAll() : toggleOne('req')
      setShowRequestList(!showRequestList);
      setShowStudentList(false);
    }
    
    animateDrop();
  }

  async function addStudent(student) {
    setLoading(true);
    const res = await admin.addStudent(selectedRef.current.class_id, student.uid);

    if (res) {
      toast.success('Student added successfully.');
      await reloadData();
      setClassStudents([...class_students, student]);
      selectedRef.current.students.push(student);
    } else {
      setLoading(false);
    }
  }
   
  async function removeStudent() {
    if (!selectedRef.current) return;

    const success = await handleBulkRemove(admin.removeStudent, selectedStudents, selectedRef.current.class_id, 'students', 'class', setLoading);
  
    if (success) {
      toast.success(`${selectedStudents.length} students removed successfully.`);
      await reloadData();
      setSelectedStudents([]);
      setClassStudents(class_students.filter(s => !selectedStudents.includes(s.uid)));
      selectedRef.current.students = selectedRef.current.students.filter(s => !selectedStudents.includes(s.uid));
    }
    setLoading(false);
  }

  async function acceptRequest(student) {
    setLoading(true);
    const res = await admin.acceptRequest(selectedRef.current.class_id, student.uid);

    if (res) {
      toast.success('Accepted request successfully.');
      await reloadData();
      setClassStudents([...class_students, student]);
      setClassRequests(class_requests.filter(r => r.uid !== student.uid));
      selectedRef.current.students.push(student);
      selectedRef.current.requests = selectedRef.current.requests.filter(r => r.uid !== student.uid);
    } else {
      setLoading(false);
    }    
  }

  async function rejectRequest(student) {
    setLoading(true);
    const res = await admin.rejectRequest(selectedRef.current.class_id, student.uid);

    if (res) {
      toast.success('Rejected request successfully.');
      await reloadData();
      setClassRequests(class_requests.filter(r => r.uid !== student.uid));
      selectedRef.current.requests = selectedRef.current.requests.filter(r => r.uid !== student.uid);
    } else {
      setLoading(false);
    }
  }

  async function showDropdown(bool) {
    await searchDropdown(bool, setShowStudents, async () => setStudentList(await admin.getAllStudents()))
  }


  async function reloadData() {
    await getAllClasses();
    showForm ? setShowForm(null) : null;
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null; 
    setClassStudents([]);
    setClassRequests([]);
    navigate('/admin/dashboard/classes/q=&f=');
  }
  
  async function submitClass(e) {
    e.preventDefault();
    setLoading(true);

    if (showForm === 'create') {
      const res = await admin.createClass(course_code, section, professor_uid);
      if (res) {
        toast.success('Class created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/classes/q=${res}&f=class_id`);
      } else {
        setLoading(false);
      }

    } else if (showForm === 'edit') {
      const res = await admin.updateClass(selectedRef.current.class_id, course_code, section, professor_uid);
      if (res) {
        toast.success('Class updated successfully!');
        await reloadData();
        selectedRef.current = null;
        setClassStudents([]);
        setClassRequests([]);
      } else {
        setLoading(false);
      }
    }
  }

  async function deleteClass() {
    const success = await handleBulkDelete(admin.deleteClass, selectedItems, 'classes', setLoading);
  
    if (success) {
      toast.success(`Successfully deleted ${selectedItems.length} classes.`);
      setSelectedItems([]);
      await reloadData();
      navigate('/admin/dashboard/classes/q=&f=');
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
          <h4>Classes</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
          <ShowId showId={showId} setShowId={setShowId}/>
        </div>
        <div className='flex-row items-center'>
          {selectedItems.length > 0 && admin.role === 'superadmin' && (
            <button className='admin-delete' onClick={deleteClass}>
              Delete ({selectedItems.length})
            </button>
          )}
          <button className='admin-create items-center' onClick={showCreateForm}>
            Create Class<FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchClasses(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='class_id'>Class ID</option>
              <option value='course_code'>Course Code</option>
              <option value='section'>Section</option>
              <option value='professor'>Professor</option>
              <option value='student'>Student</option>
              <option value='request'>Request</option>
            </select>
          </div>
          <div className='flex-row width-100 items-center'>
            <input 
              type='text' 
              id='search-bar'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for a course...' />
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
                  onChange={(e) => setSelectedItems(e.target.checked ? results.map(c => c.class_id) : [])}
                  checked={results?.length > 0 && selectedItems.length === results.length}
                />
              </th>
              }
              {showId && <th>Class ID</th>}
              <th>Course Code</th>
              <th>Section</th>
              <th>Professor</th>
              <th>Students</th>
              <th>Requests</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map(res => (
              <tr 
                key={res.class_id} 
                className={`${selectedRef.current?.class_id === res.class_id && 'selected'}`}>
                {admin.role === 'superadmin' &&
                <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(res.class_id)}
                    onChange={() => handleCheckboxChange(res.class_id, setSelectedItems)}
                  />
                </td>
                }
                {showId && <td onClick={() => selectClass(res)}>{res.class_id}</td>}
                <td onClick={() => selectClass(res)}>{res.course_code}</td>
                <td onClick={() => selectClass(res)}>{res.section}</td>
                <td onClick={() => selectClass(res)}>{res.professor}</td>
                <td onClick={() => selectClass(res)}>{res.students.length}</td>
                <td onClick={() => selectClass(res)}>{res.requests.length}</td>
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
          <label><b>Class ID:</b> {selectedRef.current.class_id}</label>
          <label><b>Course Code:</b> {selectedRef.current.course_code}</label>
          <label><b>Section:</b> {selectedRef.current.section}</label>
          <label><b>Professor:</b> {selectedRef.current.professor} {selectedRef.current.professor_uid !== '' && <Link to={`/admin/dashboard/professors/q=${selectedRef.current.professor_uid}&f=uid`}>(View Info)</Link>}</label>
          <label><b>No. of Students:</b> {selectedRef.current.students?.length}</label>
          <label><b>No. of Requests:</b> {selectedRef.current.requests?.length}</label>
          <label><b>Created At:</b> {convertToReadable(new Date(selectedRef.current.createdAt), 'long')}</label>
          <label><b>Updated At:</b> {convertToReadable(new Date(selectedRef.current.updatedAt), 'long')}</label>
        </div>
      }      
      <div id='admin-table-buttons'>
        {selectedRef.current &&
        <>
          <button className='selected-btn' onClick={() => navigate(`/admin/dashboard/class/${selectedRef.current.class_id}/teams/q=&f=`)}>
            View Teams
          </button>
          <button className='selected-btn' onClick={() => navigate(`/admin/dashboard/class/${selectedRef.current.class_id}/activities/q=&f=`)}>
            View Activities
          </button>
          <button className='selected-btn select-stud' onClick={() => manageList('students')}>
            Manage Students
          </button>
          <button className='selected-btn select-req' onClick={() => manageList('requests')}>
            Manage Requests 
          </button>
          <button className='selected-btn select-edit' onClick={showEditForm}>
            Edit Class
          </button>
        </>
        }
      </div>
      <form id='admin-form' className={`two-column-grid ${!showForm && 'none' }`} onSubmit={submitClass}>
        {showForm === 'create' && <h4>Create a class:</h4>}
        {showForm === 'edit' && <h4>Edit class:</h4>}
        <div/>
        <div className='flex-column'>
          <label>Select Course Code</label>
          <select value={course_code} onChange={e => setCourseCode(e.target.value)} required>
            <option value=''>Select Course Code</option>
            {course_list && course_list.map(cou => (
              <option 
                key={cou.course_code} 
                value={cou.course_code} 
                className='single-line'>
                {cou.course_code} - {cou.course_title}
              </option>
            ))}
          </select>
        </div>
        <div className='flex-column'>
          <label>Section</label>
          <input
            className='input-data'  
            id='section'
            type='text' 
            value={section} 
            onChange={e => setSection(e.target.value)} 
            required />
        </div>
        <div className='flex-column'>
          <label>Select Professor</label>
          <select value={professor_uid} onChange={e => setProfessorUid(e.target.value)} required>
            <option value=''>Select Professor</option>
            {professor_list && professor_list.map(prof => (
              <option 
                key={prof.uid} 
                value={prof.uid}
                className='single-line'>
                {prof.first_name} {prof.last_name}
              </option>
            ))}
          </select>
        </div>
        <div></div>
        <div id='admin-form-buttons'>
          <button className='file-add-btn' type='submit'>
            {showForm === 'create' && 'Create'}
            {showForm === 'edit' && 'Update'}
          </button>
          <button className='file-cancel-btn' type='button' onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      </form>
      {showStudentList && selectedRef.current &&
      <>
        <div className='admin-member-list-container flex-column'>
          <h4>Students</h4>
          <div className='sub-admin-form flex-row items-center'>
            <input 
              type="checkbox"
              onChange={(e) => setSelectedStudents(e.target.checked ? class_students.map(s => s.uid) : [])}
              checked={class_students?.length > 0 && selectedStudents.length === class_students.length}
            />
            {selectedStudents.length === 0 &&
            <>
              <BsPersonPlus size={20} />
              <label>Add Student: </label>
              <div className='search-dropdown-input flex-row'>
                <input  
                  type='text'
                  className='input-data'
                  value={student_input}
                  onChange={e => setStudentInput(e.target.value)}
                  onFocus={() => showDropdown(true)}
                  onBlur={() => showDropdown(false)}
                  placeholder='Add a student for this class...'
                />
                {showStudents && student_list &&
                  <SearchUserList 
                    list={student_list.filter(sl => !class_students.some(st => st.uid === sl.uid))} 
                    filter={student_input} 
                    selectUser={addStudent}/>
                }
              </div>
            </>
            }
            {selectedStudents.length > 0 && (
              <button className='remove-btn' onClick={removeStudent}>
                Remove Selected ({selectedStudents.length})
              </button>
            )}
          </div>
          <table className='admin-member-list'>
            <tbody>
              {class_students.map((stud) =>
                <tr className='item' key={stud.uid}>
                  <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(stud.uid)}
                      onChange={() => handleCheckboxChange(stud.uid, setSelectedStudents)}
                      />
                  </td>
                  <td className='td-1'><label>{stud.last_name}, {stud.first_name}</label></td>
                  <td><label>{stud.email}</label></td>
                  <td className='tbl-acts items-center'>
                    <Link className='info-btn' to={`/admin/dashboard/students/q=${stud.uid} ${stud.first_name} ${stud.last_name}&f=`}>
                      Student Info
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {class_students.length === 0 &&
            <div className='no-results'>
              <label className='single-line'>There are no students in this class.</label>
            </div>
          }
        </div>
      </>
      }
      {showRequestList && selectedRef.current &&
        <div className='admin-member-list-container flex-column'>
          <h4>Requests</h4>
          <table className='admin-member-list'>
            <tbody>
            {class_requests.map((req) =>
              <tr className='item' key={req.uid}>
                <td className='td-1'><label>{req.last_name}, {req.first_name}</label></td>
                <td><label>{req.email}</label></td>
                <td className='tbl-acts items-center'>
                  <button className='accept-btn' onClick={() => acceptRequest(req)}>Accept</button>
                  <button className='remove-btn' onClick={() => rejectRequest(req)}>Reject</button>
                  <Link className='info-btn' to={`/admin/dashboard/students/q=${req.uid} ${req.first_name} ${req.last_name}&f=`}>
                    Student Info
                  </Link>
                </td>
              </tr>
            )}
            </tbody>
          </table>
          {class_requests.length === 0 &&
            <div className='no-results'>
              <label className='single-line'>There are no requests for this class.</label>
            </div>
          }
        </div>
      }
    </div>
  )
}

export default TabClasses
