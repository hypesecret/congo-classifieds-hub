// Lightweight analytics wrapper. Sends events to Plausible if loaded,
// otherwise logs to console in dev. Safe no-op in SSR / preview.

type EventProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: EventProps }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export const ANALYTICS_EVENTS = {
  SIGNUP: "signup",
  LOGIN: "login",
  LISTING_PUBLISH: "listing_publish",
  LISTING_CONTACT: "listing_contact",
  LISTING_VIEW: "listing_view",
  SEARCH: "search",
  FAVORITE_ADD: "favorite_add",
  BOOST_PURCHASE: "boost_purchase",
  REFERRAL_SHARED: "referral_shared",
} as const;

export function track(event: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
    window.gtag?.("event", event, props ?? {});
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event, props ?? {});
    }
  } catch {
    /* swallow */
  }
}
