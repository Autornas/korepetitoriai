'use client';

import { useState, useEffect } from "react";

function InputField({ label, id, type = "text", value, onChange, error, placeholder, autoComplete, children }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        {children}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`
          w-full px-4 py-3 rounded-xl bg-slate-800/60 border text-slate-100 placeholder-slate-500
          outline-none transition-all duration-200 text-sm
          ${focused ? "border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]" : "border-slate-700"}
          ${error ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}
          hover:border-slate-500
        `}
      />
      {error && (
        <p className="text-xs text-red-400 mt-0.5" style={{ animation: "fadeIn 0.2s ease" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function validate(fields) {
  const errors = {};
  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!fields.password) {
    errors.password = "Password is required.";
  }
  return errors;
}

export default function LoginPage() {
  const [fields, setFields] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const isValid = Object.keys(validate(fields)).length === 0;

  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([k]) => touched[k] || submitted)
  );

  useEffect(() => {
    setErrors(validate(fields));
  }, [fields]);

  const handleChange = (field) => (e) => {
    setFields((prev) => ({ ...prev, [field]: e.target.value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ email: true, password: true });
    if (!isValid) return;
    alert(`Logged in as: ${fields.email}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ animation: "slideUp 0.4s ease both" }} className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-900/40 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Role hint */}
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 mb-6">
          <div className="flex gap-2 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
              Teachers
            </span>
            <span className="text-slate-700">&</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
              Students
            </span>
          </div>
          <span className="text-slate-500 text-xs ml-auto">use the same login</span>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <InputField
              label="Email Address"
              id="email"
              type="email"
              value={fields.email}
              onChange={handleChange("email")}
              error={visibleErrors.email}
              placeholder="jane@example.com"
              autoComplete="email"
            />

            <InputField
              label="Password"
              id="password"
              type="password"
              value={fields.password}
              onChange={handleChange("password")}
              error={visibleErrors.password}
              placeholder="Enter your password"
              autoComplete="current-password"
            >
              <a
                href="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
              >
                Forgot password?
              </a>
            </InputField>

            <button
              type="submit"
              disabled={submitted && !isValid}
              className={`
                mt-1 w-full py-3 px-6 rounded-xl font-semibold text-sm text-white
                transition-all duration-200
                ${isValid
                  ? "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-900/30 hover:shadow-indigo-800/40 cursor-pointer"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-60"
                }
              `}
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150 underline underline-offset-2"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
