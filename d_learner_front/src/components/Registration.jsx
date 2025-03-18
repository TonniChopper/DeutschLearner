import React, {useState} from 'react';
import Api from '../api/api.jsx';
import {useNavigate} from "react-router-dom";
import Loading from "./Loading.jsx";

const Registration = () => {
    const [formData, setFormData] = useState({username: '', name: '', surname: '', email: '', password: ''});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        // Basic HTML5 validation will trigger for required fields
        try {
            const response = await Api.post('/learning/user/registration/', formData);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            navigate('/ProfilePage');
            // handle successful registration
        } catch (err) {
            console.error(err);
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full p-2 border border-gray-300 rounded"
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="w-full p-2 border border-gray-300 rounded"
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="w-full p-2 border border-gray-300 rounded"
                        type="text"
                        name="surname"
                        placeholder="Surname"
                        value={formData.surname}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="w-full p-2 border border-gray-300 rounded"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="w-full p-2 border border-gray-300 rounded"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {loading && <Loading />}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Registration;