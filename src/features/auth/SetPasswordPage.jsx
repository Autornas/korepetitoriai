'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { setPassword } from '@/lib/api/auth';
import { useAuth } from '@/components/AuthProvider';

function InputField({ label, id, value, onChange, error, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-[#5A4A38]">{label}</label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`
          w-full px-4 py-3 rounded-xl bg-[#F4ECDF]/60 border text-[#2A1F14] placeholder-[#8A7556]
          outline-none transition-all duration-200 text-sm hover:border-[#DCC9A8]
          ${focused ? "border-[#C8654A] shadow-[0_0_0_3px_rgba(200,101,74,0.18)]" : "border-[#DCC9A8]"}
          ${error ? "border-[#B85A4F] shadow-[0_0_0_3px_rgba(184,90,79,0.18)]" : ""}
        `}
      />
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  );
}

function validate(fields) {
  const errors = {};
  if (!fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (!fields.confirm) {
    errors.confirm = "Please confirm your password.";
  } else if (fields.password !== fields.confirm) {
    errors.confirm = "Passwords do not match.";
  }
  return errors;
}

export default function SetPasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // No session (expired/used invite link) — nothing to set a password on.
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const [fields, setFields] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = Object.keys(validate(fields)).length === 0;
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([k]) => touched[k] || submitted)
  );

  useEffect(() => { setErrors(validate(fields)); }, [fields]);

  const handleChange = (field) => (e) => {
    setFields(prev => ({ ...prev, [field]: e.target.value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ password: true, confirm: true });
    if (!isValid) return;
    setLoading(true);
    setFormError("");
    try {
      await setPassword({ password: fields.password });
      router.replace('/dashboard');
    } catch (err) {
      setFormError(err?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[#C8654A] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ animation: "slideUp 0.4s ease both" }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C8654A] shadow-lg shadow-[#B0533A]/30 mb-4">
            <svg className="w-7 h-7 text-[#2A1F14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#2A1F14] tracking-tight">Welcome, {user.user_metadata?.full_name || user.email}</h1>
          <p className="text-[#5A4A38] text-sm mt-1">Set a password to finish creating your account</p>
        </div>

        <div className="bg-[#FFFDF8]/80 backdrop-blur border border-[#EADFCB] rounded-2xl shadow-2xl shadow-black/40 p-8">
          {formError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-[#F4D9D5] border border-[#E0A89F] text-red-400 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <InputField
              label="Password" id="password"
              value={fields.password} onChange={handleChange("password")}
              error={visibleErrors.password} placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <InputField
              label="Confirm Password" id="confirm"
              value={fields.confirm} onChange={handleChange("confirm")}
              error={visibleErrors.confirm} placeholder="Repeat your password"
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading}
              className={`mt-1 w-full py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all duration-200
                ${loading
                  ? 'bg-[#C8654A] opacity-60 cursor-not-allowed'
                  : 'bg-[#C8654A] hover:bg-[#B0533A] active:scale-[0.98] shadow-lg shadow-[#B0533A]/25 cursor-pointer'
                }`}
            >
              {loading ? 'Saving…' : 'Set Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
