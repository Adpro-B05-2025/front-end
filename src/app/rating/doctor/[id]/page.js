'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function DoctorDetail({ params }) {
  const router = useRouter();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access this page');
      router.push('/login');
      return;
    }
    fetchRatings();
  }, [router, params.id]);

  const fetchRatings = async () => {
    if (!params?.id) {
      toast.error('Doctor ID is missing');
      router.push('/doctors');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token found');

      const response = await api.getDoctorRatings(params.id);
      
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      setRatings(data.data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load ratings.');
      router.push('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (rating) => {
    if (rating === null || rating === undefined) return 'No ratings yet';

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
                : i === fullStars && hasHalfStar
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
        <span className="ml-2">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>
      {ratings.length === 0 && <p className="text-gray-600">No reviews yet.</p>}
      {ratings.map((review) => (
        <div key={review.id} className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
          <div className="flex items-center mb-2">
            <span className="font-semibold text-gray-800">
              {review.userId ? `Pasien ${review.userId}` : 'Anonymous'}
            </span>
            <div className="ml-4">{renderStarRating(review.score)}</div>
            <span className="ml-auto text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
