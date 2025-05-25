'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { toast } from 'react-toastify';

export default function RatingDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [rating, setRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      setIsLoading(true);
      try {
        const response = await api.getRatingDetail(id);
        const data = await response.json();

        if (response.ok) {
          setRating(data.data?.[0]);
        } else {
          console.error(data.message);
          toast.error('Failed to load rating details');
        }
      } catch (err) {
        console.error('Error fetching rating:', err);
        toast.error('Error loading rating details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRating();
  }, [id]);

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await api.deleteRating(id);
      if (res.ok) {
        toast.success('Rating deleted successfully');
        router.push('/');
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete rating');
      }
    } catch (err) {
      console.error('Error deleting rating:', err);
      toast.error(err.message || 'Failed to delete rating');
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading rating details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!rating) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Rating Not Found</h1>
            <p className="text-gray-600">The requested rating could not be found.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <h1 className="text-2xl font-bold text-white">Rating Details</h1>
            <p className="mt-2 text-blue-100">Review of your consultation experience</p>
          </div>

          {/* Rating Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-gray-500">Rating Score</h2>
                  <div className="mt-1 flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-6 w-6 ${i < rating.score ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-lg font-medium text-gray-900">
                      {rating.score} out of 5
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h2 className="text-sm font-medium text-gray-500">Consultation ID</h2>
                  <p className="mt-1 text-lg text-gray-900">{rating.consultationId}</p>
                </div>

                <div className="mb-4">
                  <h2 className="text-sm font-medium text-gray-500">Doctor ID</h2>
                  <p className="mt-1 text-lg text-gray-900">{rating.doctorId}</p>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-gray-500">Date Rated</h2>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(rating.createdAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-gray-500">Comments</h2>
                  <p className="mt-1 text-lg text-gray-900">{rating.comment || 'No comments provided'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between items-center">
              <div>
                <button
                  onClick={() => router.push(`/rating/${id}/edit`)}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  Edit Rating
                </button>
              </div>
              
              <div className="flex gap-4">
                {isConfirmingDelete && (
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`px-6 py-3 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
                    isConfirmingDelete 
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                      : 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                  } ${
                    isDeleting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isConfirmingDelete ? 'Confirm Delete' : 'Deleting...'}
                    </span>
                  ) : (
                    isConfirmingDelete ? 'Confirm Delete' : 'Delete Rating'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}