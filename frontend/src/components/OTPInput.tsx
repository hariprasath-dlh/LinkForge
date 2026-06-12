import React, { useRef, useState, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChange?: (otp: string) => void;
  disabled?: boolean;
  error?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange?.(otpString);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (otpString.length === length && !newOtp.includes('')) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);

    if (pastedData.length === 0) return;

    const newOtp = new Array(length).fill('');
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    onChange?.(newOtp.join(''));

    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === length) {
      onComplete(pastedData);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            style={{
              width: '48px',
              height: '56px',
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 700,
              borderRadius: '8px',
              border: `2px solid ${
                error
                  ? 'var(--error)'
                  : digit
                  ? 'var(--accent-primary)'
                  : 'var(--border-secondary)'
              }`,
              outline: 'none',
              transition: 'all 150ms ease',
              fontFamily: 'var(--font-mono)',
              background: disabled
                ? 'var(--bg-tertiary)'
                : digit
                ? 'rgba(245, 158, 11, 0.1)'
                : 'var(--bg-tertiary)',
              color: disabled
                ? 'var(--text-muted)'
                : digit
                ? 'var(--accent-primary)'
                : 'var(--text-primary)',
              cursor: disabled ? 'not-allowed' : 'text',
              boxShadow: error
                ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
                : undefined,
            }}
            onFocus={(e) => {
              if (!error && !disabled) {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)';
              }
            }}
            onBlur={(e) => {
              if (!error && !disabled) {
                e.currentTarget.style.borderColor = digit
                  ? 'var(--accent-primary)'
                  : 'var(--border-secondary)';
                e.currentTarget.style.background = digit
                  ? 'rgba(245, 158, 11, 0.1)'
                  : 'var(--bg-tertiary)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
        ))}
      </div>
      {error && (
        <p style={{ color: 'var(--error)', fontSize: '14px', textAlign: 'center', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default OTPInput;
