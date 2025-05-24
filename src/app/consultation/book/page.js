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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const consultationPayload = {
      doctorId: Number(doctorId),
      scheduledAt: scheduledAt.toISOString(),
      meetingUrl,
      note,
    };

    try {
      const response = await api.createConsultation(consultationPayload);
      if (response.ok) {
        const data = await response.json();  // Ambil response JSON yang berisi data konsultasi baru
        const consultationId = data.id;      // Ambil ID konsultasi baru
        router.push(`/consultation/${consultationId}`);  // Redirect dengan ID yang benar
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to create consultation');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting consultation');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">Book a Consultation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Time Picker */}
        <div>
          <label className="block mb-1 font-medium">Choose Date & Time</label>
          <DatePicker
            selected={scheduledAt}
            onChange={(date) => setScheduledAt(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* Meeting URL */}
        <div>
          <label className="block mb-1 font-medium">Meeting URL</label>
          <input
            type="url"
            required
            className="w-full border border-gray-300 rounded p-2"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://meet.example.com"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block mb-1 font-medium">Note</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2"
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tulis catatan konsultasi..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Book Consultation
        </button>
      </form>
    </div>
  );
}
