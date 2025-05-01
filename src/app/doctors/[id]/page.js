'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { api } from '@/utils/api';

export default function DoctorDetail({ params }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    // Check if user is authenticated
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access this page');
        router.push('/login');
        return;
      }

      fetchDoctorDetails();
    } catch (error) {
      console.error('Error checking authentication:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchDoctorDetails = async () => {
    if (!params?.id) {
      toast.error('Doctor ID is missing');
      router.push('/doctors');
      return;
    }

    setLoading(true);
    try {
      const response = await api.getUserProfile(params.id);
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctor details');
      }
      
      const data = await response.json();
      
      // Ensure we're looking at a caregiver, not a pacillian
      if (data.userType !== 'CAREGIVER') {
        toast.error('The requested profile is not a doctor');
        router.push('/doctors');
        return;
      }
      
      setDoctor(data);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error('Failed to load doctor details. Please try again.');
      router.push('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (rating) => {
    if (!rating) return 'No ratings yet';
    
    // Convert rating to stars
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`h-5 w-5 ${
              i < fullStars 
                ? 'text-yellow-400' 
                : (i === fullStars && hasHalfStar) 
                  ? 'text-yellow-300' 
                  : 'text-gray-300'
            }`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Group working schedules by day
  const groupSchedulesByDay = (schedules) => {
    if (!schedules || schedules.length === 0) return {};
    
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const grouped = {};
    
    days.forEach(day => {
      const daySchedules = schedules.filter(s => s.dayOfWeek === day);
      if (daySchedules.length > 0) {
        grouped[day] = daySchedules;
      }
    });
    
    return grouped;
  };

  // Format time string from backend (which might be in various formats)
  const formatTimeString = (timeString) => {
    if (!timeString) return '';
    
    // Check if it's already in HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    try {
      // Try to parse various time formats
      let hours, minutes;
      
      // If the timeString contains [HH, MM, SS]
      if (timeString.includes('[')) {
        const timeParts = timeString.replace(/[\[\]]/g, '').split(',');
        hours = parseInt(timeParts[0].trim());
        minutes = parseInt(timeParts[1].trim());
      } 
      // If it's an ISO string or similar
      else {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          hours = date.getHours();
          minutes = date.getMinutes();
        } else {
          // Try to extract hours and minutes directly if possible
          const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            hours = parseInt(timeMatch[1]);
            minutes = parseInt(timeMatch[2]);
          } else {
            return timeString; // Return as is if we can't parse
          }
        }
      }
      
      // Format hours and minutes with leading zeros
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString; // Return original if parsing fails
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
        <span className="ml-2">Loading doctor profile...</span>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Doctor not found</h2>
        <p className="mt-2 text-gray-600">The doctor profile you're looking for doesn't exist or has been removed.</p>
        <Link href="/doctors" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to doctors list
        </Link>
      </div>
    );
  }

  const groupedSchedules = groupSchedulesByDay(doctor.workingSchedules);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to doctors list */}
        <div className="mb-6">
          <Link href="/doctors" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to doctors list
          </Link>
        </div>

        {/* Doctor Profile Header */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 h-24 w-24 rounded-full bg-white flex items-center justify-center text-green-800 text-3xl font-bold">
                {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
              </div>
              <div className="mt-4 md:mt-0 md:ml-6">
                <h1 className="text-3xl font-bold text-white">{doctor.name}</h1>
                <p className="text-green-100 text-lg">{doctor.speciality}</p>
                <div className="mt-2 flex items-center">
                  <div className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                    {renderStarRating(doctor.averageRating)}
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:ml-auto">
                <Link
                  href={`/consultations/new?doctorId=${doctor.id}`}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Schedule Consultation
                </Link>
                <Link
                  href={`/chat/${doctor.id}`}
                  className="ml-3 inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Chat
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'schedule'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Professional Information</h2>
                  <div className="mt-3 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Speciality</dt>
                      <dd className="mt-1 text-gray-900">{doctor.speciality}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Work Address</dt>
                      <dd className="mt-1 text-gray-900">{doctor.workAddress}</dd>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
                  <div className="mt-3 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-gray-900">{doctor.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-gray-900">{doctor.phoneNumber}</dd>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Ratings & Reviews</h2>
                    <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500" onClick={() => setActiveTab('reviews')}>
                      View all reviews
                    </Link>
                  </div>
                  <div className="mt-3 flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <span className="text-5xl font-bold text-gray-900">{doctor.averageRating ? doctor.averageRating.toFixed(1) : '-'}</span>
                      <span className="text-gray-500">/5</span>
                    </div>
                    <div>
                      {renderStarRating(doctor.averageRating)}
                      <p className="text-sm text-gray-500 mt-1">Based on patient reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Working Schedule</h2>
                
                {Object.keys(groupedSchedules).length === 0 ? (
                  <div className="text-gray-500 py-4">No schedule information available.</div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(groupedSchedules).map(([day, schedules]) => (
                        <div key={day} className="bg-white rounded-md shadow p-4">
                          <h3 className="font-medium text-gray-800">{day.charAt(0) + day.slice(1).toLowerCase()}</h3>
                          <div className="mt-2 space-y-2">
                            {schedules.map((schedule, index) => (
                              <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100">
                                <div className="text-sm">
                                  {formatTimeString(schedule.startTime)} - 
                                  {formatTimeString(schedule.endTime)}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${schedule.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {schedule.available ? 'Available' : 'Booked'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <h3 className="text-base font-medium text-gray-900 mb-2">Schedule a Consultation</h3>
                  <p className="text-gray-600 mb-4">
                    Click the button below to schedule a consultation with Dr. {doctor.name} based on their availability.
                  </p>
                  <Link
                    href={`/consultations/new?doctorId=${doctor.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Schedule Consultation
                  </Link>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Ratings & Reviews</h2>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="flex-shrink-0 sm:mr-8 mb-4 sm:mb-0 text-center">
                      <span className="text-5xl font-bold text-gray-900">{doctor.averageRating ? doctor.averageRating.toFixed(1) : '-'}</span>
                      <div className="mt-1">{renderStarRating(doctor.averageRating)}</div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-gray-600 mb-2">
                        Rating breakdown (from your past consultations):
                      </p>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center">
                            <div className="w-20 text-sm text-gray-600">{rating} stars</div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  rating >= 4 ? 'bg-green-500' : rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: '0%' }} // This would be dynamic in a real app
                              />
                            </div>
                            <div className="w-12 text-right text-sm text-gray-600">0%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reviews list would go here - placeholder content for now */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
                    <p className="mt-1 text-gray-500">
                      This doctor doesn't have any reviews yet. After your consultation, you'll be able to rate your experience.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}