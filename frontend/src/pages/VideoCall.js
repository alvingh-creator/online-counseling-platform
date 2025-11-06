import { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function VideoCall() {
  const { appointmentId } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [callEnded, setCallEnded] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    checkAuthorizationAndFetch();
  }, []);

  useEffect(() => {
    if (!callEnded) {
      timerRef.current = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callEnded]);

  const checkAuthorizationAndFetch = async () => {
    try {
      setLoading(true);

      // First, get ALL appointments to find the one we need
      let response;
      if (user?.role === 'client') {
        response = await axios.get(
          `${API_URL}/appointments/my-appointments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (user?.role === 'counselor') {
        response = await axios.get(
          `${API_URL}/appointments/counselor-appointments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const appt = response.data.data.find(a => a._id === appointmentId);

      if (!appt) {
        console.error('Appointment not found');
        setAuthorized(false);
        return;
      }

      // Check if user is part of this appointment
      const isClient = appt.client === user?.id || appt.client?._id === user?.id;
      const isCounselor = appt.counselor === user?.id || appt.counselor?._id === user?.id;

      if (isClient || isCounselor) {
        setAuthorized(true);
        setAppointment(appt);
        initializeMedia();
      } else {
        setAuthorized(false);
      }
    } catch (err) {
      console.error('Authorization check error:', err);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Please allow camera and microphone access to join the call');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setCallEnded(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <div className="text-2xl font-bold text-blue-600">Initializing video call...</div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h2>
          <p className="text-gray-600 mb-6">You are not authorized to join this video call. Make sure you are the client or counselor for this appointment.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (callEnded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">📞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Call Ended</h2>
          <p className="text-gray-600 mb-2">Call Duration: {formatTime(callTime)}</p>
          <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🎥 Video Call</h1>
            <p className="text-sm text-gray-400">Duration: {formatTime(callTime)}</p>
          </div>
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transform hover:scale-105 transition"
          >
            End Call
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Local Video */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm font-semibold">
              You (Your Video)
            </div>
          </div>

          {/* Remote Video Placeholder */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video shadow-2xl flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-lg">
                {appointment?.counselor?.name 
                  ? `${appointment.counselor.name}'s video` 
                  : "Waiting for other participant..."}
              </p>
              <p className="text-sm mt-2 text-gray-500">
                (In production, you'd see their video here via WebRTC)
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 rounded-lg p-6 shadow-2xl">
          <div className="flex justify-center gap-4 flex-wrap mb-6">
            {/* Microphone Toggle */}
            <button
              onClick={toggleAudio}
              className={`px-6 py-3 rounded-lg font-semibold transform hover:scale-105 transition ${
                audioEnabled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {audioEnabled ? '🎤 Microphone On' : '🔇 Microphone Off'}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={toggleVideo}
              className={`px-6 py-3 rounded-lg font-semibold transform hover:scale-105 transition ${
                videoEnabled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {videoEnabled ? '📹 Camera On' : '📹 Camera Off'}
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              className="px-6 py-3 rounded-lg font-semibold transform hover:scale-105 transition bg-red-600 hover:bg-red-700 text-white"
            >
              ☎️ End Call
            </button>

            {/* Chat Link */}
            <a
              href={`/chat/${appointmentId}`}
              className="px-6 py-3 rounded-lg font-semibold transform hover:scale-105 transition bg-green-600 hover:bg-green-700 text-white text-center"
            >
              💬 Chat
            </a>
          </div>

          {/* Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Participant</p>
              <p className="font-bold text-lg">
                {appointment?.counselor?.name ? appointment.counselor.name : 'Loading...'}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Service Type</p>
              <p className="font-bold text-lg capitalize">
                {appointment?.serviceType ? appointment.serviceType.replace('-', ' ') : 'Loading...'}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Appointment Time</p>
              <p className="font-bold text-lg">
                {appointment?.appointmentTime || 'Loading...'}
              </p>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 bg-blue-900 border border-blue-500 text-blue-200 p-4 rounded-lg text-sm">
            <p className="font-semibold mb-1">💡 About This Video Call:</p>
            <p>This is a test video interface. In production, you can integrate Jitsi Meet, Twilio, or your own WebRTC setup for peer-to-peer video calling.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
