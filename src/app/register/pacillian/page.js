'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { api } from '@/utils/api';

export default function RegisterPacillian() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nik: '',
    address: '',
    phoneNumber: '',
    medicalHistory: ''
  });

  // Check if already logged in
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    
    if (formData.nik.length !== 16) {
      toast.error('NIK must be 16 digits!');
      return;
    }
    
    if (!/^\d+$/.test(formData.phoneNumber)) {
      toast.error('Phone number must contain only digits!');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare data for API
      const apiData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nik: formData.nik,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        medicalHistory: formData.medicalHistory
      };
      
      const response = await api.registerPacillian(apiData);
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Registration successful!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <Image 
                src="/logo.png" 
                alt="PandaCare Logo"
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">PandaCare</h1>
          <p className="text-gray-600 mt-1">Patient Registration</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8 flex items-center justify-center">
            <span className="bg-blue-100 text-blue-800 p-2 rounded-full mr-2">🐼</span>
            Register as Pacillian
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="••••••••"
                  minLength="8"
                  required
                />
              </div>
              
              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="••••••••"
                  minLength="8"
                  required
                />
              </div>
              
              {/* NIK Field */}
              <div>
                <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-1">
                  NIK (National ID) *
                </label>
                <input
                  id="nik"
                  name="nik"
                  type="text"
                  value={formData.nik}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="1234567890123456"
                  maxLength="16"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">16 digits national ID number</p>
              </div>
              
              {/* Phone Number Field */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="081234567890"
                  required
                />
              </div>
              
              {/* Address Field */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Your complete address"
                  required
                />
              </div>
              
              {/* Medical History Field */}
              <div className="md:col-span-2">
                <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History
                </label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Please enter any relevant medical history (allergies, chronic conditions, etc.)"
                ></textarea>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium 
                ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}