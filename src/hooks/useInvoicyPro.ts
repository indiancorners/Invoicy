import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabaseClient';

export const FREE_INVOICE_LIMIT = 1;

export const useInvoicyPro = () => {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const [isPremium, setIsPremium] = useState<boolean>(false);

  useEffect(() => {
    if (isSignedIn && userId) {
      const email = user?.primaryEmailAddress?.emailAddress;

      // Test-mode shortcuts ONLY in dev — never trust email content in prod.
      if (import.meta.env.DEV) {
        if (email === 'pro@invoicy.test' || email === 'premium@invoicy.test' || email?.endsWith('+pro@invoicy.test')) {
          setIsPremium(true);
          return;
        }
        if (email === 'free@invoicy.test' || email?.endsWith('+free@invoicy.test')) {
          setIsPremium(false);
          return;
        }
      }

      // Reset to false while fetching to prevent stale premium leaks across user switches.
      setIsPremium(false);

      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', userId)
          .single();

        if (data) {
          setIsPremium(data.is_premium);
        } else if (error?.code === 'PGRST116') {
          await supabase.from('profiles').insert({ id: userId, email: email || '' });
        }
      };

      fetchProfile();
    } else {
      setIsPremium(false);
    }
  }, [isSignedIn, userId, user]);

  const activatePro = () => {
    const checkoutUrl = import.meta.env.VITE_LEMON_SQUEEZY_CHECKOUT_URL;
    if (checkoutUrl) {
      const urlWithCustomData = new URL(checkoutUrl);
      if (userId) {
        urlWithCustomData.searchParams.append('checkout[custom][user_id]', userId);
      }
      if ((window as any).LemonSqueezy) {
        (window as any).LemonSqueezy.Url.Open(urlWithCustomData.toString());
      } else {
        window.open(urlWithCustomData.toString(), '_blank');
      }
    } else {
      console.warn("Missing Lemon Squeezy configuration.");
    }
  };

  const isLimitReached = (count: number) => !isPremium && count >= FREE_INVOICE_LIMIT;

  return {
    isPremium,
    activatePro,
    isLimitReached,
    freeLimit: FREE_INVOICE_LIMIT,
  };
};
