import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing"
import browser from 'browserApi'

export default function initSentry (component: 'background' | 'popup') {
  Sentry.init({
    dsn: "https://d91fc52edecf48a7895f2ca0b0b3d922@o1062166.ingest.sentry.io/6052569",
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    release: `extension_${component}@${browser.runtime.getManifest().version}`,
    environment: process.env.NODE_ENV || 'development'
  })
}
