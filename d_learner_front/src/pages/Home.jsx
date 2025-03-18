import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20 text-center">
          <h1 className="text-5xl font-bold">Welcome to DeutschLearner</h1>
          <p className="mt-4 text-lg">
            Your AI-powered platform for mastering the German language.
          </p>
          <button
            onClick={handleGetStarted}
            className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-gray-200"
          >
            Get Started
          </button>
        </section>

        {/* Features Section */}
        <section className="py-16 px-8 text-center">
          <h2 className="text-3xl font-bold">Why Choose DeutschLearner?</h2>
          <p className="mt-4 text-lg">
            We provide AI-generated lessons, real-time progress tracking, and interactive exercises tailored to your learning pace.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">AI-Powered Lessons</h3>
              <p className="mt-2">Every lesson is dynamically created based on your progress and needs.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Personalized Feedback</h3>
              <p className="mt-2">Our AI detects your mistakes and suggests improvements.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Adaptive Learning</h3>
              <p className="mt-2">The platform adjusts difficulty based on your learning speed.</p>
            </div>
          </div>
        </section>

        {/* Image Sections */}
        <section className="py-16 px-8">
          <h2 className="text-3xl font-bold text-center">Explore Our Platform</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-300 h-64 flex items-center justify-center text-xl font-bold">
              Image Placeholder 1
            </div>
            <div className="bg-gray-300 h-64 flex items-center justify-center text-xl font-bold">
              Image Placeholder 2
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-blue-600 text-white py-16 text-center">
          <h2 className="text-3xl font-bold">Start Your Journey Today!</h2>
          <p className="mt-4 text-lg">
            Join thousands of learners and take your German skills to the next level.
          </p>
          <button onClick={handleGetStarted} className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-gray-200">
            Sign Up Now
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;