'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthProvider';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailResetFlow, setIsEmailResetFlow] = useState(false);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Check for pending email from email change flow
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingEmail = sessionStorage.getItem('pendingEmail');
      if (pendingEmail) {
        // Pre-fill the email field
        setEmail(pendingEmail);
        // Flag that we're in email reset flow
        setIsEmailResetFlow(true);
        // Clear the stored email
        sessionStorage.removeItem('pendingEmail');
        // Show notification
        toast.info('Please log in with your new email address');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(''); // Clear any previous errors

    // Basic client-side validation
    if (!email.trim()) {
      setLoginError('Email address is required');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setLoginError('Password is required');
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLoginError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email.trim(), password);
      
      if (success) {
        // Clear any errors
        setLoginError('');
        
        // If this was from an email change, show a different message
        if (isEmailResetFlow) {
          toast.success('Successfully logged in with your new email!');
        }
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        // The login function should have already shown a toast error
        // But we'll also set a local error for the form
        setLoginError('Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Set specific error messages based on the error
      if (error.message?.includes('401')) {
        setLoginError('Invalid email or password. Please check your credentials.');
      } else if (error.message?.includes('403')) {
        setLoginError('Account access denied. Please contact support if this continues.');
      } else if (error.message?.includes('429')) {
        setLoginError('Too many login attempts. Please wait a few minutes before trying again.');
      } else if (error.message?.includes('500')) {
        setLoginError('Server error. Please try again later or contact support.');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setLoginError('Network error. Please check your internet connection and try again.');
      } else {
        setLoginError('An unexpected error occurred. Please try again.');
      }
      
      toast.error(loginError || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (loginError) {
      setLoginError('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (loginError) {
      setLoginError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <Image 
                src="/logo.png" 
                alt="PandaCare Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">PandaCare</h1>
          <p className="text-gray-600 mt-1">E-Health Consultation</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Sign In</h2>
          
          {isEmailResetFlow && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              <p className="font-medium">Email Address Updated</p>
              <p>Your email address has been changed. Please sign in with your new email and existing password.</p>
            </div>
          )}

          {/* General Error Message */}
          {loginError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">Login Failed</p>
              </div>
              <p className="mt-1">{loginError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  loginError && !email.trim() 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                } outline-none transition-colors`}
                placeholder="your@email.com"
                required
                autoComplete="email"
                disabled={isLoading}
              />
              {loginError && !email.trim() && (
                <p className="mt-1 text-sm text-red-600">Email address is required</p>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  loginError && !password.trim() 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                } outline-none transition-colors`}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              {loginError && !password.trim() && (
                <p className="mt-1 text-sm text-red-600">Password is required</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors
              ${isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account yet?
            </p>
            <div className="mt-3 flex gap-3 justify-center">
              <Link 
                href="/register/pacillian" 
                className="inline-block text-sm px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Register as Patient
              </Link>
              <Link 
                href="/register/caregiver" 
                className="inline-block text-sm px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
              >
                Register as Doctor
              </Link>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Having trouble logging in? Make sure you're using the correct email address and password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}