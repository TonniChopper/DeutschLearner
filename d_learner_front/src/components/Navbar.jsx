import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    const checkToken = () => {
      setToken(localStorage.getItem('access_token'));
    };
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold hover:text-gray-200">
        DeutschLearner
      </Link>
      <div className="space-x-4">
        {token ? (
          <>
            <Link to="/lessonPage" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400">
              Lessons
            </Link>
            <Link
              to="/ProfilePage"
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400 flex items-center"
            >
              <FaUser size={20} />
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400 flex items-center"
            >
              <FaSignOutAlt size={20} />
            </button>
          </>
        ) : (
          <>
            <Link to="/registration" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400">
              Register
            </Link>
            <Link to="/login" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
