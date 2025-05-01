'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { api } from '@/utils/api';

// Days of the week for schedule selection
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// Common working hours
const WORKING_HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

// Map day names to DayOfWeek values expected by the backend
const DAY_OF_WEEK_MAP = {
  'Monday': 'MONDAY',
  'Tuesday': 'TUESDAY',
  'Wednesday': 'WEDNESDAY',
  'Thursday': 'THURSDAY',
  'Friday': 'FRIDAY',
  'Saturday': 'SATURDAY',
  'Sunday': 'SUNDAY'
};

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
    workAddress: '',
    phoneNumber: '',
    speciality: '',
    workingSchedules: []
  });

  const [scheduleForm, setScheduleForm] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00'
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

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const addWorkingSchedule = () => {
    // Validate schedule
    if (scheduleForm.startTime >= scheduleForm.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    // Create schedule object with the information needed
    const scheduleObject = {
      day: scheduleForm.day,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime
    };
    
    // Check for duplicate
    const isDuplicate = formData.workingSchedules.some(
      schedule => 
        schedule.day === scheduleObject.day && 
        schedule.startTime === scheduleObject.startTime && 
        schedule.endTime === scheduleObject.endTime
    );
    
    if (isDuplicate) {
      toast.error('This schedule already exists');
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      workingSchedules: [...prevState.workingSchedules, scheduleObject]
    }));

    // Reset form to default values
    setScheduleForm({
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00'
    });

    toast.success('Schedule added');
  };

  const removeSchedule = (index) => {
    setFormData(prevState => ({
      ...prevState,
      workingSchedules: prevState.workingSchedules.filter((_, i) => i !== index)
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

    if (formData.workingSchedules.length === 0) {
      toast.error('Please add at least one working schedule!');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format the working schedules for the API
      const formattedSchedules = formData.workingSchedules.map(schedule => ({
        dayOfWeek: DAY_OF_WEEK_MAP[schedule.day],
        startTime: schedule.startTime,
        endTime: schedule.endTime
      }));
      
      // Prepare data for API
      const apiData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nik: formData.nik,
        address: formData.workAddress, // Note: API expects 'address' not 'workAddress'
        phoneNumber: formData.phoneNumber,
        speciality: formData.speciality,
        workAddress: formData.workAddress,
        workingSchedules: formattedSchedules
      };
      
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
            Register as CareGiver
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
                  required
                />
              </div>
              
              {/* Work Address Field */}
              <div className="md:col-span-2">
                <label htmlFor="workAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Work Address *
                </label>
                <input
                  id="workAddress"
                  name="workAddress"
                  type="text"
                  value={formData.workAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Hospital/Clinic address"
                  required
                />
              </div>
              
              {/* Specialty Field */}
              <div className="md:col-span-2">
                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-1">
                  Speciality *
                </label>
                <select
                  id="speciality"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  required
                >
                  <option value="" disabled>Select your specialty</option>
                  {SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
              
              {/* Working Schedules Section */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h3 className="font-medium text-gray-900 mb-3">Working Schedule *</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add your available working hours. You must add at least one schedule.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Day Selection */}
                    <div>
                      <label htmlFor="scheduleDay" className="block text-sm font-medium text-gray-700 mb-1">
                        Day
                      </label>
                      <select
                        id="scheduleDay"
                        name="day"
                        value={scheduleForm.day}
                        onChange={handleScheduleChange}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Start Time */}
                    <div>
                      <label htmlFor="scheduleStart" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <select
                        id="scheduleStart"
                        name="startTime"
                        value={scheduleForm.startTime}
                        onChange={handleScheduleChange}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      >
                        {WORKING_HOURS.map((time) => (
                          <option key={`start-${time}`} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* End Time */}
                    <div>
                      <label htmlFor="scheduleEnd" className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <select
                        id="scheduleEnd"
                        name="endTime"
                        value={scheduleForm.endTime}
                        onChange={handleScheduleChange}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      >
                        {WORKING_HOURS.map((time) => (
                          <option key={`end-${time}`} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addWorkingSchedule}
                    className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Add Schedule
                  </button>
                </div>
                
                {/* Schedules List */}
                {formData.workingSchedules.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Schedules:</h4>
                    <ul className="space-y-2">
                      {formData.workingSchedules.map((schedule, index) => (
                        <li 
                          key={index} 
                          className="flex justify-between items-center bg-green-50 p-3 rounded-lg"
                        >
                          <span className="text-sm text-gray-700">
                            {schedule.day}, {schedule.startTime}-{schedule.endTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSchedule(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium 
                ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-green-600 hover:text-green-800 font-medium">
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