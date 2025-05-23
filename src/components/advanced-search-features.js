'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/utils/api';
import debounce from 'lodash/debounce';

/**
 * Custom hook for advanced doctor search with true server-side pagination
 */
export const useAdvancedSearch = () => {
  // Search inputs
  const [searchName, setSearchName] = useState('');
  const [searchSpeciality, setSearchSpeciality] = useState('All Specialties');
  const [minRating, setMinRating] = useState(0);
  const [locationFilter, setLocationFilter] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('averageRating');
  const [sortOrder, setSortOrder] = useState('desc');

  // Autocomplete
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [specialitySuggestions, setSpecialitySuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showSpecialitySuggestions, setShowSpecialitySuggestions] = useState(false);

  // Results
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Pagination - now using server-side pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(12);

  // Refs
  const nameInputRef = useRef(null);
  const specialityInputRef = useRef(null);
  const isFirstRender = useRef(true);
  const abortControllerRef = useRef(null);

  // Function to fetch doctors using server-side pagination
  const fetchDoctors = useCallback(async (resetPage = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setSearchLoading(true);
    
    try {
      // Prepare search parameters
      const params = {
        page: resetPage ? 0 : currentPage,
        size: pageSize,
        sortBy: sortBy,
        sortDirection: sortOrder
      };
      
      // Add search filters
      if (searchName.trim()) {
        params.name = searchName.trim();
      }
      
      if (searchSpeciality && searchSpeciality !== 'All Specialties') {
        params.speciality = searchSpeciality;
      }
      
      console.log('Fetching doctors with params:', params);
      
      // Use the advanced search endpoint for server-side sorting and pagination
      const response = await api.searchCareGiversAdvanced(params);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Received paginated data:', data);
      
      // Apply client-side filters for fields not supported by backend
      let filteredDoctors = [...data.content];
      
      // Apply rating filter (client-side since backend doesn't support it yet)
      if (minRating > 0) {
        filteredDoctors = filteredDoctors.filter(doctor => 
          (doctor.averageRating || 0) >= minRating
        );
      }
      
      // Apply location filter (client-side)
      if (locationFilter.trim()) {
        const locationLower = locationFilter.toLowerCase().trim();
        filteredDoctors = filteredDoctors.filter(doctor => 
          (doctor.workAddress || '').toLowerCase().includes(locationLower)
        );
      }
      
      // Update state with paginated results
      setDoctors(filteredDoctors);
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      
      // If we reset the page, update currentPage state
      if (resetPage && data.number !== currentPage) {
        setCurrentPage(data.number);
      }
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  }, [searchName, searchSpeciality, sortBy, sortOrder, currentPage, pageSize, minRating, locationFilter]);

  // Debounced search function for text inputs
  const debouncedSearch = useCallback(
    debounce(() => {
      fetchDoctors(true); // Reset to first page when searching
    }, 300),
    [fetchDoctors]
  );

  // Effect for search inputs (name and speciality) - debounced
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchDoctors(true); // Initial load
      return;
    }
    
    // Trigger debounced search for text inputs
    debouncedSearch();
    
    return () => debouncedSearch.cancel();
  }, [searchName, searchSpeciality, debouncedSearch]);

  // Effect for sorting changes - immediate
  useEffect(() => {
    if (!isFirstRender.current) {
      fetchDoctors(true); // Reset to first page when sorting changes
    }
  }, [sortBy, sortOrder]);

  // Effect for client-side filters - immediate re-filtering
  useEffect(() => {
    if (!isFirstRender.current && doctors.length > 0) {
      // Re-fetch with current search parameters to apply new filters
      fetchDoctors(true);
    }
  }, [minRating, locationFilter]);

  // Effect for pagination - immediate
  useEffect(() => {
    if (!isFirstRender.current) {
      fetchDoctors(false); // Don't reset page for pagination
    }
  }, [currentPage]);

  // Fetch name suggestions from server
  const fetchNameSuggestions = useCallback(
    debounce(async (name) => {
      if (!name.trim() || name.length < 2) {
        setNameSuggestions([]);
        return;
      }
      
      try {
        const response = await api.getNameSuggestions(name.trim());
        
        if (!response.ok) {
          throw new Error('Failed to fetch name suggestions');
        }
        
        const suggestions = await response.json();
        setNameSuggestions(suggestions);
        
      } catch (error) {
        console.error('Error fetching name suggestions:', error);
        setNameSuggestions([]);
      }
    }, 200),
    []
  );

  // Fetch speciality suggestions from server
  const fetchSpecialitySuggestions = useCallback(
    debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setSpecialitySuggestions([]);
        return;
      }
      
      try {
        const response = await api.getSpecialitySuggestions(query.trim());
        
        if (!response.ok) {
          throw new Error('Failed to fetch speciality suggestions');
        }
        
        const suggestions = await response.json();
        setSpecialitySuggestions(suggestions);
        
      } catch (error) {
        console.error('Error fetching speciality suggestions:', error);
        setSpecialitySuggestions([]);
      }
    }, 200),
    []
  );

  // Update name suggestions when searchName changes
  useEffect(() => {
    if (searchName.length >= 2) {
      fetchNameSuggestions(searchName);
    } else {
      setNameSuggestions([]);
    }
    
    return () => fetchNameSuggestions.cancel();
  }, [searchName, fetchNameSuggestions]);

  // Load initial speciality suggestions
  useEffect(() => {
    // Fetch common specialities on mount
    fetchSpecialitySuggestions('');
  }, [fetchSpecialitySuggestions]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle suggestion clicks
  const handleNameSuggestionClick = (suggestion) => {
    setSearchName(suggestion);
    setShowNameSuggestions(false);
  };

  const handleSpecialitySuggestionClick = (suggestion) => {
    setSearchSpeciality(suggestion);
    setShowSpecialitySuggestions(false);
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchName('');
    setSearchSpeciality('All Specialties');
    setMinRating(0);
    setLocationFilter('');
    setSortBy('averageRating');
    setSortOrder('desc');
    setCurrentPage(0);
    
    // Focus on name input after reset
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 100);
  };

  // Get top-rated doctors
  const getTopRatedDoctors = useCallback(async () => {
    setSearchLoading(true);
    
    try {
      const params = {
        page: 0,
        size: pageSize
      };
      
      const response = await api.getTopRatedCareGivers(params);
      
      if (!response.ok) {
        throw new Error('Failed to fetch top-rated doctors');
      }
      
      const data = await response.json();
      
      setDoctors(data.content);
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      
    } catch (error) {
      console.error('Error fetching top-rated doctors:', error);
      setDoctors([]);
    } finally {
      setSearchLoading(false);
    }
  }, [pageSize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedSearch.cancel();
      fetchNameSuggestions.cancel();
      fetchSpecialitySuggestions.cancel();
    };
  }, [debouncedSearch, fetchNameSuggestions, fetchSpecialitySuggestions]);

  return {
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
    totalResults: totalElements, // Backwards compatibility
    totalElements,
    
    // Pagination
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    
    // Actions
    resetAllFilters,
    getTopRatedDoctors,
    
    // Refs
    nameInputRef,
    specialityInputRef
  };
};

