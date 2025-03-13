import React from 'react';
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  import Home from './pages/Home.jsx';
  import Registration from './pages/Registration.jsx';
  import Login from './pages/Login.jsx';
  import Dashboard from './pages/Dashboard.jsx';
  import Task from './pages/Task.jsx';

  const App = () => {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/task" element={<Task />} />
        </Routes>
      </Router>
    );
  };

  export default App;