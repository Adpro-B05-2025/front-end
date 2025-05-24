'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthProvider';

export default function Profile() {
    const router = useRouter();
    const { user: authUser, refreshUser, logout } = useAuth();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        phoneNumber: '',
        medicalHistory: '',
        speciality: '',
        workAddress: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [error, setError] = useState(null);

    // Track if email is about to change
    const [initialEmail, setInitialEmail] = useState('');

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

    useEffect(() => {
        // Function to check auth and fetch profile
        const loadProfile = async () => {
            try {
                // Check if user is authenticated via AuthContext
                if (!authUser) {
                    console.log('No authenticated user found');
                    router.push('/login');
                    return;
                }

                console.log('User authenticated, fetching profile...');
                await fetchProfileData();
            } catch (error) {
                console.error('Error during profile initialization:', error);
                setError('Failed to load profile. Please try logging in again.');
            }
        };

        loadProfile();
    }, [router, authUser]);

    const fetchProfileData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('Making API request to fetch profile data');
            const response = await api.getProfile();

            if (!response.ok) {
                console.error('Profile fetch failed with status:', response.status);

                if (response.status === 401) {
                    console.log('Unauthorized response - logging out');
                    logout('Your session has expired. Please log in again.');
                    return;
                } else if (response.status === 403) {
                    console.log('Forbidden response - insufficient permissions');
                    toast.error('You do not have permission to view this profile');
                    router.push('/dashboard');
                    return;
                }

                throw new Error('Failed to fetch profile data');
            }

            const profileData = await response.json();
            console.log('Profile data received:', profileData);
            setUser(profileData);
            setInitialEmail(profileData.email || ''); // Store initial email

            // Set form data based on profile data
            setFormData({
                name: profileData.name || '',
                email: profileData.email || '',
                address: profileData.address || '',
                phoneNumber: profileData.phoneNumber || '',
                medicalHistory: profileData.medicalHistory || '',
                speciality: profileData.speciality || '',
                workAddress: profileData.workAddress || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile data. Please try again.');
            toast.error('Failed to load profile data. Please try logging in again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            console.log('Submitting profile update:', formData);

            // Check if email is being changed
            const isEmailChanging = initialEmail !== formData.email;
            console.log('Email changing:', isEmailChanging, 'from', initialEmail, 'to', formData.email);

            // If email is changing, show a confirmation dialog
            if (isEmailChanging) {
                const confirmed = window.confirm(
                    'Changing your email will require you to log in again with your new email. Continue?'
                );
                if (!confirmed) {
                    setIsSubmitting(false);
                    return;
                }
            }

            // Make a custom fetch request instead of using api.updateProfile
            const token = localStorage.getItem('token');
            const API_BASE_URL = 'http://localhost:8081';

            console.log('Using API base URL:', API_BASE_URL);

            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
                credentials: 'omit',
                mode: 'cors'
            });

            if (!response.ok) {
                // Handle error responses...
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            // Process response data
            const data = await response.json();

            // If email was changed, ALWAYS force logout
            if (isEmailChanging) {
                // Show success message
                toast.success('Profile updated successfully! You will be logged out.');

                // Store new email in sessionStorage for convenience
                sessionStorage.setItem('pendingEmail', formData.email);

                // Logout after a short delay
                setTimeout(() => {
                    logout('Your email has been updated. Please log in again with your new email.');
                }, 1500);
                return;
            }

            // If no email change, update the profile normally
            setUser(data);
            setInitialEmail(formData.email); // Update initial email state

            // Refresh user context
            refreshUser();

            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || 'Failed to update profile. Please try again.');
            toast.error(error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            return;
        }

        try {
            console.log('Deleting account...');
            // Use direct API call
            const response = await api.deleteAccount();

            if (!response.ok) {
                console.error('Account deletion failed with status:', response.status);

                // Handle different error statuses
                if (response.status === 401) {
                    toast.error('Your session has expired. Please log in again.');
                    logout();
                    return;
                } else if (response.status === 403) {
                    toast.error('You do not have permission to delete this account');
                    setIsConfirmingDelete(false);
                    return;
                }

                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete account');
            }

            toast.success('Account deleted successfully');

            // Handle logout after successful deletion
            logout('Your account has been deleted successfully');
        } catch (error) {
            console.error('Error deleting account:', error);
            setError(error.message || 'Failed to delete account. Please try again.');
            toast.error(error.message || 'Failed to delete account. Please try again.');
            setIsConfirmingDelete(false);
        }
    };

    // Error state
    if (error && !user) {
        return (
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg overflow-hidden p-6 text-center">
                        <div className="text-red-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Authentication Error</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading-spinner"></div>
                <span className="ml-2">Loading profile data...</span>
            </div>
        );
    }

    const isPacillian = user?.userType === 'PACILLIAN';
    const isCareGiver = user?.userType === 'CAREGIVER';

    // Simplified permission check based on user type
    const canEdit = authUser?.id === user?.id;
    const canDelete = authUser?.id === user?.id;
    const canViewMedicalHistory = isPacillian ? (authUser?.id === user?.id) : true;

    return (
        <div className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
                        <div className="flex items-center">
                            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-blue-800 text-2xl font-bold">
                                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="ml-6">
                                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                                <p className="text-blue-100">{user?.email}</p>
                                <div className="mt-1 flex">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {isPacillian ? 'Patient' : 'Healthcare Provider'}
                                    </span>
                                    {isCareGiver && user?.speciality && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {user.speciality}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                disabled={!canEdit}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                id="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                disabled={!canEdit}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                disabled={!canEdit}
                                            />
                                            {canEdit && (
                                                <p className="mt-1 text-xs text-yellow-600">
                                                    Note: Changing your email will require you to log in again.
                                                </p>
                                            )}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                id="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                disabled={!canEdit}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Pacillian Specific Fields */}
                                {isPacillian && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Medical Information</h3>
                                        <div className="mt-4">
                                            <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                                                Medical History
                                            </label>
                                            <textarea
                                                id="medicalHistory"
                                                name="medicalHistory"
                                                rows={4}
                                                value={formData.medicalHistory}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="List any allergies, chronic conditions, or other relevant medical information"
                                                disabled={!canViewMedicalHistory}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* CareGiver Specific Fields */}
                                {isCareGiver && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Professional Information</h3>
                                        <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700">
                                                    Speciality
                                                </label>
                                                <select
                                                    name="speciality"
                                                    id="speciality"
                                                    value={formData.speciality}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                    disabled={!canEdit}
                                                >
                                                    <option value="">Select a speciality</option>
                                                    {SPECIALTIES.map((specialty) => (
                                                        <option key={specialty} value={specialty}>
                                                            {specialty}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="workAddress" className="block text-sm font-medium text-gray-700">
                                                    Work Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="workAddress"
                                                    id="workAddress"
                                                    value={formData.workAddress}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                    disabled={!canEdit}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Non-editable Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Information</h3>
                                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">NIK (National ID)</label>
                                            <div className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500">
                                                {user?.nik}
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">NIK cannot be changed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="mt-8 flex flex-col sm:flex-row sm:justify-between gap-3">
                                <div>
                                    {canDelete && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleDeleteAccount}
                                                className={`px-4 py-2 text-sm font-medium rounded-md ${isConfirmingDelete
                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                    : 'border border-red-300 text-red-700 bg-white hover:bg-red-50'
                                                    }`}
                                            >
                                                {isConfirmingDelete ? 'Confirm Delete Account' : 'Delete Account'}
                                            </button>
                                            {isConfirmingDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsConfirmingDelete(false)}
                                                    className="ml-3 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div>
                                    {canEdit && (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`px-6 py-2 text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}