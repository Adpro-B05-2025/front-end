'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/utils/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ConsultationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const doctorId = searchParams.get('id');
  const [scheduledAt, setScheduledAt] = useState(new Date());
  const [meetingUrl, setMeetingUrl] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const consultationPayload = {
      doctorId: Number(doctorId),
      scheduledAt: scheduledAt.toISOString(),
      meetingUrl,
      note,
    };

    try {
      const response = await api.createConsultation(consultationPayload);
      if (response.ok) {
        const data = await response.json();
        const consultationId = data.id;
        router.push(`/consultation/${consultationId}`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to create consultation');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <h1 className="text-2xl font-bold text-white">Book a Consultation</h1>
            <p className="mt-2 text-blue-100">
              Schedule your appointment with the doctor
            </p>
          </div>

          {/* Consultation Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date & Time Picker */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Appointment Details
                </h3>
                <div className="mt-4">
                  <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">
                    Date & Time
                  </label>
                  <DatePicker
                    id="dateTime"
                    selected={scheduledAt}
                    onChange={(date) => setScheduledAt(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    minDate={new Date()}
                  />
                </div>
              </div>

              {/* Meeting URL */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Meeting Information
                </h3>
                <div className="mt-4">
                  <label htmlFor="meetingUrl" className="block text-sm font-medium text-gray-700">
                    Meeting URL
                  </label>
                  <input
                    type="url"
                    id="meetingUrl"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.example.com/your-room"
                  />
                </div>
              </div>

              {/* Consultation Notes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Additional Information
                </h3>
                <div className="mt-4">
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                    Consultation Notes
                  </label>
                  <textarea
                    id="note"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Please describe your symptoms or concerns..."
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Booking...
                    </span>
                  ) : (
                    'Book Consultation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}