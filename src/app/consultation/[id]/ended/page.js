'use client';

import { useRouter, useParams } from 'next/navigation';

export default function ConsultationEndedPage() {
  const router = useRouter();
  const { id } = useParams();

  const handleGoToRating = () => {
    router.push(`/rating/form?consultationId=${id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Consultation Ended</h1>
      <p className="mb-6 text-center max-w-md">
        Thank you for trusting PandaCare.<br />
        Give your rating and review to this doctor in this consultation.
      </p>
      <button
        onClick={handleGoToRating}
        className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
      >
        Rate Doctor
      </button>
    </div>
  );
}
