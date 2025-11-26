import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';
import { FiBook, FiTarget, FiTrendingUp, FiAward, FiArrowRight, FiCheck } from 'react-icons/fi';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: FiBook,
      title: 'Welcome to DeutschLearner!',
      description: `Hi ${user?.name || 'there'}! 👋 We're excited to help you master German. Let's get you started on your learning journey.`,
      color: 'from-blue-500 to-indigo-600',
      image: '📚',
    },
    {
      icon: FiTarget,
      title: 'Personalized Learning',
      description:
        "Our AI adapts to your skill level and learning pace. You'll get lessons and exercises tailored just for you.",
      color: 'from-purple-500 to-pink-600',
      image: '🎯',
    },
    {
      icon: FiTrendingUp,
      title: 'Track Your Progress',
      description:
        "Watch your skills grow with detailed progress tracking. Earn XP, unlock achievements, and see how far you've come!",
      color: 'from-green-500 to-teal-600',
      image: '📈',
    },
    {
      icon: FiAward,
      title: 'Ready to Start?',
      description:
        'Complete lessons, practice daily, and achieve fluency. Your German adventure begins now!',
      color: 'from-orange-500 to-red-600',
      image: '🏆',
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigate('/ProfilePage');
    }
  };

  const handleSkip = () => {
    navigate('/ProfilePage');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Onboarding card */}
      <div className="relative w-full max-w-2xl animate-fade-in-up">
        <div className="glass-strong rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-xl">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`
                  h-2 rounded-full transition-all duration-500
                  ${
                    index === currentStep
                      ? 'w-8 bg-gradient-to-r ' + currentStepData.color
                      : index < currentStep
                        ? 'w-2 bg-green-500'
                        : 'w-2 bg-gray-300 dark:bg-gray-700'
                  }
                `}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-8 animate-fade-in" key={currentStep}>
            {/* Icon/Emoji */}
            <div className="text-8xl mb-6 animate-scale-in">{currentStepData.image}</div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
              {currentStepData.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Features list (on relevant steps) */}
          {currentStep === 1 && (
            <div className="grid gap-4 mb-8 animate-fade-in-up">
              {[
                'Adaptive difficulty levels (A1-C2)',
                'Interactive exercises and quizzes',
                'Real-world conversation practice',
                'Grammar and vocabulary building',
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 glass rounded-xl animate-slide-in-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <FiCheck className="text-white" size={16} />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid gap-4 mb-8 animate-fade-in-up">
              {[
                'Daily XP goals and streaks',
                'Skill mastery indicators',
                'Achievements and badges',
                'Leaderboards and challenges',
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 glass rounded-xl animate-slide-in-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                    <FiCheck className="text-white" size={16} />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4">
            {currentStep < steps.length - 1 ? (
              <>
                <AnimatedButton onClick={handleSkip} variant="ghost" fullWidth>
                  Skip
                </AnimatedButton>
                <AnimatedButton
                  onClick={handleNext}
                  variant="primary"
                  fullWidth
                  icon={FiArrowRight}
                >
                  Next
                </AnimatedButton>
              </>
            ) : (
              <AnimatedButton onClick={handleNext} variant="primary" fullWidth icon={FiArrowRight}>
                Get Started
              </AnimatedButton>
            )}
          </div>

          {/* Step counter */}
          <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
