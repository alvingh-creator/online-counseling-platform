import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Availability() {
  const { user, token } = useContext(AuthContext);
  const [schedule, setSchedule] = useState(
    DAYS.map((day, index) => ({
      dayOfWeek: index,
      startTime: '09:00',
      endTime: '17:00',
      isWorking: true
    }))
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.role !== 'counselor') return;
    fetchAvailability();
  }, [user]);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/appointments/availability/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.data) {
        setSchedule(response.data.data.schedule);
      }
    } catch (err) {
      console.log('No availability set yet, using defaults');
    }
  };

  const handleScheduleChange = (dayIndex, field, value) => {
    const updated = [...schedule];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setSchedule(updated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/appointments/availability/update`,
        { schedule, exceptions: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error saving availability: ' + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'counselor') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-red-600">Only counselors can manage availability</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-2xl shadow-lg mb-8">
          <h1 className="text-4xl font-bold mb-2">📅 My Availability</h1>
          <p className="text-green-100">Set your working hours for each day of the week</p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
            ✓ Availability saved successfully!
          </div>
        )}

        {/* Schedule Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Day</th>
                  <th className="px-6 py-4 text-left font-bold">Working</th>
                  <th className="px-6 py-4 text-left font-bold">Start Time</th>
                  <th className="px-6 py-4 text-left font-bold">End Time</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((day, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-800">{DAYS[day.dayOfWeek]}</td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={day.isWorking}
                        onChange={(e) => handleScheduleChange(index, 'isWorking', e.target.checked)}
                        className="w-5 h-5 text-green-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        disabled={!day.isWorking}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        disabled={!day.isWorking}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Saving...' : '💾 Save Availability'}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-2">💡 How it works</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Check the box to mark days you're available</li>
            <li>✓ Set your start and end times for each working day</li>
            <li>✓ Clients can only book appointments during your working hours</li>
            <li>✓ Save your schedule - it will be used for all future bookings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
