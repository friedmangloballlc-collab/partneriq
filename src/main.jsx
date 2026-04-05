// Build: 2026-03-19T15:40:00Z - force cache bust
import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import posthog from 'posthog-js'
import App from '@/App.jsx'
import '@/index.css'

// Initialize PostHog analytics
posthog.init('phc_AQXkZDKducVntafPTZfiv7NkqjtYUzJMCingF8Pek9tU', {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
});

// Initialize Sentry error tracking
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
