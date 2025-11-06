import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">💚 CounselHub</h1>
          <div className="space-x-4">
            <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Login
            </Link>
            <Link to="/register" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">
          Professional Counseling Services
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Connect with licensed counselors for mental health, relationships, and career guidance
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Expert Counselors</h3>
            <p className="text-gray-600">Licensed professionals with years of experience</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Secure & Private</h3>
            <p className="text-gray-600">Your data is encrypted and completely confidential</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Flexible Scheduling</h3>
            <p className="text-gray-600">Book appointments at times that work for you</p>
          </div>
        </div>

        <Link 
          to="/register" 
          className="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition mt-12"
        >
          Get Started Now
        </Link>
      </div>
    </div>
  );
}
