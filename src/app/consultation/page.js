'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/api';

export default function ConsultationPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response = isAuthenticated
          ? user?.roles?.includes('ROLE_CAREGIVER')
            ? await api.getDoctorConsultations(user.id)
            : await api.getPatientConsultations(user.id)
          : await api.getConsultations();

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        
        const consultationsArray = Array.isArray(data) ? data : data.data || [];
        setConsultations(consultationsArray);
      } catch (error) {
        console.error('Error details:', error);
        setError(
          `Unable to load consultations. ${error.message || 'Please try again later.'}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [user, isAuthenticated]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const handleApprove = async (id) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const response = await api.updateConsultationStatus(id, 'APPROVED');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedConsultations = consultations.map(c => 
        c.id === id ? { ...c, status: 'APPROVED' } : c
      );
      setConsultations(updatedConsultations);
    } catch (error) {
      console.error('Error approving consultation:', error);
      setError('Failed to approve consultation. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!confirm('Are you sure you want to cancel this consultation?')) return;
    
    try {
      const response = await api.deleteConsultation(id);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setConsultations(consultations.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting consultation:', error);
      setError('Failed to cancel consultation. Please try again.');
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Consultations</h1>
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <Link 
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in to Book Consultation
              </Link>
            ) : !user?.roles?.includes('ROLE_CAREGIVER') && (
              <Link
                href="/consultation/book"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Book New Consultation
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading consultations...</p>
          </div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">No consultations found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Consultation #{consultation.id}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Scheduled for: {new Date(consultation.scheduledTime).toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(consultation.status)}
                </div>

                {consultation.description && (
                  <p className="text-gray-600 mb-4">{consultation.description}</p>
                )}

                <div className="flex justify-end space-x-3">
                  {isAuthenticated && (
                    <>
                      {user?.roles?.includes('ROLE_CAREGIVER') && consultation.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(consultation.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Approve
                        </button>
                      )}
                      
                      {consultation.status === 'PENDING' && (
                        <button
                          onClick={() => handleDelete(consultation.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancel
                        </button>
                      )}

                      <Link
                        href={`/consultation/${consultation.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Details
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
