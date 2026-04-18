import React, { useState, useEffect } from 'react';
import { getUsers, saveUser } from "./data";

const SignupForm = ({ onLogin, accessLevel, setAccessLevel, styles }) => {
  const inputGroup = "w-full bg-[#060812]/50 border border-gray-800 p-4 rounded-2xl mb-4";
  const labelStyle = "text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1";
  const inputStyle = "w-full bg-transparent text-sm text-gray-200 focus:outline-none placeholder-gray-600";

  const [signupMethod, setSignupMethod] = useState('email'); // 'email' | 'phone'
  const [fullName, setFullName]     = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [otp, setOtp]               = useState('');
  const [otpSent, setOtpSent]       = useState(false);
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Restore remembered credentials on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vrentaluk_remember'));
      if (saved?.email) { setEmail(saved.email); setRememberMe(true); }
      if (saved?.phone) { setPhone(saved.phone); setSignupMethod('phone'); setRememberMe(true); }
    } catch {}
  }, []);

  const handleCreate = () => {
    // Basic validation
    if (!fullName.trim()) { alert("Please enter your full name."); return; }
    if (signupMethod === 'email') {
      if (!email.trim()) { alert("Please enter your email address."); return; }
      if (!password.trim()) { alert("Please enter a password."); return; }
      // Check email not already registered
      const existing = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) { alert("An account with this email already exists. Please log in."); return; }
    }

    if (rememberMe) {
      localStorage.setItem('vrentaluk_remember', JSON.stringify(
        signupMethod === 'email' ? { email } : { phone }
      ));
    } else {
      localStorage.removeItem('vrentaluk_remember');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: fullName || 'User',
      email: signupMethod === 'email' ? email : '',
      phone: signupMethod === 'phone' ? phone : '',
      password: password,
      role: accessLevel,
    };

    // Only save user-role accounts (admin/owner go through approval flow)
    if (accessLevel === 'user') {
      saveUser(newUser);
    }

    onLogin(newUser);
  };

  const handleSendOtp = () => {
    if (phone.trim().length >= 10) setOtpSent(true);
  };

  return (
    <div className="w-full animate-in fade-in zoom-in duration-300">

      {/* ── Signup Method Toggle ──────────────────────────── */}
      <div className="flex gap-2 mb-5 bg-[#060812] border border-gray-800 rounded-xl p-1">
        <button
          type="button"
          onClick={() => { setSignupMethod('email'); setOtpSent(false); }}
          className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-200
            ${signupMethod === 'email'
              ? 'bg-[#FCB31E] text-white shadow-md'
              : 'text-gray-500 hover:text-gray-300'}`}
        >
          📧 Email
        </button>
        <button
          type="button"
          onClick={() => { setSignupMethod('phone'); setOtpSent(false); }}
          className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-200
            ${signupMethod === 'phone'
              ? 'bg-[#FCB31E] text-white shadow-md'
              : 'text-gray-500 hover:text-gray-300'}`}
        >
          📱 Phone
        </button>
      </div>

      {/* ── Full Name (always shown) ──────────────────────── */}
      <div className={inputGroup}>
        <label className={labelStyle}>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Enter your full name"
          className={inputStyle}
        />
      </div>

      {/* ── Email Signup ──────────────────────────────────── */}
      {signupMethod === 'email' && (
        <>
          <div className={inputGroup}>
            <label className={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={inputStyle}
            />
          </div>
          <div className={inputGroup}>
            <label className={labelStyle}>Password</label>
            <div className="flex items-center gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className={`${inputStyle} flex-1`}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0">
                {showPassword
                  ? <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/></svg>
                  : <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Phone Signup ──────────────────────────────────── */}
      {signupMethod === 'phone' && (
        <>
          <div className={inputGroup}>
            <label className={labelStyle}>Phone Number</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-semibold text-sm">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none placeholder-gray-600"
              />
            </div>
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full bg-[#1e2535] hover:bg-[#2a3347] text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-[11px] mb-4 transition-all duration-200"
            >
              Send OTP
            </button>
          ) : (
            <div className={inputGroup}>
              <label className={labelStyle}>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                className={`${inputStyle} tracking-[0.5em]`}
              />
            </div>
          )}
        </>
      )}

      {/* ── Role Selector ─────────────────────────────────── */}
      <div className="mt-8 mb-8">
        <div className="flex gap-3">
          {['user', 'admin', 'owner'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setAccessLevel(role)}
              className={`${styles.accessBtnBase} ${accessLevel === role ? styles.activeAccess : styles.inactiveAccess}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* ── Remember Me ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0
              ${rememberMe
                ? 'bg-[#FCB31E] border-[#FCB31E] shadow-[0_0_10px_rgba(252,179,30,0.4)]'
                : 'bg-transparent border-gray-600 group-hover:border-gray-400'}`}
          >
            {rememberMe && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-[12px] font-medium text-gray-400 select-none">Remember me</span>
        </label>
        <span className="text-[11px] text-gray-600">Already have an account?</span>
      </div>

      {/* ── Create Account Button ─────────────────────────── */}
      <button
        onClick={handleCreate}
        type="button"
        disabled={signupMethod === 'phone' && !otpSent}
        className="w-full bg-[#FCB31E] hover:bg-[#ffb92d] text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[13px] transition-all duration-200 shadow-[0_8px_24px_rgba(252,179,30,0.3)] hover:shadow-[0_12px_32px_rgba(252,179,30,0.45)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Create Account
      </button>
    </div>
  );
};

export default SignupForm;