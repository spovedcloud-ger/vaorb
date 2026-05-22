import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_PRICING } from '../data/siteContent';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

export function useSiteApi() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [pricingLoading, setPricingLoading] = useState(true);

  const fetchPricing = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/pricing`);
      if (res.ok) {
        const data = await res.json();
        if (data?.length > 0) {
          setPricing(
            DEFAULT_PRICING.map((def) => {
              const dbItem = data.find((item) => item.planType === def.planType);
              return dbItem ? { ...def, ...dbItem } : def;
            })
          );
        }
      }
    } catch {
      /* fallback pricing */
    } finally {
      setPricingLoading(false);
    }
  }, []);

  const trackPageView = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/analytics/view`, { method: 'POST' });
    } catch {
      /* silent */
    }
  }, []);

  const trackBookingClick = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/analytics/click-booking`, { method: 'POST' });
    } catch {
      /* silent */
    }
  }, []);

  const submitContact = async (contactData) => {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    return res.json().then((body) => ({ ok: res.ok, body }));
  };

  useEffect(() => {
    fetchPricing();
    trackPageView();
  }, [fetchPricing, trackPageView]);

  return {
    apiBase: API_BASE,
    pricing,
    setPricing,
    pricingLoading,
    fetchPricing,
    trackBookingClick,
    submitContact,
  };
}
