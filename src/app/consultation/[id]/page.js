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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Detail Konsultasi</h1>
      <p><strong>ID:</strong> {consultation.id}</p>
      <p><strong>Patient ID:</strong> {consultation.patientId}</p>
      <p><strong>Doctor ID:</strong> {consultation.doctorId}</p>
      <p><strong>Tanggal:</strong> {dateStr}</p>
      <p><strong>Waktu:</strong> {timeStr}</p>
      <p>
        <strong>Meeting URL:</strong>{' '}
        <a
          href={consultation.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {consultation.meetingUrl}
        </a>
      </p>
      <p><strong>Catatan:</strong> {consultation.note || '-'}</p>

      <button
        onClick={handleEndConsultation}
        className="mt-6 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
      >
        End Consultation
      </button>
    </div>
  );
}
