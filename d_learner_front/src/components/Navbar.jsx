import React from 'react';
import {Link} from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold hover:text-gray-200">
                DeutschLearner
            </Link>
            <div className="space-x-4">
                <Link
                    to="/registration"
                    className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400"
                >
                    Register
                </Link>
                <Link
                    to="/login"
                    className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400"
                >
                    Login
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;