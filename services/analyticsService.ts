import { apiClient } from './apiClient';

// Google Analytics 4
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

// Initialize Google Analytics
if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
  window.gtag = gtag;
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
        function e(b: string, a: any) {
          const c = a.split('.');
          if (c.length === 2) {
            b = b[c[0]];
            a = c[1];
          }
          b[a] = function () {
            b.push([a].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        let f = b;
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
      c.src =
        typeof MIXPANEL_CUSTOM_LIB_URL !== 'undefined'
          ? MIXPANEL_CUSTOM_LIB_URL
          : 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
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
      event: eventName,
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
