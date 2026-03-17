import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage/LandingPage';
import Auth from './components/pages/Auth/Auth';
import MainPage from './components/pages/MainPage/MainPage';
import Account from './components/pages/Account/Account';
import DetailView from './components/pages/DetailView/DetailView';
import AdminWrite from './components/admin/AddArticle/AddArticle';
import AdminEdit from './components/admin/EditArticle/EditArticle';
import ViewUsers from './components/admin/ViewUsers/ViewUsers';
import DetailUser from './components/admin/DetailUser/DetailUserAdmin';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/article/:id" element={<DetailView />} />
        <Route path="/admin/write" element={<AdminWrite />} />
        <Route path="/admin/edit/:id" element={<AdminEdit />} />
        <Route path="/admin/users" element={<ViewUsers />} />
        <Route path="/user/:id" element={<DetailUser />} />
        <Route path="/admin/user/:id" element={<DetailUser isAdmin={true} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;