'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';

export default function EditRatingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await api.getRatingDetail(id);
        const data = await res.json();

        if (res.ok) {
          const rating = data.data?.[0];
          setScore(rating.score);
          setComment(rating.comment);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error('Error fetching rating:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateRating(id, {
        score,
        comment,
      });

      if (res.ok) {
        router.push(`/rating/${id}`);
      } else {
        const err = await res.json();
        alert(`Gagal mengupdate rating: ${err.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating rating:', err);
      alert('Terjadi kesalahan saat update rating.');
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Rating</h1>

        <label className="block mb-4">
          <span className="text-gray-700">Score (1-5)</span>
          <input
            type="number"
            min="1"
            max="5"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Comment</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </label>

        <button
          type="submit"
          className="w-full py-2 px-4 rounded text-white bg-blue-600 hover:bg-blue-700"
        >
          Update Rating
        </button>
      </form>
    </div>
  );
}
