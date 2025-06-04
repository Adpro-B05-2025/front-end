'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { api } from '@/utils/api';

// Medical specialties
const SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Gastroenterology',
  'Neurology',
  'Obstetrics & Gynecology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Urology'
];

export default function RegisterCareGiver() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nik: '',
    address: '', // Home address
    workAddress: '', // Work address (separate field)
    phoneNumber: '',
    speciality: ''
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
      // Prepare data for API - match the backend RegisterCareGiverRequest structure
      const apiData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nik: formData.nik,
        address: formData.address, // Home address for BaseRegisterRequest
        phoneNumber: formData.phoneNumber,
        speciality: formData.speciality, // RegisterCareGiverRequest specific field
        workAddress: formData.workAddress // RegisterCareGiverRequest specific field
      };
      
      console.log('Submitting CareGiver registration data:', apiData);
      
      const response = await api.registerCareGiver(apiData);
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
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
          <p className="text-gray-600 mt-1">Healthcare Provider Registration</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8 flex items-center justify-center">
            <span className="bg-green-100 text-green-800 p-2 rounded-full mr-2">🩺</span>
            Register as Healthcare Provider
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Dr. John Doe"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="••••••••"
                  minLength="8"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="1234567890123456"
                  maxLength="16"
                  pattern="[0-9]{16}"
                  title="NIK must be exactly 16 digits"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="081234567890"
                  pattern="[0-9]+"
                  title="Phone number must contain only digits"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Numbers only (e.g., 081234567890)</p>
              </div>
              
              {/* Specialty Field */}
              <div className="md:col-span-2">
                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Speciality *
                </label>
                <select
                  id="speciality"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  required
                >
                  <option value="" disabled>Select your medical specialty</option>
                  {SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
              
              {/* Home Address Field */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Home Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Enter your complete home address including street, city, postal code"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Your personal residence address</p>
              </div>
              
              {/* Work Address Field */}
              <div className="md:col-span-2">
                <label htmlFor="workAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Work Address (Hospital/Clinic) *
                </label>
                <textarea
                  id="workAddress"
                  name="workAddress"
                  rows={3}
                  value={formData.workAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Enter your hospital, clinic, or practice address including name, street, city, postal code"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Where you practice medicine or provide healthcare services</p>
              </div>
            </div>
            
            {/* Professional Notice */}
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-medium">Professional Verification:</span> Your registration will be reviewed to verify your medical credentials. You will receive a confirmation email once approved. All information provided will be kept confidential and used only for professional verification and patient care.
              </p>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
                ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  'Register as Healthcare Provider'
                )}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-green-600 hover:text-green-800 font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-gray-600 mt-2">
                Are you a patient?{' '}
                <Link href="/register/pacillian" className="text-blue-600 hover:text-blue-800 font-medium">
                  Register as Patient
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}