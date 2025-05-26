'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';

export default function ConsultationPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupContent, setPopupContent] = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const res = await fetch('http://localhost:8084/api/consultation-pacillian');
        const data = await res.json();
        const myConsultations = data.filter((item) => item.patientId === user.id);
        setConsultations(myConsultations);
      } catch (error) {
        console.error('Error fetching consultations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConsultations();
    }
  }, [user]);

  const handleViewRating = async (consultationId) => {
    try {
      const res = await fetch(`http://localhost:8083/api/rating/consultation/${consultationId}`);
      const json = await res.json();

      if (json.data.length > 0) {
        const rating = json.data[0];
        setPopupContent(
          <div className="bg-white p-4 rounded shadow-lg max-w-md text-center">
            <h2 className="text-xl font-semibold mb-2">Rating Detail</h2>
            <p><strong>Score:</strong> {rating.score} ⭐</p>
            <p><strong>Comment:</strong> {rating.comment}</p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => router.push(`/rating/${rating.id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Edit Rating
              </button>
              <button onClick={() => setPopupContent(null)} className="bg-gray-400 px-4 py-2 rounded text-white">
                Close
              </button>
            </div>
          </div>
        );
      } else {
        setPopupContent(
          <div className="bg-white p-4 rounded shadow-lg max-w-md text-center">
            <p>You haven’t rated this consultation yet.</p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => router.push(`/rating/form?consultationId=${consultationId}`)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Give Rating
              </button>
              <button onClick={() => setPopupContent(null)} className="bg-gray-400 px-4 py-2 rounded text-white">
                Back
              </button>
            </div>
          </div>
        );
      }
    } catch (err) {
      console.error('Error fetching rating:', err);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Your Consultations</h1>
        
        {loading ? (
          <p className="text-center py-4">Loading consultations...</p>
        ) : consultations.length === 0 ? (
          <p className="text-center py-4">You have no consultations yet.</p>
        ) : (
          <div className="space-y-4">
            {consultations.map((c) => {
              const dateStr = new Date(c.scheduledAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={c.id} className="bg-white p-4 rounded-lg border border-gray-200 relative min-h-[100px]">
                  {/* Left side content */}
                  <div className="mb-8"> {/* Added mb-8 to create space for button */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">Consultation ID:</span>
                      <span>{c.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Doctor ID:</span>
                      <span>{c.doctorId}</span>
                    </div>
                  </div>
                  
                  {/* Date in top right */}
                  <div className="absolute top-4 right-4">
                    <span className="text-sm text-gray-500">{dateStr}</span>
                  </div>
                  
                  {/* Button in bottom right */}
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={() => handleViewRating(c.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                    >
                      View Rating
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Popup Modal */}
        {popupContent && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            {popupContent}
          </div>
        )}
      </div>
    </div>
  );
}
