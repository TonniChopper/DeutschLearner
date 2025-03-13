import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const { authData, logout } = useContext(AuthContext);
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
      {authData ? (
        <div>
          <p className="text-lg">Welcome, {authData.username}!</p>
          {/* Display profile and progress information */}
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please login to see your dashboard.</p>
      )}
    </div>
  );
};

export default Dashboard;