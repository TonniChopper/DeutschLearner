import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Api from '../api/api';

const LessonDetail = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const response = await Api.get(`learning/lesson/detail/${id}/`);
        setLesson(response.data);
      } catch (err) {
        setError('Failed to load lesson.');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  const handleGenerateAssignment = async () => {
    try {
      const response = await Api.get('learning/assignment/', { params: { lesson_id: id } });
      setAssignment(response.data);
    } catch (err) {
      setError('Failed to generate assignment.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {loading && <p>Loading lesson...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {lesson && (
        <div>
          <h2 className="text-2xl mb-4">{lesson.title}</h2>
          <p className="mb-4">{lesson.content}</p>
          <button
            onClick={handleGenerateAssignment}
            className="bg-green-500 text-white py-2 px-4 rounded"
          >
            Generate Assignment
          </button>
          {assignment && (
            <div className="mt-4 p-4 border rounded shadow">
              <h3 className="text-xl mb-2">{assignment.title || 'New Assignment'}</h3>
              <p>{assignment.description || 'Assignment details here...'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonDetail;