import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Registration from '../components/Registration.jsx';

const RegistrationPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <Registration />
      </div>
    </div>
  );
};

export default RegistrationPage;
