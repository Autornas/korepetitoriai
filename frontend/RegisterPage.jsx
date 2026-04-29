'use client';

import { useState, useEffect } from "react";

const ROLES = { TEACHER: "teacher", STUDENT: "student" };

function InputField({ label, id, type = "text", value, onChange, error, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
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
        <p className="text-xs text-red-400 mt-0.5 animate-[fadeIn_0.2s_ease]">{error}</p>
      )}
    </div>
  );
}

function RoleToggle({ role, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-300">I am a</span>
      <div className="relative flex bg-slate-800/60 border border-slate-700 rounded-xl p-1">
        <span
          className={`
            absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-indigo-600
            transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${role === ROLES.STUDENT ? "left-[calc(50%+2px)]" : "left-1"}
          `}
        />
        {[ROLES.TEACHER, ROLES.STUDENT].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={`
              relative z-10 flex-1 py-2 text-sm font-semibold rounded-lg transition-colors duration-200
              ${role === r ? "text-white" : "text-slate-400 hover:text-slate-200"}
            `}
          >
            {r === ROLES.TEACHER ? "👩‍🏫 Teacher" : "🎓 Student"}
          </button>
        ))}
      </div>
    </div>
  );
}

function validate(fields) {
  const errors = {};
  if (!fields.name.trim()) errors.name = "Full name is required.";
  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Enter a valid email address.";
  }
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

export default function RegisterPage() {
  const [role, setRole] = useState(ROLES.STUDENT);
  const [fields, setFields] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([k]) => touched[k] || submitted)
  );

  const isValid = Object.keys(validate(fields)).length === 0;

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
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!isValid) return;
    alert(`Registered as ${role}!\nName: ${fields.name}\nEmail: ${fields.email}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        className="w-full max-w-md animate-[slideUp_0.4s_ease]"
        style={{ animation: "slideUp 0.4s ease both" }}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-900/40 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the learning community today</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <RoleToggle role={role} onChange={setRole} />

            <InputField
              label="Full Name"
              id="name"
              value={fields.name}
              onChange={handleChange("name")}
              error={visibleErrors.name}
              placeholder="Jane Smith"
              autoComplete="name"
            />
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
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <InputField
              label="Confirm Password"
              id="confirm"
              type="password"
              value={fields.confirm}
              onChange={handleChange("confirm")}
              error={visibleErrors.confirm}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />

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
              Create {role === ROLES.TEACHER ? "Teacher" : "Student"} Account
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150 underline underline-offset-2"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
