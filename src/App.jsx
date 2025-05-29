import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './App.css';
import Home from './components/Home';
import Signup from './components/Signup';
import EmailVerification from './components/EmailVerification';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ProfLogin from './components/ProfLogin';
import Dashboard from './components/Dashboard';
import PageTeam from './components/dashboard/teampage/PageTeam';
import PageActivity from './components/dashboard/activitypage/PageActivity';
import AssignedRoom from './components/room/AssignedRoom';
import SoloRoom from './components/room/SoloRoom';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminRoom from './admin/AdminRoom'
import NotFound from './components/NotFound';

function App() {

  return (
    <>
    <Toaster position='top-center'></Toaster>
    <Routes>
      <Route path = '/signup' element={ <Signup/> }/>
      <Route path = '/verify/:token' element={ <EmailVerification/> }/>
      <Route path = '/' element={ <Home/> }/>
      <Route path = '/login' element={ <Login/> }/>
      <Route path = '/forgot-password' element={ <ForgotPassword/> }/>
      <Route path = '/reset-password/:reset_link' element={ <ResetPassword/> }/>
      <Route path = '/login/professor' element={ <ProfLogin/> }/>
      <Route path = '/dashboard/' element={ <Dashboard/> }/>
      <Route path = '/dashboard/:class_id' element={ <Dashboard/> }/>
      <Route path = '/dashboard/:class_id/:select' element={ <Dashboard/> }/>
      <Route path = '/team/:team_id' element={ <PageTeam/> }/>
      <Route path = '/activity/:activity_id' element={ <PageActivity/> }/>
      <Route path = '/room/:room_id/' element={ <AssignedRoom/> }/>
      <Route path = '/solo/:room_id/' element={ <SoloRoom/> }/>
      <Route path = '/error/404' element={ <NotFound/> }/>
      <Route path =  '/admin/login' element={ <AdminLogin/> }/>
      <Route path = '/admin/dashboard/:collection' element={ <AdminDashboard/> }/>
      <Route path = '/admin/dashboard/:collection/:query' element={ <AdminDashboard/> }/>
      <Route path = '/admin/dashboard/:foreign_name/:foreign_key/:collection/:query' element={ <AdminDashboard/> }/>
      <Route path = '/admin/room/:room_id' element={ <AdminRoom/> }/>
      <Route path = '*' element={ <NotFound/> }/>
    </Routes>
    </>
  )
}

export default App