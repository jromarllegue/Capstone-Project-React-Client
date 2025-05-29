import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { FaChevronRight } from 'react-icons/fa';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import ShowId from './ShowId';
import convertToReadable from '../../components/room/utils/convertToReadable';
import { handleCheckboxChange, handleBulkDelete } from '../utils/handleDelete';

function TabAssignedRooms({ admin, showId, setShowId }) {
  const [assigned_rooms, setAssignedRooms] = useState(null);
  const [parent_class, setParentClass] = useState(null);
  const [parent_activity, setParentActivity] = useState(null);
  const [parent_team, setParentTeam] = useState(null);

  const [results, setResults] = useState(null);
  const selectedRef = useRef(null);
  
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { foreign_name, foreign_key, query } = useParams();

  const [showForm, setShowForm] = useState(null);

  const [team_id, setTeamId] = useState('');

  const [team_list, setTeamList] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    const init = async () => await getAllAssignedRooms();
    init();
  }, []);
  
  async function getAllAssignedRooms() {
    setLoading(true);

    if (foreign_name && foreign_key) {
      if (foreign_name === 'team' || foreign_name === 'activity') {
        const data = await admin.getAllAssignedRooms(foreign_name, foreign_key);
        setAssignedRooms(data.rooms);
        doSearch(data.rooms);
        setParentClass(data.class);
        setParentActivity(data.activity);
        setParentTeam(data.team);

      } else {
        navigate('/admin/dashboard/classes/q=&f=');
      }
    } else {
      navigate('/admin/dashboard/classes/q=&f=');
    }
  }

  function doSearch (list = []) {
    const q = new URLSearchParams(query).get('q') || '';
    const f = new URLSearchParams(query).get('f') || '';
    
    if (!(f === 'room_id' || f === 'activity' || f === 'team' || f === '') === true || !list) {
      navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=&f=`);
      return;
    }

    const filtered = list.filter((asr) => {
      const act_combined = `${asr?.activity_id} ${asr?.activity_name}`.toLowerCase().includes(q.toLowerCase());
      const team_combined = `${asr.owner_id !== '' ? asr.owner_id : 'None' } ${asr.room_name}`.toLowerCase().includes(q.toLowerCase());

      if (f === 'room_id') {
        return asr.room_id.toLowerCase().includes(q.toLowerCase());
        
      } else if (f === 'activity') {
        return act_combined;

      } else if (f === 'team') {
        return team_combined;
        
      } else {
        const room_combined = `${asr.room_id} ${asr.room_name}`.toLowerCase().includes(q.toLowerCase());
        return (room_combined || team_combined || act_combined);
      }
    })
 
    setSearch(q);
    setFilter(`${f ? f : ''}`);
    setResults(filtered);
    setLoading(false);
  } 

  useEffect(() => {
    doSearch(assigned_rooms);
  }, [query]);

  function searchAssignedRooms(e) {
    e.preventDefault();
    showForm ? setShowForm(null) : null;
    selectedRef.current = null;

    if (search === '' && filter === 'room_id') {
      navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=&f=`);
      return;
    } 
    navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=${search}&f=${filter}`);
  }
  
  function selectRoom(room) {
    if (selectedRef.current?.room_id === room.room_id) {
      selectedRef.current = null;
      navigate(-1);
      return;
    }

    selectedRef.current = room;
    navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=${room.room_id}&f=room_id`);
  }

  async function showCreateForm() {
    setLoading(true);
    selectedRef.current = null;

    if (showForm === 'create') {
      setShowForm(null);
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      setLoading(false);
      return;
    }

    const data = await admin.getAllTeams(parent_class.class_id);
    if (data?.teams) {
      setTeamList(data.teams);
    } else {
      toast.error('Retrieving class\' teams failed!');
      showForm ? setShowForm(null) : null;
    }

    setShowForm('create');
    setLoading(false);
    setTimeout(() => document.getElementById('activity_name')?.focus(), 100);
  }

  async function reloadData() {
    await getAllAssignedRooms();
    showForm ? setShowForm(null) : null;
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null; 
    navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=&f=`);
  }

  async function submitAssignedRoom(e) {
    e.preventDefault();
    setLoading(true);

    if (showForm === 'create') {
      const res = await admin.createAssignedRoom(foreign_key, team_id);
      if (res) {
        toast.success('New room created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=${res}&f=room_id`);
      } else {
        setLoading(false);
      }
    }
  }

  async function deleteAssignedRoom() {
    const success = await handleBulkDelete(admin.deleteAssignedRoom, selectedItems, 'rooms', setLoading);
  
    if (success) {
      toast.success(`Successfully deleted ${selectedItems.length} rooms`);
      setSelectedItems([]);
      await reloadData();
      navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=&f=`);
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
        </>
        }
        {foreign_name === 'activity' && parent_activity &&
          <>
            Activity:
            <b><Link to={`/admin/dashboard/class/${parent_activity.class_id}/activities/q=${parent_activity.activity_id}&f=activity_id`}>{parent_activity.activity_name}</Link></b>
            <label className='items-center'><FaChevronRight size={17}/></label>
            Assigned Rooms
          </>
        }
        {foreign_name === 'team' && parent_team &&
          <>
            Team: 
            <b>
              {parent_team && parent_team.team_id &&
                <Link to={`/admin/dashboard/class/${parent_team.class_id}/teams/q=${parent_team.team_id}&f=`}>{parent_team.team_name}</Link>
              }
              {parent_team && !parent_team.team_id &&
                <>(team_deleted)</>
              }
            </b>
            <label className='items-center'><FaChevronRight size={17}/></label>
            Assigned Rooms
          </>
        }
      </div>
      <div className='manage-header flex-row items-center'>
        <div className='flex-row items-center'>
          <h4 className='normal'>Assigned Rooms</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
          <ShowId showId={showId} setShowId={setShowId}/>
        </div>
        <div className='flex-row items-center'>
          {selectedItems.length > 0 && admin.role === 'superadmin' && (
            <button className='admin-delete' onClick={deleteAssignedRoom}>
              Delete ({selectedItems.length})
            </button>
          )}
          {foreign_name === 'activity' &&
            <button className='admin-create items-center' onClick={showCreateForm}>
              Create Room<FiPlus size={17}/>
            </button>
          }
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchAssignedRooms(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='room_id'>Room ID</option>
              {foreign_name === 'activity' && <option value='team'>Team</option>}
              {foreign_name === 'team' && <option value='activity'>Activity</option>}
            </select>
          </div>
          <div className='flex-row width-100 items-center'>
            <input 
              type='text' 
              id='search-bar'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for a room...' />
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
                  onChange={(e) => setSelectedItems(e.target.checked ? results.map(r => r.room_id) : [])}
                  checked={results?.length > 0 && selectedItems.length === results.length}
                />
              </th>
              }
              {showId && <th>Room ID</th>}
              <th>Room Name</th>
              {foreign_name === 'team' && <th>Activity</th>}
              {foreign_name === 'activity' && <th>Team</th>}
            </tr>
          </thead>
          <tbody>
            {results && results.map(res => (
              <tr 
                key={res.room_id} 
                className={`${selectedRef.current?.room_id === res.room_id && 'selected'}`}>
                {admin.role === 'superadmin' &&
                <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(res.room_id)}
                    onChange={() => handleCheckboxChange(res.room_id, setSelectedItems)}
                  />
                </td>
                }
                {showId && <td onClick={() => selectRoom(res)}>{res.room_id}</td>}
                <td onClick={() => selectRoom(res)}>{res.room_name}</td>
                {foreign_name === 'team' && <td onClick={() => selectRoom(res)}>{res.activity_name}</td>}
                {foreign_name === 'activity' &&
                  <td onClick={() => selectRoom(res)}>
                    {res.owner_id !== '' ? res.room_name.slice(0, -7) : <i>None</i>}
                  </td>
                }
              </tr>
            ))}
          </tbody>
        </table>
        {results && results.length < 1 &&
          <>
            {new URLSearchParams(query).get('q') !== '' &&
              <div className='no-results'>
                <label>No results found for "{new URLSearchParams(query).get('q')}".</label>
              </div>
            }
            {new URLSearchParams(query).get('q') === '' &&
              <div className='no-results'>
                <label>This class doesn't have any rooms yet.</label>
              </div>
            }
          </>
        }
      </div>
      }
      {selectedRef.current &&
        <div id='admin-info-display' className='flex-column'>
          <label><b>Room ID:</b> {selectedRef.current.room_id}</label>
          <label><b>Room Name:</b> {selectedRef.current.room_name}</label>
          <label><b>Team:</b> {selectedRef.owner_id !== '' ? selectedRef.current.room_name.slice(0, -7) : <i>None</i>} </label>
          <label><b>Activity:</b> {selectedRef.current.activity_name || parent_activity?.activity_name}</label>
          <label><b>Created At:</b> {convertToReadable(new Date(selectedRef.current.createdAt), 'long')}</label>
          <label><b>Updated At:</b> {convertToReadable(new Date(selectedRef.current.updatedAt), 'long')}</label>
        </div>
      }
      <div id='admin-table-buttons'>
        {selectedRef.current &&
        <>
          {foreign_name === 'team' &&
            <button className='selected-btn' onClick={() => navigate(`/admin/dashboard/class/${parent_team.class_id}/activities/q=${selectedRef.current.activity_id}&f=activity_id`)}>
              View Activity
            </button>
          }
          {foreign_name === 'activity' && selectedRef.current.owner_id !== '' &&
            <button className='selected-btn' onClick={() => navigate(`/admin/dashboard/class/${parent_activity.class_id}/teams/q=${selectedRef.current.owner_id}&f=team_id`)}>
              View Team
            </button>
          }
          <button className='selected-btn' onClick={() => navigate(`/admin/room/${selectedRef.current.room_id}`)}>
            Manage Room
          </button>
        </>
        }
      </div>
      <form id='admin-form' className={`flex-column ${!showForm && 'none' }`} onSubmit={submitAssignedRoom}>
        {showForm === 'create' && <h4>Create a room for:</h4>}
          <div className='flex-column'>
            <label>Team</label>
            <select 
              value={team_id} 
              className='input-data'  
              onChange={e => setTeamId(e.target.value)} 
              required>
              <option value=''>Select Team</option>
              {team_list && Array.from(team_list).map(tm => (
                <option 
                  key={tm.team_id} 
                  value={tm.team_id} 
                  className='single-line'>
                    {tm.team_name}
                </option>
              ))}
            </select>
          </div>
          <div id='admin-form-buttons'>
          <button className='file-add-btn' type='submit'>
            {showForm === 'create' && 'Create'}
          </button>
          <button className='file-cancel-btn' type='button' onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default TabAssignedRooms