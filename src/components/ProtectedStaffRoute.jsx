import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedStaffRoute({ children }) {
  const { user, isStaff, loading, configured } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="mx-auto min-h-[45vh] max-w-6xl px-4 py-16 text-center text-ink-200/80" role="status">Checking staff access…</div>;
  }
  if (!configured || !user) return <Navigate to="/staff/login" state={{ from: location.pathname }} replace />;
  if (!isStaff) {
    return (
      <div className="mx-auto min-h-[45vh] max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink-100">Access not approved</h1>
        <p className="mt-4 text-ink-200/80">This account is signed in but is not on the approved staff list. Please contact the site owner.</p>
      </div>
    );
  }
  return children;
}
