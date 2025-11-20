import React, { useState, useEffect } from 'react';
import Api from '../api/api';
import { Link } from 'react-router-dom';
import Loading from './Loading.jsx';

const LessonList = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const response = await Api.get('learning/lesson/');
        setLessons(response.data);
      } catch {
        setError('Failed to load lessons.');
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl mb-4">Lessons</h2>
      {loading && <Loading />}
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {lessons.map(lesson => (
          <li key={lesson.id} className="mb-2">
            <Link to={`/lesson/${lesson.id}`} className="text-blue-500 hover:underline">
              {lesson.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LessonList;
