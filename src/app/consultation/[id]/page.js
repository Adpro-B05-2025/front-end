'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';

export default function ConsultationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchConsultation = async () => {
      try {
        const response = await api.getConsultationDetail(id);
        const data = await response.json();
        if (response.ok) {
          setConsultation(data);
        } else {
          setError(data.message || 'Gagal mengambil data');
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat mengambil data konsultasi');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [id]);

  if (loading) return <p>Memuat detail konsultasi...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!consultation) return null;

  const scheduledDate = new Date(consultation.scheduledAt);
  const dateStr = scheduledDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = scheduledDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleEndConsultation = () => {
    router.push(`/consultation/${id}/ended`);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <h1 className="text-2xl font-bold text-white">Consultation Detail</h1>
          </div>

          {/* Consultation Details Card */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-gray-500">Consultation ID</h2>
                  <p className="mt-1 text-lg text-gray-900">{consultation.id}</p>
                </div>
                
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-gray-500">Doctor ID</h2>
                  <p className="mt-1 text-lg text-gray-900">{consultation.doctorId}</p>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-gray-500">Date & Time</h2>
                  <p className="mt-1 text-lg text-gray-900">{dateStr} - {timeStr}</p>
                </div>
                
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-gray-500">Meeting URL</h2>
                  <a
                    href={consultation.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-lg text-blue-600 hover:text-blue-800 underline"
                  >
                    Join Meeting
                  </a>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-sm font-medium text-gray-500">Consultation Notes</h2>
              <p className="mt-1 text-gray-900">{consultation.note || 'No notes available'}</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={handleEndConsultation}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
              >
                End Consultation
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
