import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { FaChevronRight } from 'react-icons/fa';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import ShowId from './ShowId';
import animateDrop from '../utils/animateDrop';
import convertToReadable from '../../components/room/utils/convertToReadable';
import { handleCheckboxChange, handleBulkDelete } from '../utils/handleDelete';
import { toggleOne, untoggleAll } from '../utils/toggleButtons';

function TabSoloRooms({ admin, showId, setShowId }) {
  const [solo_rooms, setSoloRooms] = useState(null);
  const [parent_user, setParentUser] = useState(null);

  const [results, setResults] = useState(null);
  const selectedRef = useRef(null);
  
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { foreign_name, foreign_key, query } = useParams();

  const [showForm, setShowForm] = useState(null);
  
  const [room_name, setRoomName] = useState('');

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    const init = async () => await getAllSoloRooms();
    init();
  }, []);
  
  async function getAllSoloRooms() {
    setLoading(true);
    
    if (foreign_name && foreign_key) {
      if (foreign_name === 'student' || foreign_name === 'professor') {
        const data = await admin.getAllSoloRooms(foreign_name, foreign_key);
        setSoloRooms(data.rooms);
        doSearch(data.rooms);
        setParentUser(data.owner);
        return;
      }
    }
    navigate(`/admin/dashboard/students/q=&f=`);
  }

  function doSearch (list = []) {
    const q = new URLSearchParams(query).get('q') || '';
    const f = new URLSearchParams(query).get('f') || '';
    
    if (!(f === 'room_id' || f === 'room_name' || f === '') === true || !list) {
      navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/solo-rooms/q=&f=`);
      return;
    }

    const filtered = list.filter((slr) => {

      if (f === 'room_id') {
        return slr.room_id.toLowerCase().includes(q.toLowerCase());
        
      } else if (f === 'room_name') {
        return slr.room_name.toLowerCase().includes(q.toLowerCase());

      } else {
        const room_combined = `${slr.room_id} ${slr.room_name}`.toLowerCase().includes(q.toLowerCase());
        return (room_combined);
      }
    })
 
    setSearch(q);
    setFilter(`${f ? f : ''}`);
    setResults(filtered);
    setLoading(false);
  } 

  useEffect(() => {
    if (solo_rooms) {
      doSearch(solo_rooms);
    }
  }, [solo_rooms, query]);

  function searchSoloRooms(e) {
    e.preventDefault();
    setShowForm(null);
    selectedRef.current = null;

    if (search === '' && filter === 'room_id') {
      navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/solo-rooms/q=&f=`);
      return;
    } 
    navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/solo-rooms/q=${search}&f=${filter}`);
  }
  
  function selectRoom(room) {
    if (selectedRef.current?.room_id === room.room_id) {
      selectedRef.current = null;
      navigate(-1);
      return;
    }

    selectedRef.current = room;
    navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/solo-rooms/q=${room.room_id}&f=room_id`);
  }

  async function showCreateForm() {
    setLoading(true);
    const res = await admin.createSoloRoom(foreign_name, foreign_key);
      if (res) {
        toast.success('New room created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/solo-rooms/q=${res}&f=room_id`);
      } else {
        setLoading(false);
      }      
  }

  async function showEditForm() {
    if (showForm === 'edit' || !selectedRef.current?.room_name) {
      untoggleAll()
      setShowForm(null);
      
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      return;
    }
    
    toggleOne('edit');
    setShowForm('edit');
    setRoomName(selectedRef.current.room_name);
    animateDrop();
  }

  async function reloadData() {
    await getAllSoloRooms();
    setShowForm(null);
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null; 
    navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/solo-rooms/q=&f=`);
  }

  async function submitSoloRoom(e) {
    e.preventDefault();
    setLoading(true);

    if (showForm === 'edit') {
      const res = await admin.updateSoloRoomName(selectedRef.current.room_id, room_name);
      if (res) {
        toast.success('Solo room updated successfully!');
        await reloadData();
        selectedRef.current = null;
      } else {
        setLoading(false);
      }
    }
  }

  async function deleteSoloRoom() {
    const success = await handleBulkDelete(admin.deleteSoloRoom, selectedItems, 'rooms', setLoading);

    if (success) {
      toast.success(`Successfully deleted ${selectedItems.length} rooms`);
      setSelectedItems([]);
      await reloadData();
      navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/solo-rooms/q=&f=`);
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
        {parent_user &&
        <>
          {foreign_name.charAt(0).toUpperCase()}{foreign_name.slice(1)}:
          <b><Link to={`/admin/dashboard/${foreign_name}s/q=${parent_user.uid} ${parent_user.last_name}, ${parent_user.first_name}&f=`}>{parent_user.last_name}, {parent_user.first_name}</Link></b>
          <label className='items-center'><FaChevronRight size={17}/></label>
          Solo Rooms
          </>
        }
      </div>
      <div className='manage-header flex-row items-center'>
        <div className='flex-row items-center'>
          <h4 className='normal'>Solo Rooms</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
          <ShowId showId={showId} setShowId={setShowId}/>
        </div>
        <div className='flex-row items-center'>
          {selectedItems.length > 0 && admin.role === 'superadmin' && (
            <button className='admin-delete' onClick={deleteSoloRoom}>
              Delete ({selectedItems.length})
            </button>
          )}
          <button className='admin-create items-center' onClick={showCreateForm}>
            Create Solo Room<FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchSoloRooms(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='room_id'>Room ID</option>
              <option value='room_name'>Room Name</option>
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
            </tr>
          </thead>
          <tbody>
            {results && results.map((res, index) => (
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
                <label>This user doesn't have any solo room yet.</label>
              </div>
            }
          </>
        }
      </div>
      {selectedRef.current &&
        <div id='admin-info-display' className='flex-column'>
          <label><b>Room ID:</b> {selectedRef.current.room_id}</label>
          <label><b>Room Name:</b> {selectedRef.current.room_name}</label>
          <label><b>Owner:</b> {parent_user?.last_name}, {parent_user?.first_name}</label>
          <label><b>Created At:</b> {convertToReadable(new Date(selectedRef.current.createdAt), 'long')}</label>
          <label><b>Updated At:</b> {convertToReadable(new Date(selectedRef.current.updatedAt), 'long')}</label>
        </div>
      }
      <div id='admin-table-buttons'>
        {selectedRef.current &&
          <>
            <button className='selected-btn' onClick={() => navigate(`/admin/dashboard/${foreign_name}s/q=${parent_user.uid} ${parent_user.last_name}, ${parent_user.first_name}&f=`)}>
              View {foreign_name.charAt(0).toUpperCase()}{foreign_name.slice(1)}
            </button>
          <button className='selected-btn' onClick={() => navigate(`/solo/${selectedRef.current.room_id}`)}>
            Manage Room
          </button>
          <button className='selected-btn select-edit' onClick={showEditForm}>
            Edit Room Name
          </button>
        </>
        }
      </div>
      <form id='admin-form' className={`flex-column ${!showForm && 'none' }`} onSubmit={submitSoloRoom}>
        {showForm === 'edit' && <h4>Edit solo room:</h4>}
          <div className='flex-column'>
            <label>Room Name</label>
            <input
              type='text'
              id='room_name'
              className='input-data' 
              value={room_name}
              onChange={e => setRoomName(e.target.value)}
              required />
          </div>
          <div id='admin-form-buttons'>
          <button className='file-add-btn' type='submit'>
            {showForm === 'edit' && 'Edit'}
          </button>
          <button className='file-cancel-btn' type='button' onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default TabSoloRooms