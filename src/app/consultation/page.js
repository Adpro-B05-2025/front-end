'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';

export default function ConsultationPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tambahan: state untuk rating yang sedang dilihat (bisa disesuaikan)
  const [selectedRating, setSelectedRating] = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const res = await fetch('http://localhost:8084/api/consultations');
        const data = await res.json();

        // Filter konsultasi sesuai user
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

  const handleViewRating = (consultationId) => {
    setSelectedRating(`Rating for consultation ${consultationId} is 4.5 ⭐`);
  };

  if (loading) return <p>Loading consultations...</p>;

  return (
    <div>
      <h1>Your Consultations</h1>
      {consultations.length === 0 ? (
        <p>You have no consultations yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {consultations.map((c) => (
            <div
              key={c.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                backgroundColor: '#fff',
                maxWidth: '400px',
              }}
            >
              <p><strong>Consultation ID:</strong> {c.id}</p>
              <p><strong>Doctor ID:</strong> {c.doctorId}</p>
              <p>
                <strong>Date & Time:</strong>{' '}
                {new Date(c.scheduledAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>

              <button
                onClick={() => handleViewRating(c.id)}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                View Rating
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tampilkan rating yang dipilih jika ada */}
      {selectedRating && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            border: '1px solid #0070f3',
            borderRadius: '8px',
            backgroundColor: '#e0f0ff',
            maxWidth: '400px',
          }}
        >
          <p>{selectedRating}</p>
          <button onClick={() => setSelectedRating(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