/**
 * AutoComplete Input Component with server-side suggestions
 */
export const AutoCompleteInput = ({ 
  value, 
  onChange,
  suggestions = [],
  onSuggestionClick,
  showSuggestions = false,
  onFocus,
  onBlur,
  placeholder = 'Search...',
  inputRef,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
              onMouseDown={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Pagination Component with better page information
 */
export const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalElements,
  pageSize,
  onPageChange,
  className = ''
}) => {
  const pageNumbers = [];
  
  // Calculate display range
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);
  
  // Create array of page numbers to show
  if (totalPages <= 7) {
    // If less than 7 pages, show all
    for (let i = 0; i < totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always show first page
    pageNumbers.push(0);
    
    // If current page is among the first 3 pages
    if (currentPage < 3) {
      pageNumbers.push(1, 2, 3, 4);
      pageNumbers.push('...');
      pageNumbers.push(totalPages - 1);
    } 
    // If current page is among the last 3 pages
    else if (currentPage >= totalPages - 3) {
      pageNumbers.push('...');
      pageNumbers.push(totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2);
      pageNumbers.push(totalPages - 1);
    }
    // If current page is in the middle
    else {
      pageNumbers.push('...');
      pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
      pageNumbers.push('...');
      pageNumbers.push(totalPages - 1);
    }
  }
  
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between ${className}`}>
      {/* Results info */}
      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
        Showing {startItem} to {endItem} of {totalElements} results
      </div>
      
      {/* Page navigation */}
      <div className="flex items-center">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className={`px-3 py-1 rounded-md mr-1 ${
            currentPage === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {pageNumbers.map((pageNum, index) => (
          <button
            key={index}
            onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : null}
            disabled={pageNum === '...'}
            className={`px-3 py-1 mx-0.5 rounded-md ${
              pageNum === currentPage
                ? 'bg-blue-600 text-white'
                : pageNum === '...'
                  ? 'text-gray-500 cursor-default'
                  : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            {pageNum === '...' ? '...' : pageNum + 1}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className={`px-3 py-1 rounded-md ml-1 ${
            currentPage === totalPages - 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Enhanced Sort Dropdown Component
 */
export const SortDropdown = ({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  className = ''
}) => {
  const handleSortChange = (e) => {
    const value = e.target.value;
    const [field, order] = value.split(':');
    setSortBy(field);
    setSortOrder(order);
  };

  return (
    <div className={className}>
      <select
        value={`${sortBy}:${sortOrder}`}
        onChange={handleSortChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="averageRating:desc">Highest Rated</option>
        <option value="averageRating:asc">Lowest Rated</option>
        <option value="name:asc">Name (A-Z)</option>
        <option value="name:desc">Name (Z-A)</option>
        <option value="speciality:asc">Speciality (A-Z)</option>
        <option value="speciality:desc">Speciality (Z-A)</option>
      </select>
    </div>
  );
};

export default {
  useAdvancedSearch,
  AutoCompleteInput,
  Pagination,
  SortDropdown
};