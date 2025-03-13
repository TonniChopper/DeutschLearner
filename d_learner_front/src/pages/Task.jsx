import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Task from '../components/Task.jsx';

const TaskPage = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar/>
            <div className="container mx-auto p-6">
                <Task/>
            </div>
        </div>
    );
};

export default TaskPage;