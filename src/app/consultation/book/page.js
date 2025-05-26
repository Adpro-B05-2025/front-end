'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost:8084/api/consultations';

export default function BookConsultationPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [description, setDescription] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch doctors list
    const fetchDoctors = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/doctors');
        if (!res.ok) throw new Error('Failed to fetch doctors');
        const data = await res.json();
        setDoctors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [isAuthenticated, router]);

  // Fetch available slots when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;

    const fetchAvailableSlots = async () => {
      try {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const res = await fetch(
          `http://localhost:8080/api/doctors/${selectedDoctor}/schedule?from=${today.toISOString()}&to=${nextWeek.toISOString()}`
        );
        if (!res.ok) throw new Error('Failed to fetch schedule');
        
        const data = await res.json();
        setAvailableSlots(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('Failed to load available slots. Please try again.');
      }
    };

    fetchAvailableSlots();
  }, [selectedDoctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const consultationData = {
        patientId: user.id,
        doctorId: parseInt(selectedDoctor),
        scheduledTime: scheduledTime,
        description: description
      };

      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to book consultation');
      }

      router.push('/consultation');
    } catch (error) {
      console.error('Error booking consultation:', error);
      setError('Failed to book consultation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Book a Consultation</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            <div>
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
                Select Doctor
              </label>
              <select
                id="doctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Select Time
              </label>
              <select
                id="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                disabled={!selectedDoctor}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Choose a time slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot.time} value={slot.time}>
                    {new Date(slot.time).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Please describe your symptoms or reason for consultation..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Book Consultation
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}