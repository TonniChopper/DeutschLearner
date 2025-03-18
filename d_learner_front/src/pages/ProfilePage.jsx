import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Profile from '../components/Profile.jsx';

const ProfilePage = () => {
  return (
      <div className="min-h-screen bg-gray-100">
          <Navbar/>
          <Profile/>
      </div>
  );
};

export default ProfilePage;