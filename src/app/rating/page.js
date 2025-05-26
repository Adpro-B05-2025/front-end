'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthProvider'; // pastikan ini sesuai dengan context kamu

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function DoctorDetail() {
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access this page');
      router.push('/login');
      return;
    }
    const payload = parseJwt(token);
    if (!payload?.sub) {
      toast.error('Invalid token, please log in again');
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }
    fetchDoctorDetails(payload.sub, token);
  }, [router]);

  const fetchDoctorDetails = async (userId, token) => {
    setLoading(true);
    try {
      // Fetch caregiver profile
      const response = await fetch(`http://localhost:8081/api/caregiver/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch doctor details');
      const data = await response.json();

      if (data.userType !== 'CAREGIVER') {
        toast.error('The requested profile is not a doctor');
        router.push('/doctors');
        return;
      }
      setDoctor(data);

      // Fetch summary
      const summaryRes = await fetch(`http://localhost:8081/api/caregiver/${userId}/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setAverageRating(summaryData.averageRating);
      }

      // Fetch ratings
      const ratingsRes = await fetch(`http://localhost:8083/api/rating/doctor/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (ratingsRes.ok) {
        const ratingsData = await ratingsRes.json();
        setRatings(ratingsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error('Failed to load doctor details. Please try again.');
      router.push('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (ratings.length === 0) return distribution;

    ratings.forEach(r => {
      const score = Math.round(r.score);
      if (distribution[score] !== undefined) {
        distribution[score]++;
      }
    });

    Object.keys(distribution).forEach(key => {
      distribution[key] = (distribution[key] / ratings.length) * 100;
    });

    return distribution;
  };

  const renderStarRating = (rating) => {
    if (rating === null || rating === undefined) return 'No ratings yet';

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const ratingDistribution = getRatingDistribution();

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

  return (
    <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Rating & Reviews</h1>
            <p className="mt-2 text-lg text-gray-600">
            How your patient rate you
            </p>
        </div>

        <div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="flex-shrink-0 sm:mr-8 mb-4 sm:mb-0 text-center">
                <span className="text-5xl font-bold text-gray-900">
                    {doctor.averageRating ? doctor.averageRating.toFixed(1) : '-'}
                </span>
                <div className="mt-1">{renderStarRating(doctor.averageRating)}</div>
                <p className="text-sm text-gray-600 mt-2">{ratings.length} reviews</p>
                </div>

                <div className="flex-grow">
                <p className="text-gray-600 mb-2">Rating breakdown:</p>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                    const percent = getRatingDistribution()[star] || 0;
                    return (
                        <div key={star} className="flex items-center">
                        <div className="w-20 text-sm text-gray-600">{star} stars</div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mx-2">
                            <div
                            className={`h-full rounded-full ${
                                star >= 4
                                ? 'bg-green-500'
                                : star === 3
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${percent}%` }}
                            />
                        </div>
                        <div className="w-12 text-right text-sm text-gray-600">
                            {percent.toFixed(0)}%
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
            </div>
            </div>

            <div className="space-y-6">
            {ratings.length === 0 && (
                <p className="text-gray-600">No reviews yet.</p>
            )}

            {ratings.map((review) => (
                <div key={review.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                    <span className="font-semibold text-gray-800">
                    {`Pacillian ${review.userId}` || 'Anonymous'}
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
        </div>
        </div>
    </div>
    );
}