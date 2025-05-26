'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE_URL = 'http://localhost:8084/api/consultations';

export default function ConsultationDetailPage({ params }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = params;

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Consultation not found');
          } else {
            throw new Error('Failed to fetch consultation');
          }
          return;
        }
        
        const data = await res.json();
        setConsultation(data);
      } catch (error) {
        console.error('Error fetching consultation:', error);
        setError('Failed to load consultation details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [id]);

  const handleApprove = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/${id}/status?status=APPROVED`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to approve consultation');
      
      // Fetch updated consultation data to ensure we have the latest state
      const updatedRes = await fetch(`${API_BASE_URL}/${id}`);
      if (!updatedRes.ok) throw new Error('Failed to fetch updated consultation');
      
      const updatedData = await updatedRes.json();
      setConsultation(updatedData);
    } catch (error) {
      console.error('Error approving consultation:', error);
      setError('Failed to approve consultation. Please try again.');
    }
  };

  const handleCancel = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!confirm('Are you sure you want to cancel this consultation?')) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to cancel consultation');
      
      router.push('/consultation');
    } catch (error) {
      console.error('Error canceling consultation:', error);
      setError('Failed to cancel consultation. Please try again.');
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

  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-600">Consultation not found.</p>
            <Link
              href="/consultation"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Consultations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Consultation Details</h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/consultation"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to Consultations
            </Link>
            {!isAuthenticated && (
              <Link 
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in to Manage
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Consultation #{consultation.id}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Scheduled for: {new Date(consultation.scheduledTime).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[consultation.status]}`}>
                {consultation.status}
              </span>
            </div>
          </div>

          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Patient ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{consultation.patientId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Doctor ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{consultation.doctorId}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {consultation.description || 'No description provided'}
                </dd>
              </div>
            </dl>
          </div>

          {isAuthenticated && consultation.status === 'PENDING' && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                {user?.roles?.includes('ROLE_CAREGIVER') && (
                  <button
                    onClick={handleApprove}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel Consultation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
