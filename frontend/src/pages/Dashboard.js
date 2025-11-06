import { useContext } from 'react';
import ClientDashboard from './ClientDashboard';
import CounselorDashboard from './CounselorDashboard';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  // Show client dashboard if user is a client
  if (user?.role === 'client') {
    return <ClientDashboard />;
  }

  // Show counselor dashboard if user is a counselor
  if (user?.role === 'counselor') {
    return <CounselorDashboard />;
  }

  // Fallback (shouldn't happen if auth is working)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-2xl font-bold text-red-600">Invalid User Role</div>
    </div>
  );
}
