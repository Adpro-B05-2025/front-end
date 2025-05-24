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
      fetch(`http://localhost:8084/api/consultations/${consultationId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Consultation not found');
          return res.json();
        })
        .then((data) => {
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Form Rating</h1>

        <label className="block mb-4">
          <span className="text-gray-700">Rating (1-5)</span>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value) || 0)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Komentar</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
}
