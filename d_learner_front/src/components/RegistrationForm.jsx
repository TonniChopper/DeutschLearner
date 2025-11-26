import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormValidation, validators } from '../utils/validation';
import FloatingInput from '../components/FloatingInput';
import AnimatedButton from '../components/AnimatedButton';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState(1); // Multi-step form

  // Form validation
  const { values, errors, touched, handleChange, handleBlur, validateAll, setErrors } =
    useFormValidation(
      {
        username: '',
        email: '',
        name: '',
        surname: '',
        password: '',
        confirmPassword: '',
      },
      {
        username: [validators.username],
        email: [validators.email, validators.required],
        name: [validators.name],
        surname: [validators.name],
        password: [validators.password],
        confirmPassword: [validators.confirmPassword],
      }
    );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding');
    }
  }, [isAuthenticated, navigate]);

  const handleNext = () => {
    // Validate current step fields
    const step1Fields = ['username', 'email'];
    const step2Fields = ['name', 'surname'];

    const fieldsToValidate = step === 1 ? step1Fields : step2Fields;
    let hasErrors = false;

    fieldsToValidate.forEach(field => {
      const error = validators[field]?.(values[field], values);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username: values.username,
        email: values.email,
        name: values.name,
        surname: values.surname,
        password: values.password,
      });

      if (result.success) {
        // Redirect to onboarding
        setTimeout(() => {
          navigate('/onboarding');
        }, 500);
      } else {
        setServerError(result.error);
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-sunset opacity-30 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-orange-50/50 to-yellow-50/50 dark:from-pink-950/50 dark:via-orange-950/50 dark:to-yellow-950/50" />

      {/* Floating shapes */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Registration card */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="glass-strong rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-br from-pink-500 to-orange-600 rounded-2xl mb-4 animate-scale-in">
              <FiUserPlus className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400">Start your learning journey today</p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center">
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 font-semibold
                  ${
                    i === step
                      ? 'bg-gradient-to-br from-pink-500 to-orange-600 text-white scale-110'
                      : i < step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }
                `}
                >
                  {i < step ? '✓' : i}
                </div>
                {i < 3 && (
                  <div
                    className={`
                    w-12 h-1 mx-1 rounded transition-all duration-300
                    ${i < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Server error message */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-fade-in">
              <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {serverError}
              </p>
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Account info */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <FloatingInput
                  label="Username"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.username}
                  touched={touched.username}
                  icon={FiUser}
                  required
                  autoComplete="username"
                />

                <FloatingInput
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  touched={touched.email}
                  icon={FiMail}
                  required
                  autoComplete="email"
                />

                <AnimatedButton type="button" onClick={handleNext} fullWidth variant="primary">
                  Continue
                </AnimatedButton>
              </div>
            )}

            {/* Step 2: Personal info */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <FloatingInput
                  label="First Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.name}
                  touched={touched.name}
                  icon={FiUser}
                  required
                  autoComplete="given-name"
                />

                <FloatingInput
                  label="Last Name"
                  name="surname"
                  value={values.surname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.surname}
                  touched={touched.surname}
                  icon={FiUser}
                  required
                  autoComplete="family-name"
                />

                <div className="flex gap-3">
                  <AnimatedButton type="button" onClick={handleBack} variant="outline" fullWidth>
                    Back
                  </AnimatedButton>
                  <AnimatedButton type="button" onClick={handleNext} variant="primary" fullWidth>
                    Continue
                  </AnimatedButton>
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <FloatingInput
                  label="Password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  touched={touched.password}
                  icon={FiLock}
                  required
                  autoComplete="new-password"
                />

                <FloatingInput
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  icon={FiLock}
                  required
                  autoComplete="new-password"
                />

                <div className="flex gap-3">
                  <AnimatedButton type="button" onClick={handleBack} variant="outline" fullWidth>
                    Back
                  </AnimatedButton>
                  <AnimatedButton type="submit" loading={loading} variant="primary" fullWidth>
                    Create Account
                  </AnimatedButton>
                </div>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login link */}
          <Link to="/login">
            <AnimatedButton fullWidth variant="outline">
              Sign In
            </AnimatedButton>
          </Link>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
