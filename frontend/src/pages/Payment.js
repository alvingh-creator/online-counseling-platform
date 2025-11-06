import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function Payment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [amount, setAmount] = useState(500); // Default ₹500

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    try {
      setError('');
      setLoading(true);

      // Step 1: Create order on backend
      const orderResponse = await axios.post(
        `${API_URL}/payments/create-order`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order, paymentId } = orderResponse.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: order.key_id, // Razorpay Key ID
        amount: order.amount, // Amount in paise
        currency: order.currency,
        name: 'CounselHub',
        description: 'Counseling Session Payment',
        order_id: order.id, // Order ID from backend
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            const verifyResponse = await axios.post(
              `${API_URL}/payments/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              setPaymentSuccess(true);
              setTimeout(() => {
                navigate('/dashboard');
              }, 3000);
            }
          } catch (err) {
            setError('Payment verification failed: ' + err.response?.data?.message);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: '9999999999' // User can fill this
        },
        theme: {
          color: '#3B82F6' // Blue color
        },
        modal: {
          ondismiss: function () {
            setError('Payment cancelled by user');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment order');
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-4">✓ Payment Successful!</h1>
          <p className="text-gray-600 text-lg mb-6">Your appointment has been confirmed.</p>
          <p className="text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">💳 Payment</h1>

          {/* Order Summary */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Session Duration:</strong> 1 Hour
              </p>
              <p className="text-gray-700">
                <strong>Rate:</strong> ₹{amount}/hour
              </p>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <p className="text-xl font-bold text-blue-600">
                  Total: ₹{amount}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Payment Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Accepted Payment Methods:</strong>
            </p>
            <div className="flex space-x-2 text-2xl">
              <span title="Credit Card">💳</span>
              <span title="Debit Card">🏧</span>
              <span title="UPI">📱</span>
              <span title="Net Banking">🏦</span>
              <span title="Wallets">👛</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400 mb-4"
          >
            {loading ? 'Processing...' : `Pay ₹${amount}`}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
          >
            Cancel
          </button>

          <p className="text-center text-gray-500 text-xs mt-6">
            🔒 Powered by Razorpay - Secure Payment Gateway
          </p>
        </div>
      </div>
    </div>
  );
}
