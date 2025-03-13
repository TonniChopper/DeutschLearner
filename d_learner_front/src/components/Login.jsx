import React, { useState, useContext } from 'react';
        import { loginUser } from '../api/api.jsx';
        import { AuthContext } from '../context/AuthContext.jsx';
        import { useNavigate } from 'react-router-dom';

        const Login = () => {
          const [credentials, setCredentials] = useState({ email: '', password: '' });
          const [error, setError] = useState(null);
          const { login } = useContext(AuthContext);
          const navigate = useNavigate();

          const handleChange = (e) => {
            setCredentials({ ...credentials, [e.target.name]: e.target.value });
          };

          const handleSubmit = async (e) => {
            e.preventDefault();
            try {
              const userData = await loginUser(credentials);
              login(userData);
              navigate('/dashboard');
            } catch (err) {
              console.error(err);
              setError('Login failed. Please check your credentials.');
            }
          };

          return (
            <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
              <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  className="w-full p-2 border border-gray-300 rounded"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                />
                <input
                  className="w-full p-2 border border-gray-300 rounded"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Login
                </button>
              </form>
            </div>
          );
        };

        export default Login;