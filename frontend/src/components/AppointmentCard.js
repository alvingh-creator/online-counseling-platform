import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function AppointmentCard({ appointment, userRole, token, onUpdate }) {
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState(appointment.counselorNotes || '');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-gradient-to-r from-green-400 to-green-600';
      case 'pending': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'completed': return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 'rejected': return 'bg-gradient-to-r from-red-400 to-red-600';
      case 'cancelled': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏳';
      case 'completed': return '✓✓';
      case 'rejected': return '✕';
      case 'cancelled': return '✕';
      default: return '•';
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/appointments/confirm/${appointment._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate?.();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Failed to confirm'));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this appointment?')) return;
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/appointments/reject/${appointment._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate?.();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Failed to reject'));
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/appointments/complete/${appointment._id}`,
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowNotesModal(false);
      onUpdate?.();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Failed to complete'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(
        `${API_URL}/appointments/upload-attachment/${appointment._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      setFile(null);
      onUpdate?.();
      alert('File uploaded successfully!');
    } catch (err) {
      alert('Error uploading file: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
        {/* Header with Status */}
        <div className={`${getStatusColor(appointment.status)} p-6 text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {userRole === 'client' 
                  ? appointment.counselor?.name 
                  : appointment.client?.name}
              </h3>
              <p className="text-sm opacity-90">
                {userRole === 'client' 
                  ? appointment.counselor?.specialization
                  : appointment.client?.email}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-1">{getStatusIcon(appointment.status)}</div>
              <span className="text-xs font-bold uppercase tracking-wider bg-black bg-opacity-20 px-3 py-1 rounded-full">
                {appointment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">📅 Date</p>
              <p className="text-lg font-bold text-gray-800">
                {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">🕐 Time</p>
              <p className="text-lg font-bold text-gray-800">
                {appointment.appointmentTime}
              </p>
            </div>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">💼 Service</p>
              <p className="text-sm font-bold text-gray-800 capitalize">
                {appointment.serviceType?.replace('-', ' ')}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">📱 Type</p>
              <p className="text-sm font-bold text-gray-800 capitalize">
                {appointment.sessionType}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-4">
            <p className="text-xs text-gray-600 font-semibold">💰 Amount</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
              ₹{appointment.amount}
            </p>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
              <p className="text-xs text-gray-600 font-semibold mb-1">📝 Your Notes</p>
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          )}

          {/* Counselor Notes */}
          {appointment.counselorNotes && (
            <div className="bg-purple-50 p-4 rounded-lg mb-4 border-l-4 border-purple-500">
              <p className="text-xs text-gray-600 font-semibold mb-1">📋 Session Notes</p>
              <p className="text-sm text-gray-700">{appointment.counselorNotes}</p>
            </div>
          )}

          {/* Attachments */}
          {appointment.attachments && appointment.attachments.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg mb-4 border-l-4 border-orange-500">
              <p className="text-xs text-gray-600 font-semibold mb-2">📎 Attachments</p>
              <div className="space-y-2">
                {appointment.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={`http://localhost:5000${att.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-600 hover:text-orange-800 underline block"
                  >
                    📄 {att.fileName}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 flex-wrap">
          {userRole === 'client' ? (
            <>
              {appointment.status === 'confirmed' && (
                <a
                  href={`/video/${appointment._id}`}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 text-center"
                >
                  🎥 Join Video
                </a>
              )}
              <a
                href={`/chat/${appointment._id}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 text-center"
              >
                💬 Chat
              </a>
              {appointment.status !== 'cancelled' && appointment.status !== 'rejected' && (
                <button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105"
                  disabled
                >
                  ✕ Cancel
                </button>
              )}
            </>
          ) : (
            <>
              {appointment.status === 'pending' && (
                <>
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50"
                  >
                    ✕ Reject
                  </button>
                </>
              )}
              {appointment.status === 'confirmed' && (
                <>
                  <a
                    href={`/video/${appointment._id}`}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 text-center"
                  >
                    🎥 Join Video
                  </a>
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105"
                  >
                    ✓ Mark Complete
                  </button>
                </>
              )}
              <a
                href={`/chat/${appointment._id}`}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 text-center"
              >
                💬 Chat
              </a>
            </>
          )}
        </div>
      </div>

      {/* Notes & Upload Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Session Notes & Attachments</h2>
            
            {/* Notes Textarea */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your session notes here..."
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />

            {/* File Upload */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-2">PDF, DOC, TXT, JPG, PNG (Max 5MB)</p>
              
              {file && (
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : '📤 Upload File'}
                </button>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                Save & Complete
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
