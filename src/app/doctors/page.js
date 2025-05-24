'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { api } from '@/utils/api';

// List of common medical specialties
const SPECIALTIES = [
  'All Specialties',
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

export default function Doctors() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchSpeciality, setSearchSpeciality] = useState('All Specialties');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Add this to track if component is mounted, to prevent hydration issues
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted to avoid hydration issues
    setIsMounted(true);
    
    // Check if user is authenticated
    try {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        fetchDoctors();
      } else {
        toast.error('Please log in to access this page');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.getAllCareGivers();
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      const data = await response.json();
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    
    try {
      // Prepare search params
      const params = {};
      if (searchName.trim()) {
        params.name = searchName.trim();
      }
      
      if (searchSpeciality && searchSpeciality !== 'All Specialties') {
        params.speciality = searchSpeciality;
      }
      
      console.log('Search params:', params);
      
      // If no search parameters, get all doctors
      if (Object.keys(params).length === 0) {
        fetchDoctors();
        return;
      }
      
      // Call search API with parameters
      const response = await api.searchCareGivers(params);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setFilteredDoctors(data);
    } catch (error) {
      console.error('Error searching doctors:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchName('');
    setSearchSpeciality('All Specialties');
    fetchDoctors();
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
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Wait until component is mounted to render to avoid hydration issues
  if (!isMounted || !isAuthenticated) {
    return null; // Return nothing during server rendering or if not authenticated
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
          <p className="mt-2 text-lg text-gray-600">
            Search for healthcare providers and schedule consultations
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Name search */}
            <div className="md:col-span-5">
              <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name
              </label>
              <input
                id="searchName"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            
            {/* Specialty search */}
            <div className="md:col-span-5">
              <label htmlFor="searchSpeciality" className="block text-sm font-medium text-gray-700 mb-1">
                Speciality
              </label>
              <select
                id="searchSpeciality"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchSpeciality}
                onChange={(e) => setSearchSpeciality(e.target.value)}
              >
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Search buttons */}
            <div className="md:col-span-2 flex items-end">
              <div className="flex space-x-2 w-full">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor List */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading doctors...</span>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-600">No doctors found with the selected criteria.</p>
              <button
                onClick={handleReset}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                View All Doctors
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white shadow rounded-lg overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-green-800 text-xl font-bold">
                        {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">{doctor.name}</h3>
                        <p className="text-green-100 text-sm">{doctor.speciality || 'General Practitioner'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">Rating</span>
                      {renderStarRating(doctor.averageRating)}
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Work Address</h4>
                      <p className="text-gray-700">{doctor.workAddress || 'Not specified'}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h4>
                      <p className="text-gray-700">{doctor.phoneNumber || 'Not available'}</p>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 flex justify-between">
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Full Profile
                    </Link>
                    <Link
                      href={`/consultation/book?id=${doctor.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Schedule Consultation
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}