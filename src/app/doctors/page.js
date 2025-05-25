'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
  useAdvancedSearch,
  AutoCompleteInput,
  Pagination,
  SortDropdown
} from '../../components/advanced-search-features';

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


export default function AdvancedDoctorSearch() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Use React 18's useTransition for non-blocking UI updates
  const [isPending, startTransition] = useTransition();

  // Add state to control loading indicator visibility with a delay
  const [showSearchingIndicator, setShowSearchingIndicator] = useState(false);
  const [showUpdatingIndicator, setShowUpdatingIndicator] = useState(false);
  const searchTimerRef = useRef(null);
  const updateTimerRef = useRef(null);

  const {
    // Search inputs
    searchName,
    setSearchName,
    searchSpeciality,
    setSearchSpeciality,
    minRating,
    setMinRating,
    locationFilter,
    setLocationFilter,

    // Sorting
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // Autocomplete
    nameSuggestions,
    specialitySuggestions,
    showNameSuggestions,
    setShowNameSuggestions,
    showSpecialitySuggestions,
    setShowSpecialitySuggestions,
    handleNameSuggestionClick,
    handleSpecialitySuggestionClick,

    // Results
    doctors,
    loading,
    searchLoading,
    totalResults,

    // Pagination
    currentPage,
    totalPages,
    handlePageChange,

    // Actions
    resetAllFilters,

    // Refs
    nameInputRef,
    specialityInputRef
  } = useAdvancedSearch();

  // Control "Searching..." indicator near search bar with a delay
  useEffect(() => {
    if (searchLoading && searchName.length > 0) {
      // Only show the searching indicator if search takes longer than 300ms
      searchTimerRef.current = setTimeout(() => {
        setShowSearchingIndicator(true);
      }, 300);
    } else {
      clearTimeout(searchTimerRef.current);
      setShowSearchingIndicator(false);
    }

    // Clean up timer on unmount
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchLoading, searchName]);

  // Control "Updating results..." indicator with a delay
  useEffect(() => {
    if (searchLoading || isPending) {
      // Only show the updating indicator if operation takes longer than 300ms
      updateTimerRef.current = setTimeout(() => {
        setShowUpdatingIndicator(true);
      }, 300);
    } else {
      clearTimeout(updateTimerRef.current);
      setShowUpdatingIndicator(false);
    }

    // Clean up timer on unmount
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [searchLoading, isPending]);

  useEffect(() => {
    setIsMounted(true);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
      } else {
        toast.error('Please log in to access this page');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      router.push('/login');
    }
  }, [router]);

  // Wrapper functions that use startTransition for smoother UI
  const handleSetSearchName = (value) => {
    startTransition(() => {
      setSearchName(value);
    });
  };


  const handleSetSearchSpeciality = (value) => {
    startTransition(() => {
      setSearchSpeciality(value);
    });
  };

  const handleSetMinRating = (value) => {
    startTransition(() => {
      setMinRating(value);
    });
  };

  const handleSetLocationFilter = (value) => {
    startTransition(() => {
      setLocationFilter(value);
    });
  };

  const handleSetSortBy = (field, order) => {
    startTransition(() => {
      setSortBy(field);
      setSortOrder(order);
    });
  };

  const handlePageChangeWithTransition = (page) => {
    startTransition(() => {
      handlePageChange(page);
    });
  };

  const handleResetAllFilters = () => {
    startTransition(() => {
      resetAllFilters();
    });

  };

  const renderStarRating = (rating) => {
    if (!rating) return 'No ratings yet';

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${i < fullStars
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
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };


  // Wait until component is mounted to render to avoid hydration issues

  if (!isMounted || !isAuthenticated) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
          <p className="mt-2 text-lg text-gray-600">
            Advanced real-time search with smart suggestions
          </p>
        </div>

        {/* Advanced Search Panel */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          {/* Basic Search Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mb-6">
            {/* Name search with autocomplete */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name
                {/* Only show "Searching..." indicator if search is taking time */}
                {showSearchingIndicator && (
                  <span className="ml-2 text-xs text-blue-600 animate-pulse">
                    Searching...
                  </span>
                )}
              </label>
              <AutoCompleteInput
                value={searchName}
                onChange={handleSetSearchName}
                suggestions={nameSuggestions}
                onSuggestionClick={handleNameSuggestionClick}
                showSuggestions={showNameSuggestions}
                onFocus={() => setShowNameSuggestions(true)}
                onBlur={() => setShowNameSuggestions(false)}
                placeholder="Type doctor's name..."
                inputRef={nameInputRef}
                loading={showSearchingIndicator}
              />
            </div>


            {/* Speciality search */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">

                Speciality
              </label>
              <select
                value={searchSpeciality}
                onChange={(e) => handleSetSearchSpeciality(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>


            {/* Advanced Filters Toggle */}
            <div className="md:col-span-4 flex items-end">

              <div className="flex space-x-2 w-full">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  {showAdvancedFilters ? 'Hide' : 'Show'} Filters
                  <svg
                    className={`inline-block ml-2 h-4 w-4 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleResetAllFilters}
                  className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters (Collapsible) */}
          {showAdvancedFilters && (
            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location/Area
                  </label>
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => handleSetLocationFilter(e.target.value)}
                    placeholder="Enter city or area..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => handleSetMinRating(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Results
                  </label>
                  <SortDropdown
                    sortBy={sortBy}
                    setSortBy={handleSetSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={(order) => startTransition(() => setSortOrder(order))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Search Status */}
          <div className="mt-6 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {loading ? 'Loading...' : `${totalResults} doctor${totalResults !== 1 ? 's' : ''} found`}
              </span>
              {/* Only show "Updating results..." indicator if operation is taking time */}
              {showUpdatingIndicator && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span>Updating results...</span>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <span className="text-gray-500">
                Page {currentPage + 1} of {totalPages}
              </span>
            )}
          </div>
        </div>

        {/* Results Section - We use CSS transitions for smoother updates */}
        <div className={`transition-opacity duration-200 ${(searchLoading || isPending) ? 'opacity-70' : 'opacity-100'}`}>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg">Loading doctors...</span>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or clear all filters</p>
              <button
                onClick={handleResetAllFilters}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Search
              </button>
            </div>
          ) : (
            <>
              {/* Doctor Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
                  >
                    {/* Doctor Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-800 px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-green-800 text-lg font-bold shadow-md">
                          {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-lg font-semibold text-white truncate">{doctor.name}</h3>
                          <p className="text-green-100 text-sm truncate">{doctor.speciality || 'General Practitioner'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="px-4 py-4 space-y-3">
                      {/* Rating */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</span>
                        {renderStarRating(doctor.averageRating)}
                      </div>

                      {/* Location */}
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</h4>
                        <p className="text-sm text-gray-700 line-clamp-2">{doctor.workAddress || 'Not specified'}</p>
                      </div>

                      {/* Contact */}
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Contact</h4>
                        <p className="text-sm text-gray-700">{doctor.phoneNumber || 'Not available'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-4 py-3 bg-gray-50 flex space-x-2">
                      <Link
                        href={`/doctors/${doctor.id}`}
                        className="flex-1 text-center px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/consultation/book?id=${doctor.id}`}
                        className="flex-1 text-center px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChangeWithTransition}
                    className="justify-center"
                  />

                </div>
              )}
            </>
          )}
        </div>

        {/* Search Tips */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🔍 Smart Search</h4>
              <ul className="space-y-1">
                <li>• Type partial names for suggestions</li>
                <li>• Search updates as you type</li>
                <li>• Use filters to narrow results</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⭐ Quality Indicators</h4>
              <ul className="space-y-1">
                <li>• Higher ratings indicate better reviews</li>
                <li>• Check speciality match</li>
                <li>• Consider location convenience</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalResults}</div>
            <div className="text-sm text-gray-600">Total Doctors</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {/* Count unique specialties from actual doctor data */}
              {[...new Set(doctors.map(doc => doc.speciality).filter(Boolean))].length}
            </div>
            <div className="text-sm text-gray-600">Specialities</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{currentPage + 1}</div>
            <div className="text-sm text-gray-600">Current Page</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {doctors.filter(d => d.averageRating >= 4).length}
            </div>
            <div className="text-sm text-gray-600">4+ Star Doctors</div>
          </div>
        </div>
      </div>
    </div>
  );
}