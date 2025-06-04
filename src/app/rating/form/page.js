'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/utils/api';

export default function RatingFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultationId = searchParams.get('consultationId');

  const [doctorId, setDoctorId] = useState(null);
  const [loadingConsultation, setLoadingConsultation] = useState(false);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (consultationId) {
      setLoadingConsultation(true);
      setError(null);
      api.getConsultationDetail(consultationId)
        .then(async (res) => {
          if (!res.ok) throw new Error('Consultation not found');
          const data = await res.json();
          setDoctorId(data.doctorId);
        })
        .catch((err) => {
          console.error('Failed to fetch consultation:', err);
          setError('Gagal mengambil data konsultasi.');
        })
        .finally(() => setLoadingConsultation(false));
    } else {
      setError('Consultation ID tidak ditemukan di URL.');
    }
  }, [consultationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!consultationId || !doctorId) {
      alert('Doctor ID dan Consultation ID harus tersedia untuk memberi rating.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.createRating({
        score: rating,
        comment,
        doctorId: parseInt(doctorId, 10),
        consultationId: parseInt(consultationId, 10),
      });

      if (response.ok) {
        const data = await response.json();
        const id = data.data && data.data.length > 0 ? data.data[0].id : null;
        if (id) {
          router.push(`/rating/${id}`);
        } else {
          alert('Gagal mendapatkan ID rating dari server.');
        }
      }
      else {
        const errorData = await response.json();
        alert(`Gagal mengirim rating: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat mengirim rating.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingConsultation) return <div className="p-4 text-center">Loading consultation data...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <h1 className="text-2xl font-bold text-white">Rate Doctor in this Consultation</h1>
            <p className="mt-2 text-blue-100">
              Share your experience to help us improve our services
            </p>
          </div>

          {/* Rating Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Consultation Rating
                </h3>
                <div className="mt-4">
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                    Rating (1-5 stars)
                  </label>
                  <div className="mt-2 flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`h-10 w-10 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value) || 0)}
                      required
                      className="sr-only"
                      id="rating"
                    />
                    <span className="ml-3 text-lg font-medium text-gray-700">
                      {rating} {rating === 1 ? 'star' : 'stars'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comment Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Your Feedback
                </h3>
                <div className="mt-4">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                    Comments
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Share details about your experience with this doctor..."
                    required
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Rating'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
