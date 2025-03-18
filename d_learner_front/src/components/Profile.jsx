import React, {useState, useEffect} from 'react';
import Api from '../api/api'; // Adjust the API base path as needed
import { useNavigate } from 'react-router-dom';


const Profile = () => {
    const navigate = useNavigate();
    // State to hold profile data and form errors
    const [profile, setProfile] = useState({
        name: '',
        surname: '',
        email: '',
        age: '',
        progress: '',
        language_level: '',
        errors: ''
    });
    // State for new password field (optional)
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [formError, setFormError] = useState('');

    // Check if the user is logged in by verifying access_token exists
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    // Fetch profile data from the API on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await Api.get('learning/profile/');
                setProfile(response.data);
            } catch {
                setFormError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Validate form fields
    const isValid = () => {
        if (!profile.name || !profile.surname || !profile.email || !profile.age) {
            setFormError('Please fill in all required fields.');
            return false;
        }
        // You can add more validation such as email format or age being a number
        return true;
    };

    // Handle form updates
    const handleChange = (e) => {
        setProfile({...profile, [e.target.name]: e.target.value});
    };

    // Handle form submission for profile update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!isValid()) return;

        // Prepare data for the PUT request. Include set_password if password field is provided.
        const updatedData = {
            name: profile.name,
            surname: profile.surname,
            email: profile.email,
            age: profile.age,
        };
        if (password) {
            updatedData.set_password = password;
        }

        try {
            const response = await Api.put('learning/profile/', updatedData);
            // Update profile state with the response data
            setProfile(response.data);
            alert('Profile updated successfully.');
        } catch {
            setFormError('Failed to update profile.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-6">
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            {formError && <p className="text-red-500 mb-4">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Editable fields */}
                <div>
                    <label className="block mb-1">Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Surname:</label>
                    <input
                        type="text"
                        name="surname"
                        value={profile.surname}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Age:</label>
                    <input
                        type="number"
                        name="age"
                        value={profile.age}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                {/* Optional password field */}
                <div>
                    <label className="block mb-1">New Password (optional):</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                {/* Read-only fields */}
                <div>
                    <label className="block mb-1">Progress:</label>
                    <input
                        type="text"
                        value={profile.progress}
                        readOnly
                        className="w-full p-2 border rounded bg-gray-100"
                    />
                </div>
                <div>
                    <label className="block mb-1">Language Level:</label>
                    <input
                        type="text"
                        value={profile.language_level}
                        readOnly
                        className="w-full p-2 border rounded bg-gray-100"
                    />
                </div>
                <div>
                    <label className="block mb-1">Errors:</label>
                    <input
                        type="text"
                        value={profile.errors}
                        readOnly
                        className="w-full p-2 border rounded bg-gray-100"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Update Profile
                </button>
            </form>
        </div>
    );
};

export default Profile;