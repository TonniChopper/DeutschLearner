import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Login from '../components/Login.jsx';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;
