import React, {useEffect, useState} from 'react';
import axios from 'axios';

const Task = () => {
    const [task, setTask] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('https://your-backend-api-url.com/api/task')
            .then((response) => setTask(response.data))
            .catch((err) => {
                console.error(err);
                setError('Failed to load task.');
            });
    }, []);
    return (
        <div className="bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Task</h2>
            {error && <p className="error">{error}</p>}
            {task ? (
                <div>
                    <p>{task.description}</p>
                    {/* Render task-specific content */}
                </div>
            ) : (
                <p className="mb-2">This is where your tasks will be displayed.</p>
            )}
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Add Task
            </button>
        </div>
    );
};

export default Task;