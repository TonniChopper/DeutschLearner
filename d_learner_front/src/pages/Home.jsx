import React from 'react';
import Navbar from '../components/Navbar.jsx';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center my-8">
          Welcome to DeutschLearner
        </h1>
        <p className="text-center text-lg">
          Learn German interactively and effectively.
        </p>
      </main>
    </div>
  );
};

export default Home;