import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import LessonList from '../components/LessonList.jsx';

const LessonPage = () => {
    const [showLessonList, setShowLessonList] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-6 flex flex-col items-center">
                {!showLessonList ? (
                    <div className="text-center">
                        <h2 className="text-2xl mb-4">No lessons, create lesson</h2>
                        <button
                            onClick={() => setShowLessonList(true)}
                            className="bg-blue-500 hover:bg-blue-400 p-2 rounded-full text-white text-xl w-10 h-10 flex items-center justify-center"
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <LessonList />
                )}
            </div>
        </div>
    );
};

export default LessonPage;