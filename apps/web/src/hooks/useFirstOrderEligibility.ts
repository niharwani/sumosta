'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { couponsApi } from '@/lib/api';

// Determines whether the current visitor should still see first-order
// discount messaging (WELCOME10). Guests default to eligible so the
// promotion stays visible for anonymous traffic. Once a signed-in user
// has one non-cancelled/non-failed order, we suppress the offer.
export function useFirstOrderEligibility() {
  const user          = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [eligible, setEligible] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      setEligible(true);
      return;
    }

    let cancelled = false;
    setIsChecking(true);
    couponsApi.firstOrderEligible()
      .then((res) => { if (!cancelled) setEligible(res.eligible); })
      .catch(() => { if (!cancelled) setEligible(true); })
      .finally(() => { if (!cancelled) setIsChecking(false); });

    return () => { cancelled = true; };
  }, [user, isInitialized]);

  return { eligible, isChecking };
}
