import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthShell } from "../components/AuthShell";
import { FormField } from "../components/FormField";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import OTPInput from "../components/OTPInput";
import { loginUser, verifyLoginOTP, resendOTP } from "../api/auth.api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — LinkForge" },
      { name: "description", content: "Sign in to your LinkForge account to manage your short links and analytics." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = await loginUser({ email, password });
      if (data.pendingVerification) {
        setPendingEmail(data.email || email);
        setShowOTPScreen(true);
        setResendCooldown(30);
        toast.success("OTP sent to your email");
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    try {
      setOtpLoading(true);
      setOtpError('');
      const data = await verifyLoginOTP({
        email: pendingEmail,
        otp,
      });
      if (data.success && data.token && data.user) {
        // Persist auth directly to localStorage (bypass AuthContext to avoid modifying it)
        localStorage.setItem(
          "linkforge_auth",
          JSON.stringify({ user: data.user, token: data.token })
        );
        toast.success("Welcome back!");
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
      await resendOTP({ email: pendingEmail, type: 'login' });
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
    <AuthShell title={showOTPScreen ? "Verify Your Login" : "Sign in to the forge"} subtitle={showOTPScreen ? "Enter the verification code sent to your email" : "Welcome back. Let's get back to work."}>
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
              We sent a 6-digit login verification code to
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
            ← Back to login form
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <FormField
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={validate}
            error={errors.email}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={validate}
            error={errors.password}
          />
          <button type="submit" disabled={submitting} className="forge-btn-primary w-full py-3 mt-2">
            {submitting ? (<><LoadingSpinner size={14} /> Signing in...</>) : "Sign In"}
          </button>
          <p className="text-center text-sm text-forge-muted">
            Don't have an account?{" "}
            <Link to="/signup" className="forge-amber-text hover:underline">Sign Up</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
