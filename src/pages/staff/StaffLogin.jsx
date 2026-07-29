import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { safeStaffRedirect } from '../../lib/navigation.js';
import { readableAuthError, supabase } from '../../lib/supabase.js';

export default function StaffLogin() {
  const { user, isStaff, loading, configured } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ pending: false, error: '' });
  const navigate = useNavigate();
  const location = useLocation();

  if (!loading && user && isStaff) return <Navigate to="/staff/articles" replace />;

  async function submit(event) {
    event.preventDefault();
    if (status.pending || !supabase) return;
    setStatus({ pending: true, error: '' });
    const { error } = await supabase.auth.signInWithPassword(form);
    if (error) setStatus({ pending: false, error: readableAuthError(error) });
    else navigate(safeStaffRedirect(location.state?.from), { replace: true });
  }

  return (
    <>
      <Seo title="Staff Login" description="Secure staff access for FederalCorporation news publishing." />
      <div className="px-4 py-14 sm:px-6 sm:py-20">
        <form onSubmit={submit} className="mx-auto max-w-md rounded-3xl border border-navy-900/15 bg-white/45 p-6 shadow-soft backdrop-blur-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon-900">Staff access</p>
          <h1 className="mt-3 font-serif text-3xl text-ink-100">News publishing</h1>
          <p className="mt-3 text-sm leading-6 text-ink-200/80">Sign in with the staff account provided by the site owner. New accounts cannot be created here.</p>
          {!configured ? <p className="mt-5 rounded-xl border border-maroon-900/20 bg-maroon-900/5 p-4 text-sm text-maroon-900" role="alert">Staff publishing has not been connected yet.</p> : null}
          <label className="mt-6 block">
            <span className="text-sm font-semibold text-ink-100">Email</span>
            <input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-control" />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-ink-100">Password</span>
            <input type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="form-control" />
          </label>
          {status.error ? <p className="mt-4 text-sm text-red-700" role="alert">{status.error}</p> : null}
          <button disabled={!configured || status.pending} className="primary-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50">{status.pending ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </>
  );
}
