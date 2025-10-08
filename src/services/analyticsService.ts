import { apiClient } from './apiClient';

// Google Analytics 4
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

// Internal flags to ensure initialization only happens once
let isGAInitialized = false;
let routeListenerAttached = false;

/**
 * Inject the GA script tag if not already present.
 * This is idempotent and will not append multiple script tags.
 */
function injectGAScript(): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  const src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  const existing = Array.from(document.getElementsByTagName('script')).find((s) =>
    s.src?.includes(src)
  );
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

/**
 * Sets up the window.dataLayer and window.gtag function if not already defined.
 * Calls the basic gtag initialization (js + config).
 */
function setupGtag(): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];

  // If gtag already exists, do not overwrite it (idempotent)
  if (!window.gtag) {
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
  }

  try {
    // Fire basic gtag initialization - this is safe to call multiple times,
    // but we guard with isGAInitialized to avoid duplicate init calls.
    if (!isGAInitialized) {
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID);
      isGAInitialized = true;
    }
  } catch (err) {
    // Swallow errors - not critical for app flow
    // eslint-disable-next-line no-console
    console.error('Failed to initialize gtag:', err);
  }
}

/**
 * Attach listeners to capture SPA route changes and emit page_view events.
 * This is idempotent; multiple calls will not attach duplicate listeners.
 */
function attachRouteChangeListener(): void {
  if (typeof window === 'undefined' || routeListenerAttached) return;

  const handleRouteChange = () => {
    try {
      const path = window.location.pathname + window.location.search;
      // Use existing helper to track page view
      trackPageView(path);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error handling route change for analytics:', err);
    }
  };

  try {
    // Wrap pushState
    const originalPushState = history.pushState;
    history.pushState = function (this: History, ...args: any[]) {
      // Call original
      originalPushState.apply(this, args as any);
      // Trigger handler asynchronously to ensure location is updated
      setTimeout(handleRouteChange, 0);
    };

    // Wrap replaceState
    const originalReplaceState = history.replaceState;
    history.replaceState = function (this: History, ...args: any[]) {
      originalReplaceState.apply(this, args as any);
      setTimeout(handleRouteChange, 0);
    };

    // popstate for back/forward navigation
    window.addEventListener('popstate', handleRouteChange);

    routeListenerAttached = true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to attach route change listeners for analytics:', err);
  }
}

/**
 * Public function to initialize analytics (GA + route tracking).
 * - Ensures GA script is injected only once
 * - Ensures gtag is setup only once
 * - Attaches SPA route change listeners to track page views
 *
 * Call this as early as possible in your app startup (e.g., App.tsx entry).
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;

  if (!GA_MEASUREMENT_ID) {
    // No GA configured; nothing to initialize
    return;
  }

  injectGAScript();
  setupGtag();
  attachRouteChangeListener();
}

/**
 * Returns true if analytics (GA) appears to be configured and initialized.
 */
export function isAnalyticsConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  return !!GA_MEASUREMENT_ID && !!window.gtag && isGAInitialized;
}

// Initialize Google Analytics immediately if measurement ID is present
// This preserves existing behavior while still allowing explicit initializeAnalytics() calls.
if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
  injectGAScript();
  setupGtag();
  // Do not automatically attach route listeners here to avoid double-attaching
  // if initializeAnalytics() is called explicitly later. Attach here only if not already attached.
  attachRouteChangeListener();
}

// Initialize Mixpanel (if token provided)
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
if (MIXPANEL_TOKEN && typeof window !== 'undefined') {
  (function (f: Document, b: any) {
    if (!b.__SV) {
      const a = window;
      let c: any;
      let d: any;
      let e: any;
      let g: any;
      let h: any;
      let i: any;
      a.mixpanel = b;
      b._i = [];
      b.init = function (a: string, c: any, d?: string) {
        function e(b: any, a: any) {
          const c = a.split('.');
          if (c.length === 2) {
            b = b[c[0]];
            a = c[1];
          }
          b[a] = function () {
            b.push([a].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        let f: any = b;
        if (typeof d !== 'undefined') {
          f = b[d] = [];
        } else {
          d = 'mixpanel';
        }
        f.people = f.people || [];
        f.toString = function (b?: boolean) {
          let a = 'mixpanel';
          if (d !== 'mixpanel') {
            a += '.' + d;
          }
          if (!b) {
            a += ' (stub)';
          }
          return a;
        };
        f.people.toString = function () {
          return f.toString(1) + '.people (stub)';
        };
        const functions = 'disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user'.split(
          ' '
        );
        for (g = 0; g < functions.length; g++) e(f, functions[g]);
        b._i.push([a, c, d]);
      };
      b.__SV = 1.2;
      c = f.createElement('script');
      c.type = 'text/javascript';
      c.async = true;
      c.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
      d = f.getElementsByTagName('script')[0];
      d.parentNode?.insertBefore(c, d);
    }
  })(document, window.mixpanel || []);
  window.mixpanel?.init(MIXPANEL_TOKEN);
}

export const trackEvent = (eventName: string, properties: Record<string, any> = {}): void => {
  if (import.meta.env.DEV) {
    console.log(`[Analytics Event]`, {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
    });
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }

  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.track(eventName, properties);
  }

  apiClient
    .post('/analytics/track', {
      eventName: eventName,
      properties,
    })
    .catch((error) => {
      console.error('Failed to track event on backend:', error);
    });
};

export const identifyUser = (userId: string, traits: Record<string, any> = {}): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', { user_id: userId });
  }

  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.identify(userId);
    window.mixpanel.people.set(traits);
  }
};

export const trackPageView = (path: string): void => {
  trackEvent('page_view', { page_path: path });
};

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    mixpanel: any;
  }
}

export type { AnalyticsEvent };