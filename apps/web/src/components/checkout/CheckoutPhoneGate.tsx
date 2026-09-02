'use client';
// Slim two-step gate for the checkout page:
//   1. User types a 10-digit Indian mobile number.
//   2. We send a Firebase phone-OTP and verify it.
//   3. On success, we hand our backend the Firebase ID token; the backend
//      returns a proper session AND (if the phone belongs to a returning
//      customer) their default saved address. We call `onVerified` with
//      that address so the checkout page can auto-fill the form.
// Also exposes a "Skip and fill manually" escape hatch that shows the
// legacy full form for users who don't want to do OTP.

import { useRef, useState } from 'react';
import type { ConfirmationResult } from 'firebase/auth';
import { Lock, Phone } from 'lucide-react';
import {
  isFirebaseConfigured,
  sendPhoneOtp,
  verifyPhoneOtp,
  signOutFirebase,
} from '@/lib/firebase';
import { authApi, type CheckoutAutofillAddress } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { mergeGuestCart } from '@/lib/auth-helpers';

const RECAPTCHA_ID = 'checkout-recaptcha-container';
const RESEND_SECONDS = 30;

interface Props {
  onVerified: (result: {
    user:            { id: string; name: string; email: string; phone: string; role: string };
    defaultAddress?: CheckoutAutofillAddress | null;
  }) => void;
  onSkip: () => void;
}

export function CheckoutPhoneGate({ onVerified, onSkip }: Props) {
  const login = useAuthStore((s) => s.login);

  const [stage, setStage]         = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone]         = useState('');
  const [code, setCode]           = useState('');
  const [sending, setSending]     = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError]         = useState('');
  const [resendIn, setResendIn]   = useState(0);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const configured = isFirebaseConfigured();

  const startResendTimer = () => {
    setResendIn(RESEND_SECONDS);
    const tick = () => {
      setResendIn((s) => {
        if (s <= 1) return 0;
        setTimeout(tick, 1000);
        return s - 1;
      });
    };
    setTimeout(tick, 1000);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setSending(true);
    try {
      confirmationRef.current = await sendPhoneOtp(`+91${digits}`, RECAPTCHA_ID);
      setStage('otp');
      startResendTimer();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send OTP';
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
      await signOutFirebase();

      onVerified({
        user: session.user,
        defaultAddress: session.defaultAddress ?? null,
      });
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'INVALID_TOKEN') {
        setError('Verification expired. Please request a new code.');
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

  // If Firebase isn't configured (dev / staging), fall straight through to
  // the legacy form — no user-visible OTP flow at all.
  if (!configured) {
    return (
      <div className="bg-cream-warm rounded-2xl border border-sand p-6">
        <p className="font-satoshi text-sm text-bark m-0">
          Phone sign-in isn&apos;t configured in this environment.
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 font-satoshi text-sm font-semibold text-honey-600 hover:text-honey-700 underline"
        >
          Continue with the full checkout form →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cream-warm rounded-2xl border border-sand p-6 md:p-8">
      <div id={RECAPTCHA_ID} className="invisible" aria-hidden />

      <div className="flex items-center gap-2.5 mb-1.5">
        <Phone size={16} className="text-honey-500" aria-hidden />
        <h2 className="font-clash font-bold text-charcoal text-lg m-0">
          Quick checkout
        </h2>
      </div>
      <p className="font-satoshi text-earth text-sm m-0 mb-5">
        {stage === 'phone'
          ? 'We’ll text you a one-time code, then auto-fill your address if you’ve ordered before.'
          : `Sent a 6-digit code to +91 ${phone}. Enter it below.`}
      </p>

      {stage === 'phone' ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-3" noValidate>
          <div className="flex items-center gap-2">
            <span className="font-satoshi text-sm text-bark bg-cream border border-sand rounded-lg px-3 py-3 min-h-[44px] flex items-center whitespace-nowrap">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="flex-1 rounded-lg border border-sand bg-cream px-4 py-3 text-sm font-satoshi text-charcoal focus:outline-none focus:ring-2 focus:ring-honey-400 focus:border-honey-400 min-h-[44px]"
              aria-label="Mobile number"
            />
          </div>

          {error && (
            <p role="alert" className="font-satoshi text-terracotta text-sm m-0">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending || phone.length !== 10}
            className="w-full mt-1 py-3 rounded-full font-satoshi font-semibold text-[15px] bg-honey-500 hover:bg-honey-600 text-cream disabled:bg-sand disabled:text-earth-light disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center justify-center gap-2"
          >
            {sending ? 'Sending code…' : (<><Lock size={14} aria-hidden /> Send verification code</>)}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="mt-1 font-satoshi text-xs text-earth hover:text-charcoal underline underline-offset-2 self-center"
          >
            Skip and fill in manually
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="flex flex-col gap-3" noValidate>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-sand bg-cream px-4 py-3 text-lg font-satoshi text-charcoal focus:outline-none focus:ring-2 focus:ring-honey-400 focus:border-honey-400 min-h-[44px] tracking-[0.4em] text-center"
            aria-label="Verification code"
          />

          {error && (
            <p role="alert" className="font-satoshi text-terracotta text-sm m-0">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full mt-1 py-3 rounded-full font-satoshi font-semibold text-[15px] bg-honey-500 hover:bg-honey-600 text-cream disabled:bg-sand disabled:text-earth-light disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {verifying ? 'Verifying…' : 'Verify & continue'}
          </button>

          <div className="flex items-center justify-between text-xs font-satoshi mt-1">
            <button
              type="button"
              onClick={() => { setStage('phone'); setCode(''); setError(''); }}
              className="text-earth hover:text-charcoal"
            >
              ← Change number
            </button>
            {resendIn > 0 ? (
              <span className="text-earth-light">Resend in {resendIn}s</span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp()}
                className="text-honey-600 hover:text-honey-700"
              >
                Resend code
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="mt-2 font-satoshi text-xs text-earth hover:text-charcoal underline underline-offset-2 self-center"
          >
            Skip and fill in manually
          </button>
        </form>
      )}
    </div>
  );
}
