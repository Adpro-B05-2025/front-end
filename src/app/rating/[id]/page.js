'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';

export default function RatingDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await api.getRatingDetail(id);
        const data = await response.json();

        if (response.ok) {
          setRating(data.data?.[0]);
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

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!rating) return <div className="p-4 text-center">Rating not found.</div>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Rating Detail</h1>
      <p><strong>Score:</strong> {rating.score}</p>
      <p><strong>Comment:</strong> {rating.comment}</p>
      <p><strong>Consultation ID:</strong> {rating.consultationId}</p>
      <p><strong>Doctor:</strong> {`ID ${rating.doctorId}`}</p>
      <p><strong>Created At:</strong> {new Date(rating.createdAt).toLocaleString()}</p>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.push(`/rating/${id}/edit`)}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Edit
        </button>

        <button
          onClick={async () => {
            const confirmDelete = confirm('Apakah kamu yakin ingin menghapus rating ini?');
            if (!confirmDelete) return;

            try {
              const res = await api.deleteRating(id);
              if (res.ok) {
                alert('Rating berhasil dihapus.');
                router.push('/');
              } else {
                const err = await res.json();
                alert(`Gagal menghapus rating: ${err.message || 'Unknown error'}`);
              }
            } catch (err) {
              console.error('Error deleting rating:', err);
              alert('Terjadi kesalahan saat menghapus rating.');
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
