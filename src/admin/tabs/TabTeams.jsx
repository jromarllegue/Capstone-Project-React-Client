import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BsSearch, BsPersonPlus } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { FaChevronRight } from 'react-icons/fa';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import { SearchUserList, searchDropdown } from './SearchList';
import ShowId from './ShowId';
import animateDrop from '../utils/animateDrop';
import convertToReadable from '../../components/room/utils/convertToReadable';
import { handleCheckboxChange, handleBulkDelete, handleBulkRemove } from '../utils/handleDelete';
import { toggleOne, untoggleAll } from '../utils/toggleButtons';

function TabTeams({ admin, showId, setShowId }) {
  const [teams, setTeams] = useState(null);
  const [parent_class, setParentClass] = useState(null);

  const [results, setResults] = useState(teams);
  const selectedRef = useRef(null);
  const [team_members, setTeamMembers] = useState([]);

  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { foreign_name, foreign_key, query } = useParams();

  const [showForm, setShowForm] = useState(null);
  const [showMemberList, setShowMemberList] = useState(false);
  
  const [team_name, setTeamName] = useState('');
  
  const [student_list, setStudentList] = useState(null);  
  const [member_input, setMemberInput] = useState('');
  const [showStudents, setShowStudents] = useState(false);
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => await getAllTeams();
    init();
  }, []);
  
  async function getAllTeams() {
    setLoading(true);

    if (foreign_name === 'class' && foreign_key) {
      const data = await admin.getAllTeams(foreign_key);
      setTeams(data.teams);      
      doSearch(data.teams);
      setParentClass(data.class);

    } else {
        navigate('/admin/dashboard/classes/q=&f=');
    }
  }

  function doSearch (list = []) {
    const q = new URLSearchParams(query).get('q') || '';
    const f = new URLSearchParams(query).get('f') || '';

    if (!list) {
      return;
    }

    if (!(f === 'team_id' || f === 'team_name' || f === 'member' || f === '') === true) {
      navigate('/admin/dashboard/classes/q=&f=');
      return;
    }

    const filtered = list.filter((t) => {
      const mem_combined = t.members.some((s) => {
        const uid = s.uid.toLowerCase().includes(q.toLowerCase());
        const name = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        const rev_name = `${s.last_name}, ${s.first_name}`.toLowerCase().includes(q.toLowerCase());
        const combined = `${s.uid} ${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        return (uid || name || rev_name || combined);
      });

      if (f === 'team_id') {
        return t.team_id.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'team_name') {
        return t.team_name.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'member') {
        return mem_combined;

      } else {
        const combined = `${t.team_id} ${t.team_name}`.toLowerCase().includes(q.toLowerCase());
        return (combined || mem_combined);
      }
    })
 
    setSearch(q);
    setFilter(`${f ? f : ''}`);
    setResults(filtered);
    setLoading(false);
  } 

  useEffect(() => {
    if (teams) {
      doSearch(teams);
    }
  }, [teams, query]);

  function searchTeams(e) {
    e.preventDefault();
    showForm ? setShowForm(null) : null;
    selectedRef.current = null;
    setTeamMembers([]);

    if (search === '' && filter === 'team_id') {
      navigate(`/admin/dashboard/class/${foreign_key}/teams/q=&f=`);
      return;
    }
    navigate(`/admin/dashboard/class/${foreign_key}/teams/q=${search}&f=${filter}`);
  }
  
  function selectTeam(team) {
    if (selectedRef.current?.team_id === team.team_id) {
      selectedRef.current = null;
      showForm ? setShowForm(null) : null;
      setTeamMembers([]);
      setShowMemberList(false);
      navigate(-1);
      return;
    }
    
    selectedRef.current = team;
    setTeamMembers(team.members);      
    navigate(`/admin/dashboard/class/${foreign_key}/teams/q=${team.team_id}&f=team_id`);
  }

  async function showCreateForm() {
    setLoading(true);
    setShowMemberList(false);
    selectedRef.current = null;
    setTeamMembers([]);

    if (showForm === 'create') {
      setShowForm(null);
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      setLoading(false);
      return;
    }

    setShowForm('create');
    setTeamName('');
    setLoading(false);
    setTimeout(() => document.getElementById('team_name')?.focus(), 100);
  }

  async function showEditForm() {
    setShowMemberList(false);

    if (showForm === 'edit' || !selectedRef.current?.team_name) {
      untoggleAll();
      setShowForm(null);
      return;
    }
    toggleOne('edit')
    setShowForm('edit');
    setTeamName(selectedRef.current.team_name);

    animateDrop();
  }

  async function manageList() {
    showForm ? setShowForm(null) : null;
    showMemberList ? untoggleAll() : toggleOne('mem');
    setShowMemberList(!showMemberList);
    setMemberInput('');
    setShowStudents(false);

    animateDrop();
  }

  async function addMember(student) {
    setLoading(true);
    const res = await admin.addMember(selectedRef.current.team_id, student.uid);

    if (res) {
      toast.success('Student added to the team successfully.');
      await reloadData();
      setTeamMembers([...team_members, student]);
      selectedRef.current.members.push(student);
    } else {
      setLoading(false);
    }
  }
   
  async function removeMember() {
    const success = await handleBulkRemove(admin.removeMember, selectedMembers, selectedRef.current.team_id, 'members', 'team', setLoading);
  
    if (success) {
      toast.success(`Successfully removed ${selectedMembers.length} members.`);
      setSelectedMembers([]);
      await reloadData();
      setTeamMembers(team_members.filter(m => !selectedMembers.includes(m.uid)));
      selectedRef.current.members = selectedRef.current.members.filter(m => !selectedMembers.includes(m.uid));
    }
    setLoading(false);
  }
  
  async function showDropdown(bool) {
    await searchDropdown(bool, setShowStudents, async () => setStudentList(await admin.getClassStudents(foreign_key)));
  }

  async function reloadData() {
    await getAllTeams();
    showForm ? setShowForm(null) : null;
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null; 
    setTeamMembers([]);
    navigate(`/admin/dashboard/class/${foreign_key}/teams/q=&f=`);
  }

  
  async function submitTeam(e) {
    e.preventDefault();
    setLoading(true);

    if (showForm === 'create') {
      const res = await admin.createTeam(foreign_key, team_name);
      if (res) {
        toast.success('Team created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/class/${foreign_key}/teams/q=&f=`);
      } else {
        setLoading(false);
      }

    } else if (showForm === 'edit') {
      const res = await admin.updateTeam(selectedRef.current.team_id, team_name);
      if (res) {
        toast.success('Team updated successfully!');
        await reloadData();
        selectedRef.current = null;
        setTeamMembers([]);
      } else {
        setLoading(false);
      }
    }
  }

  async function deleteTeam() {
    const success = await handleBulkDelete(admin.deleteTeam, selectedItems, 'teams', setLoading);
  
    if (success) {
      toast.success(`Successfully deleted ${selectedItems.length} teams.`);
      setSelectedItems([]);
      await reloadData();
      navigate(`/admin/dashboard/class/${foreign_key}/teams/q=&f=`);
    }
    setLoading(false);
  }
  
  return (
    <div id='manage-content' className='sub'>
      <div id='admin-loading-container'>
        {loading &&
          <div className='loading-line'>
              <div></div>
          </div>
        }
      </div>
      <div className='origin-div flex-row items-center'>
        {parent_class &&
          <>
            Class:
            <b><Link to={`/admin/dashboard/classes/q=${parent_class.class_id}&f=class_id`}>{parent_class.course_code} {parent_class.section}</Link></b>
            <label className='items-center'><FaChevronRight size={17}/></label>
            Teams
          </>
        }
      </div>
      <div className='manage-header flex-row items-center'>
        <div className='flex-row items-center'>
          <h4>Teams</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
          <ShowId showId={showId} setShowId={setShowId}/>
        </div>
        <div className='flex-row items-center'>
          {selectedItems.length > 0 && admin.role === 'superadmin' && (
            <button className='admin-delete' onClick={deleteTeam}>
              Delete ({selectedItems.length})
            </button>
          )}
          <button className='admin-create items-center' onClick={showCreateForm}>
            Create Team<FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchTeams(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='team_id'>Team ID</option>
              <option value='team_name'>Team Name</option>
              <option value='member'>Member</option>
            </select>
          </div>
          <div className='flex-row width-100 items-center'>
            <input 
              type='text' 
              id='search-bar'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for a team...' />
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
                  onChange={(e) => setSelectedItems(e.target.checked ? results.map(t => t.team_id) : [])}
                  checked={results?.length > 0 && selectedItems.length === results.length}
                />
              </th>
              }
              {showId && <th>Team ID</th>}
              <th>Team Name</th>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map(res => (
              <tr 
                key={res.team_id} 
                className={`${selectedRef.current?.team_id === res.team_id && 'selected'}`}>
                {admin.role === 'superadmin' &&
                <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(res.team_id)}
                    onChange={() => handleCheckboxChange(res.team_id, setSelectedItems)}
                  />
                </td>
                }
                {showId && <td onClick={() => selectTeam(res)}>{res.team_id}</td>}
                <td onClick={() => selectTeam(res)}>{res.team_name}</td>
                <td onClick={() => selectTeam(res)}>{res.members.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {results && results.length < 1 &&
          <>
            {new URLSearchParams(query).get('q') !== '' &&
              <div className='no-results'>
                <label>No results found for "{new URLSearchParams(query).get('q')}" in this class.</label>
              </div>
            }
            {new URLSearchParams(query).get('q') === '' &&
              <div className='no-results'>
                <label>This class doesn't have any team.</label>
              </div>
            }
          </>
        }
      </div>
      }
      {selectedRef.current &&
        <div id='admin-info-display' className='flex-column'>
          <label><b>Team ID:</b> {selectedRef.current.team_id}</label>
          <label><b>Team Name:</b> {selectedRef.current.team_name}</label>
          <label><b>Class:</b> {parent_class.course_code} - {parent_class.section}</label>
          <label><b>No. of Members:</b> {selectedRef.current.members?.length}</label>
          <label><b>Created At:</b> {convertToReadable(new Date(selectedRef.current.createdAt), 'long')}</label>
          <label><b>Updated At:</b> {convertToReadable(new Date(selectedRef.current.updatedAt), 'long')}</label>
        </div>
      }            
      <div id='admin-table-buttons'>
      {selectedRef.current &&
        <>
          <button className='selected-btn' onClick={() => navigate(`/admin/dashboard/classes/q=${foreign_key}&f=class_id`)}>
            View Class
          </button>
          <button className='selected-btn' onClick={() => navigate(`/admin/dashboard/team/${selectedRef.current.team_id}/assigned-rooms/q=&f=`)}>
            View Assigned Rooms 
          </button>
          <button className='selected-btn select-mem' onClick={manageList}>
            Manage Members
          </button>
          <button className='selected-btn select-edit' onClick={showEditForm}>
            Edit Team Name
          </button>
        </>
      }
      </div>
      <form id='admin-form' className={`flex-column ${!showForm && 'none' }`} onSubmit={submitTeam}>
        {showForm === 'create' && <h4>Create a team for: <span>{parent_class?.course_code} {parent_class?.section}</span></h4>}
        {showForm === 'edit' && <h4>Edit team:</h4>}
        <div className='form-space'/>
        <div className='flex-column'>
          <label>Team Name</label>
          <input
            className='input-data'  
            id='section'
            type='text' 
            value={team_name} 
            onChange={e => setTeamName(e.target.value)} 
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
      {showMemberList && selectedRef.current &&
      <>
        <div className='admin-member-list-container flex-column'>
          <h4>Team Members</h4>
          <div className='sub-admin-form flex-row items-center'>
            <input 
              type="checkbox"
              onChange={(e) => setSelectedMembers(e.target.checked ? team_members.map(m => m.uid) : [])}
              checked={team_members?.length > 0 && selectedMembers.length === team_members.length}
            />
            {selectedMembers.length === 0 &&
            <>
              <BsPersonPlus size={20} />
              <label>Add Member: </label>
              <div className='search-dropdown-input flex-row'>
                <input  
                  type='text'
                  className='input-data'
                  value={member_input}
                  onChange={e => setMemberInput(e.target.value)}
                  onFocus={() => showDropdown(true)}
                  onBlur={() => showDropdown(false)}
                  placeholder='Add a student for this class...'
                />
                {showStudents && student_list &&
                  <SearchUserList 
                    list={student_list.filter(sl => !team_members.some(st => st.uid === sl.uid))} 
                    filter={member_input} 
                    selectUser={addMember}/>
                }
              </div>
            </>
            }
            {selectedMembers.length > 0 && (
              <button className='remove-btn' onClick={removeMember}>
                Remove Selected ({selectedMembers.length})
              </button>
            )}
          </div>
          <table className='admin-member-list'>
            <tbody>
              {team_members.map((mem) =>
                <tr className='item' key={mem.uid}>
                  <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(mem.uid)}
                      onChange={() => handleCheckboxChange(mem.uid, setSelectedMembers)}
                    />
                  </td>
                  <td className='td-1'><label>{mem.last_name} {mem.first_name}</label></td>
                  <td><label>{mem.email}</label></td>
                  <td className='tbl-acts items-center'>
                    <button className='info-btn' onClick={() => navigate(`/admin/dashboard/students/q=${mem.uid} ${mem.first_name} ${mem.last_name}&f=`)}>
                      Student Info
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
      }
    </div>
  )
}

export default TabTeams