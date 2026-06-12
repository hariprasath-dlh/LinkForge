import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthShell } from "../components/AuthShell";
import { FormField } from "../components/FormField";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { validatePassword, getPasswordStrength, getPasswordStrengthLabel } from "../utils/validatePassword";
import OTPInput from "../components/OTPInput";
import { registerUser, verifySignupOTP, resendOTP } from "../api/auth.api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — LinkForge" },
      { name: "description", content: "Create your free LinkForge account and start crafting smart short links with analytics." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // OTP state
  const [showOTPScreen, setShowOTPScreen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => { if (isAuthenticated) navigate({ to: "/dashboard" }); }, [isAuthenticated, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    
    const passwordError = validatePassword(form.password);
    if (passwordError) e.password = passwordError;
    
    if (form.confirm !== form.password) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = await registerUser({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      });
      if (data.pendingVerification) {
        setPendingEmail(data.email || form.email);
        setShowOTPScreen(true);
        setResendCooldown(30);
        toast.success("OTP sent to your email");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not create account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    try {
      setOtpLoading(true);
      setOtpError('');
      const data = await verifySignupOTP({
        email: pendingEmail,
        otp,
      });
      if (data.success && data.token && data.user) {
        // Persist auth directly to localStorage (bypass AuthContext to avoid modifying it)
        localStorage.setItem(
          "linkforge_auth",
          JSON.stringify({ user: data.user, token: data.token })
        );
        toast.success("Email verified! Welcome to LinkForge!");
        // Force reload to pick up new auth state from localStorage
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      const message =
        error.message || 'Invalid OTP. Please try again.';
      setOtpError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    try {
      setResendLoading(true);
      await resendOTP({ email: pendingEmail, type: 'signup' });
      setResendCooldown(30);
      setOtpError('');
      toast.success("New OTP sent to your email");
    } catch (error: any) {
      const message =
        error.message || 'Failed to resend OTP.';
      setOtpError(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthShell title={showOTPScreen ? "Verify Your Email" : "Forge your account"} subtitle={showOTPScreen ? "Enter the verification code sent to your email" : "Free forever. No credit card required."}>
      {showOTPScreen ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          {/* Email icon */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '2px solid rgba(245, 158, 11, 0.3)',
          }}>
            <span style={{ fontSize: '32px' }}>📧</span>
          </div>

          {/* Info text */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              We sent a 6-digit verification code to
            </p>
            <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '14px', marginTop: '4px' }}>
              {pendingEmail}
            </p>
          </div>

          {/* OTP Input */}
          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            disabled={otpLoading}
            error={otpError}
          />

          {/* Loading state */}
          {otpLoading && (
            <p style={{ color: 'var(--accent-primary)', fontSize: '14px' }}>
              <LoadingSpinner size={14} /> Verifying your code...
            </p>
          )}

          {/* Resend OTP */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
              Did not receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || resendLoading}
              style={{
                background: 'none', border: 'none', cursor: resendCooldown > 0 || resendLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                color: resendCooldown > 0 || resendLoading ? 'var(--text-muted)' : 'var(--accent-primary)',
                transition: 'color 150ms ease',
              }}
            >
              {resendLoading
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : 'Resend OTP'}
            </button>
          </div>

          {/* Back to form */}
          <button
            type="button"
            onClick={() => setShowOTPScreen(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '12px',
              fontFamily: 'var(--font-sans)',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ← Back to signup form
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField label="Full name" placeholder="Ada Lovelace" value={form.name} onChange={set("name")} onBlur={validate} error={errors.name} />
          <FormField label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} onBlur={validate} error={errors.email} />
          <FormField label="Password" type="password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} onBlur={validate} error={errors.password} />
          {form.password && (
            <div className="mt-2 space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Password strength:</span>
                <span
                  className={`text-xs font-semibold ${
                    getPasswordStrengthLabel(form.password).color === 'red'
                      ? 'text-red-500'
                      : getPasswordStrengthLabel(form.password).color === 'orange'
                      ? 'text-amber-500'
                      : 'text-green-500'
                  }`}
                >
                  {getPasswordStrengthLabel(form.password).label}
                </span>
              </div>
              <ul className="space-y-0.5">
                {[
                  { key: 'minLength' as const, text: 'At least 8 characters' },
                  { key: 'hasUppercase' as const, text: 'At least one uppercase letter' },
                  { key: 'hasNumber' as const, text: 'At least one number' },
                  { key: 'hasSpecialChar' as const, text: 'At least one special character' },
                ].map((rule) => (
                  <li
                    key={rule.key}
                    className={`flex items-center gap-1.5 text-xs ${
                      getPasswordStrength(form.password)[rule.key]
                        ? 'text-green-500'
                        : 'text-slate-500'
                    }`}
                  >
                    <span>{getPasswordStrength(form.password)[rule.key] ? '✓' : '○'}</span>
                    <span>{rule.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <FormField label="Confirm password" type="password" placeholder="Repeat your password" value={form.confirm} onChange={set("confirm")} onBlur={validate} error={errors.confirm} />
          <button type="submit" disabled={submitting} className="forge-btn-primary w-full py-3 mt-2">
            {submitting ? (<><LoadingSpinner size={14} /> Creating account...</>) : "Create Account"}
          </button>
          <p className="text-center text-sm text-forge-muted">
            Already have an account?{" "}
            <Link to="/login" className="forge-amber-text hover:underline">Login</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
