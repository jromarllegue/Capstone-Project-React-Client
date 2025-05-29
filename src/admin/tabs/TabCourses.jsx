import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import resetInput from '../utils/resetInput';
import animateDrop from '../utils/animateDrop';
import convertToReadable from '../../components/room/utils/convertToReadable';
import { handleCheckboxChange, handleBulkDelete } from '../utils/handleDelete';
import { toggleOne, untoggleAll } from '../utils/toggleButtons';

function TabCourses({ admin }) {
  const [courses, setCourses] = useState(null);
  const [results, setResults] = useState(courses);
  const selectedRef = useRef(null);

  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const { query } = useParams();
  const { state } = useLocation();

  const [showForm, setShowForm] = useState(null);
  const [course_code, setCourseCode] = useState('');
  const [course_title, setCourseTitle] = useState('');

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => await getAllCourses();
    init();
  }, []);

  async function getAllCourses() {
    setLoading(true);
    const data = await admin.getAllCourses();
    setCourses(data);
    setResults(data);

    doSearch(data);
  }

  function doSearch(list = []) {
    const q = new URLSearchParams(query).get('q') || '';
    const f = new URLSearchParams(query).get('f') || '';

    if (!(f === 'course_code' || f === 'course_title' || f === '') === true || !list) {
      navigate('/admin/dashboard/courses/q=&f=');
      return;
    }

    const filtered = list.filter((s) => {
      const course_code = String(s.course_code).toLowerCase().includes(q.toLowerCase());
      const course_title = String(s.course_title).toLowerCase().includes(q.toLowerCase());
      
      if (f === 'course_code') {
        return course_code;

      } else if (f === 'course_title') {
        return course_title;

      } else {
        const combined = `${s.course_code} ${s.course_title}`.toLowerCase().includes(q.toLowerCase());
        return (course_code || course_title || combined);
      }
    })

    setSearch(q);
    setFilter(`${f ? f : ''}`);
    setResults(filtered);
    setLoading(false);
  }



  useEffect(() => {
    if (courses) {
      doSearch(courses);
    }
  }, [courses, query]);

  function searchCourses(e) {
    e.preventDefault();
    showForm ? setShowForm(null) : null;
    selectedRef.current = null;

    navigate(`/admin/dashboard/courses/q=${search}&f=${filter}`);
  }
  
  function selectCourse(course) {
    if (selectedRef.current?.course_code === course.course_code) {
      selectedRef.current = null;
      showForm ? setShowForm(null) : null;
      navigate(-1);
      return;
    }
    selectedRef.current = course;
    navigate(`/admin/dashboard/courses/q=${course.course_code}&f=course_code`);
  }

  function showCreateForm() {
    selectedRef.current = null;

    if (showForm === 'create') {
      setShowForm(null);
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      return;
    }

    setShowForm('create');
    resetInput([setCourseCode, setCourseTitle])
    setTimeout(() => document.getElementById('course_code')?.focus(), 100);
  }

  function showEditForm() {
    if (showForm === 'edit' || !selectedRef.current?.course_code) {
      untoggleAll()
      setShowForm(null);
      return;
    }

    toggleOne('edit');
    setShowForm('edit');
    setCourseCode(selectedRef.current.course_code);
    setCourseTitle(selectedRef.current.course_title);

    animateDrop();
  }

  async function reloadData() {
    await getAllCourses();
    showForm ? setShowForm(null) : null;
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null; 
    navigate('/admin/dashboard/courses/q=&f=');
  }
  
  async function submitCourse(e) {
    e.preventDefault();
    setLoading(true);

    if (showForm === 'create') {
      const res = await admin.createCourse(course_code, course_title);
      if (res) {
        toast.success('Course created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/courses/q=${res}&f=course_code`);
      } else {
        setLoading(false);
      }

    } else if (showForm === 'edit') {
      const res = await admin.updateCourse(selectedRef.current.course_code, course_code, course_title);
      if (res) {
        toast.success('Course updated successfully!');
        await reloadData();
        selectedRef.current = null;
      } else {
        setLoading(false);
      }
    
    }
  }

  async function deleteCourse() {
    const success = await handleBulkDelete(admin.deleteCourse, selectedItems, 'courses', setLoading);
  
    if (success) {
      toast.success(`Successfully deleted ${selectedItems.length} courses.`);
      setSelectedItems([]);
      await reloadData();
      navigate('/admin/dashboard/courses/q=&f=');
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
          <h4>Courses</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
        </div>
        <div className='flex-row items-center'>
        {selectedItems.length > 0 && admin.role === 'superadmin' && (
            <button className='admin-delete' onClick={deleteCourse}>
              Delete ({selectedItems.length})
            </button>
          )}
          <button className='admin-create items-center' onClick={showCreateForm}>
            Create Course<FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchCourses(e)}>
        <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='course_code'>Course Code</option>
              <option value='course_title'>Course Title</option>
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
                  onChange={(e) => setSelectedItems(e.target.checked ? results.map(c => c.course_code) : [])}
                  checked={results?.length > 0 && selectedItems.length === results.length}
                />
              </th>
              }
              <th>Course Code</th>
              <th>Course Title</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map(res => (
              <tr 
                key={res.course_code} 
                className={`${selectedRef.current?.course_code === res.course_code && 'selected'}`}>
                {admin.role === 'superadmin' &&
                <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(res.course_code)}
                    onChange={() => handleCheckboxChange(res.course_code, setSelectedItems)}
                  />
                </td>
                }
                <td onClick={() => selectCourse(res)}>{res.course_code}</td>
                <td onClick={() => selectCourse(res)}>{res.course_title}</td>
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
          <label><b>Course Code:</b> {selectedRef.current.course_code}</label>
          <label><b>Course Title:</b> {selectedRef.current.course_title}</label>
          <label><b>Created At:</b> {convertToReadable(new Date(selectedRef.current.createdAt), 'long')}</label>
          <label><b>Updated At:</b> {convertToReadable(new Date(selectedRef.current.updatedAt), 'long')}</label>
        </div>
      }
      <div id='admin-table-buttons' className='long'>
        {selectedRef.current &&
          <>
            <button className='selected-btn' onClick={() => navigate(`/admin/dashboard/classes/q=${selectedRef.current.course_code}&f=course_code`)}>
              View Classes Within this Course
            </button>
            <button className='selected-btn select-edit' onClick={showEditForm}>
              Edit Course
            </button>
          </>
        }
      </div>
      <form id='admin-form' className={`two-column-grid ${!showForm && 'none' }`} onSubmit={submitCourse}>
        {showForm === 'create' && <h4>Create a course:</h4>}
        {showForm === 'edit' && <h4>Edit course:</h4>}
        <div/>
        <div className='flex-column'>
          <label>Course Code</label>
          <input
            className='input-data'  
            id='course_code'
            type='text' 
            value={course_code} 
            onChange={e => setCourseCode(e.target.value)} 
            required />
        </div>
        <div className='flex-column'>
          <label>Course Title</label>
          <input
            className='input-data'  
            id='course_title'
            type='text' 
            value={course_title} 
            onChange={e => setCourseTitle(e.target.value)} 
            required />
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

export default TabCourses