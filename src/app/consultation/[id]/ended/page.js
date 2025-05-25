'use client';

import { useRouter, useParams } from 'next/navigation';

export default function ConsultationEndedPage() {
  const router = useRouter();
  const { id } = useParams();

  const handleGoToRating = () => {
    router.push(`/rating/form?consultationId=${id}`);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Consultation Ended</h1>
          
          <div className="mt-4 max-w-2xl mx-auto">
            <p className="text-lg text-gray-600">
              Thank you for trusting PandaCare.
            </p>
            <p className="text-lg text-gray-600 mt-2">
              Please share your experience by rating this doctor.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleGoToRating}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
            >
              Rate Doctor
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
