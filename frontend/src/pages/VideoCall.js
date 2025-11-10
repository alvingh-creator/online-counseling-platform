import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function VideoCall() {
  const { appointmentId } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      let response;
      if (user?.role === 'client') {
        response = await axios.get(`${API_URL}/appointments/my-appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.get(`${API_URL}/appointments/counselor-appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      const appt = response.data.data.find(a => a._id === appointmentId);
      if (appt) {
        setAuthorized(true);
        setAppointment(appt);
      } else {
        setAuthorized(false);
      }
    } catch (err) {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h2>
          <p className="text-gray-600 mb-6">You don't have access to this video call.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const roomName = `counseling-${appointmentId}`;
  const jitsiUrl = `https://meet.jitsi.net/${roomName}`;

  const joinVideoCall = () => {
    window.open(jitsiUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎥 Video Call</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-6">📹</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Join Video Call?</h2>
          
          {/* Appointment Details */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600 mb-1">Counselor</p>
                <p className="font-bold text-lg text-gray-800">
                  {appointment?.counselor?.name || 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Service Type</p>
                <p className="font-bold text-lg text-gray-800 capitalize">
                  {appointment?.serviceType?.replace('-', ' ') || 'General'}
                </p>
              </div>
            </div>
          </div>

          {/* Join Button */}
          <button
            onClick={joinVideoCall}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-12 py-4 rounded-lg text-xl font-bold shadow-lg transform hover:scale-105 transition mb-6"
          >
            🚀 Join Video Call Now
          </button>

          {/* Instructions */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 text-left">
            <p className="font-bold text-yellow-800 mb-2">📋 Instructions:</p>
            <ol className="text-sm text-yellow-900 space-y-1 list-decimal list-inside">
              <li>Click "Join Video Call Now" above</li>
              <li>A new tab will open with Jitsi Meet</li>
              <li>Click "Join meeting" in Jitsi</li>
              <li>Allow camera and microphone when prompted</li>
              <li>Your video will start automatically</li>
              <li>Share the room link with others to join</li>
            </ol>
          </div>

          {/* Alternative Options */}
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href={`/chat/${appointmentId}`}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold inline-block"
            >
              💬 Go to Chat Instead
            </a>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(jitsiUrl);
                alert('Video call link copied to clipboard!');
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              📋 Copy Video Call Link
            </button>
          </div>

          {/* Room Link Display */}
          <div className="mt-8 bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Video Call Room Link:</p>
            <code className="text-sm text-blue-600 break-all">{jitsiUrl}</code>
          </div>

          {/* Info */}
          <div className="mt-8 text-sm text-gray-600">
            <p>💡 <strong>Tip:</strong> Make sure your camera and microphone are working before joining.</p>
            <p className="mt-2">🔒 This is a private room. Only share the link with authorized participants.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
