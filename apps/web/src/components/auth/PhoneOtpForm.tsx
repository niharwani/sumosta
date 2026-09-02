'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ConfirmationResult } from 'firebase/auth';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { mergeGuestCart } from '@/lib/auth-helpers';
import {
  isFirebaseConfigured,
  sendPhoneOtp,
  verifyPhoneOtp,
  signOutFirebase,
} from '@/lib/firebase';
import { AuthField } from '@/components/auth/AuthField';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';

interface PhoneOtpFormProps {
  nextPath: string;
  onBack: () => void;
}

const RECAPTCHA_ID = 'firebase-recaptcha-container';

export function PhoneOtpForm({ nextPath, onBack }: PhoneOtpFormProps) {
  const router = useRouter();
  const login  = useAuthStore((s) => s.login);

  const [stage, setStage] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode]   = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const configured = isFirebaseConfigured();

  const startResendTimer = () => {
    setResendCountdown(30);
    const tick = () => {
      setResendCountdown((s) => {
        if (s <= 1) return 0;
        setTimeout(tick, 1000);
        return s - 1;
      });
    };
    setTimeout(tick, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setSending(true);
    try {
      const e164 = `+91${digits}`;
      confirmationRef.current = await sendPhoneOtp(e164, RECAPTCHA_ID);
      setStage('otp');
      startResendTimer();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send OTP';
      // Firebase error codes come through as strings inside message
      if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please try again in a few minutes.');
      } else if (msg.includes('invalid-phone-number')) {
        setError('That phone number is not valid.');
      } else if (msg.includes('captcha') || msg.includes('recaptcha')) {
        setError('Verification challenge failed. Please refresh the page and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!confirmationRef.current) {
      setError('Please request a new OTP.');
      setStage('phone');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your SMS.');
      return;
    }
    setVerifying(true);
    try {
      const idToken = await verifyPhoneOtp(confirmationRef.current, code);
      const session = await authApi.firebasePhoneVerify({ idToken });
      login(session.user, session.accessToken, session.refreshToken);
      await mergeGuestCart();
      await signOutFirebase(); // we don't need Firebase's session after minting our own
      router.push(nextPath);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'INVALID_TOKEN') {
        setError('OTP verification expired. Please request a new code.');
        setStage('phone');
      } else if (e.message?.includes('invalid-verification-code')) {
        setError('That code is incorrect. Please try again.');
      } else if (e.message?.includes('code-expired')) {
        setError('That code has expired. Please request a new one.');
        setStage('phone');
      } else {
        setError(e.message ?? 'Verification failed. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  };

  if (!configured) {
    return (
      <div className="rounded-lg border border-[--sand] bg-[--cream-warm] p-4 mb-5" role="alert">
        <p className="font-satoshi text-sm text-[--bark] mb-2 font-semibold">
          Phone sign-in is not configured yet
        </p>
        <p className="font-satoshi text-xs text-[--earth]">
          Please use email sign-in below, or contact support.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 font-satoshi text-sm text-[--honey-600] hover:text-[--honey-700]"
        >
          ← Back to email sign-in
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Invisible reCAPTCHA container — Firebase mounts here */}
      <div id={RECAPTCHA_ID} className="invisible" aria-hidden="true" />

      {stage === 'phone' ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-5" noValidate>
          <div>
            <label
              htmlFor="phone-input"
              className="block font-satoshi text-[--charcoal] text-sm font-medium mb-1.5"
            >
              Mobile Number
            </label>
            <div className="flex items-center gap-2">
              <span className="font-satoshi text-sm text-[--bark] bg-[--cream-warm] border border-[--sand] rounded-lg px-3 py-3 min-h-[44px] flex items-center">
                +91
              </span>
              <input
                id="phone-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 rounded-lg border border-[--sand] bg-[--cream] px-4 py-3 text-sm font-satoshi text-[--charcoal] focus:outline-none focus:ring-2 focus:ring-[--honey-400] focus:border-[--honey-400] min-h-[44px]"
              />
            </div>
            <p className="font-satoshi text-xs text-[--earth] mt-1.5">
              We&apos;ll text you a 6-digit verification code.
            </p>
          </div>

          {error ? (
            <p role="alert" className="font-satoshi text-[--terracotta] text-sm text-center">
              {error}
            </p>
          ) : null}

          <AuthSubmitButton loading={sending} loadingLabel="Sending code…">
            Send verification code
          </AuthSubmitButton>

          <button
            type="button"
            onClick={onBack}
            className="font-satoshi text-sm text-[--bark] hover:text-[--charcoal] transition-colors mt-1"
          >
            ← Back to email sign-in
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="flex flex-col gap-5" noValidate>
          <div>
            <p className="font-satoshi text-sm text-[--bark] mb-3">
              Enter the 6-digit code we sent to <strong className="text-[--charcoal]">+91 {phone}</strong>
            </p>
            <AuthField
              label="Verification Code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              name="code"
            />
          </div>

          {error ? (
            <p role="alert" className="font-satoshi text-[--terracotta] text-sm text-center">
              {error}
            </p>
          ) : null}

          <AuthSubmitButton loading={verifying} loadingLabel="Verifying…">
            Verify &amp; Sign in
          </AuthSubmitButton>

          <div className="flex items-center justify-between text-xs font-satoshi">
            <button
              type="button"
              onClick={() => {
                setStage('phone');
                setCode('');
                setError('');
              }}
              className="text-[--bark] hover:text-[--charcoal]"
            >
              ← Change number
            </button>
            {resendCountdown > 0 ? (
              <span className="text-[--earth]">Resend in {resendCountdown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp(new Event('submit') as unknown as React.FormEvent)}
                className="text-[--honey-600] hover:text-[--honey-700]"
              >
                Resend code
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
