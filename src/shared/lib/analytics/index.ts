import type { PostHog, PostHogConfig } from "posthog-js";

import {
  analyticsRouteTemplates,
  type AnalyticsRouteTemplate,
  type AnalyticsConsent,
  type AnalyticsEvents,
  type NodeCountBucket,
} from "./types";

export type { AnalyticsConsent } from "./types";

const CONSENT_KEY = "unfurl.analytics.consent.v1";
const ID_KEY = "unfurl.analytics.id.v1";
const EDIT_KEY = "unfurl.analytics.first-edit.v1";
const CHANGE_EVENT = "unfurl:analytics-consent";
const allowedProperties: Record<
  keyof AnalyticsEvents,
  Record<string, readonly string[]>
> = {
  $pageview: { route_template: analyticsRouteTemplates },
  $screen: { route_template: analyticsRouteTemplates },
  app_opened: {},
  demo_loaded: { source: ["button", "konami"] },
  import_succeeded: {
    format: ["twee", "obsidian", "json", "unknown"],
    node_count_bucket: ["0", "1-20", "21-100", "100+"],
  },
  import_failed: {
    format: ["twee", "obsidian", "json", "unknown"],
    node_count_bucket: ["0", "1-20", "21-100", "100+"],
    error_class: [
      "invalid_json",
      "invalid_story",
      "missing_title",
      "unsupported_format",
      "storage",
      "conversion",
    ],
  },
  export_succeeded: {
    format: ["json"],
    node_count_bucket: ["0", "1-20", "21-100", "100+"],
  },
  export_failed: {
    format: ["json"],
    node_count_bucket: ["0", "1-20", "21-100", "100+"],
    error_class: ["download"],
  },
  first_graph_edit: {},
  recent_file_opened: {},
};

let client: PostHog | undefined;
let starting: Promise<void> | undefined;
let generation = 0;
let initialized = false;
let opened = false;
let editPending = false;
let deniedForSession = false;
const routeTemplateSet = new Set<string>(analyticsRouteTemplates);

type RouteAnalyticsLocation = {
  href?: unknown;
  pathname?: unknown;
  search?: unknown;
  hash?: unknown;
};

type RouteAnalyticsMatch = {
  routeId?: unknown;
  fullPath?: unknown;
  pathname?: unknown;
  route?: {
    id?: unknown;
    path?: unknown;
    fullPath?: unknown;
  };
};

type RouteAnalyticsRouter = {
  state?: {
    matches?: readonly RouteAnalyticsMatch[];
    location?: RouteAnalyticsLocation;
    resolvedLocation?: RouteAnalyticsLocation;
  };
  subscribe: (event: "onResolved", listener: () => void) => () => void;
};

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getAnalyticsConsent = (): AnalyticsConsent => {
  if (deniedForSession) return "denied";
  const value = read(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : "pending";
};

export const isAnalyticsAvailable = () =>
  Boolean(
    import.meta.env.PROD &&
    import.meta.env.VITE_PUBLIC_POSTHOG_KEY &&
    ["https://eu.i.posthog.com", "https://us.i.posthog.com"].includes(
      import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? "",
    ) &&
    ["web", "desktop_github", "desktop_itch"].includes(
      import.meta.env.VITE_PUBLIC_DISTRIBUTION ?? "",
    ),
  );

const commonProperties = () => ({
  surface: isDesktopRuntime() ? "desktop" : "web",
  distribution: import.meta.env.VITE_PUBLIC_DISTRIBUTION,
  app_version: __APP_VERSION__,
});

const isDesktopRuntime = () =>
  Boolean(window.ipcRenderer) || window.location.protocol === "file:";

const isAnalyticsRouteTemplate = (
  value: unknown,
): value is AnalyticsRouteTemplate =>
  typeof value === "string" && routeTemplateSet.has(value);

const routeTemplateFromProperties = (
  properties: Record<string, unknown>,
): AnalyticsRouteTemplate | null => {
  const routeTemplate = properties.route_template;
  return isAnalyticsRouteTemplate(routeTemplate) ? routeTemplate : null;
};

const routeTemplateFromMatch = (
  match: RouteAnalyticsMatch,
): AnalyticsRouteTemplate | null => {
  const candidates = [
    match.routeId,
    match.fullPath,
    match.pathname,
    match.route?.fullPath,
    match.route?.path,
    match.route?.id,
  ];
  return candidates.find(isAnalyticsRouteTemplate) ?? null;
};

const currentRouteTemplate = (
  router: RouteAnalyticsRouter,
): AnalyticsRouteTemplate | null => {
  const matches = router.state?.matches;
  if (!matches) return null;
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const routeTemplate = routeTemplateFromMatch(matches[index]);
    if (routeTemplate) return routeTemplate;
  }
  return null;
};

const stringPart = (value: unknown) => (typeof value === "string" ? value : "");

const currentRouteKey = (router: RouteAnalyticsRouter) => {
  const location = router.state?.resolvedLocation ?? router.state?.location;
  if (!location) return null;
  const href = stringPart(location.href);
  if (href) return href;
  const pathname = stringPart(location.pathname);
  const search = stringPart(location.search);
  const hash = stringPart(location.hash);
  return pathname || search || hash ? `${pathname}${search}${hash}` : null;
};

// Rebuild the entire property object: SDK defaults include URLs and referrers,
// which can contain file identifiers and local Electron installation paths.
const beforeSend: NonNullable<PostHogConfig["before_send"]> = (event) => {
  if (
    !event ||
    getAnalyticsConsent() !== "granted" ||
    !Object.hasOwn(allowedProperties, event.event)
  )
    return null;
  const rules = allowedProperties[event.event as keyof AnalyticsEvents];
  const eventProperties = event.properties ?? {};
  const routeTemplate =
    event.event === "$pageview" || event.event === "$screen"
      ? routeTemplateFromProperties(eventProperties)
      : null;
  if (
    (event.event === "$pageview" || event.event === "$screen") &&
    !routeTemplate
  )
    return null;
  const properties: Record<string, unknown> = {
    token: import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
    distinct_id: read(ID_KEY),
    ...commonProperties(),
    $geoip_disable: true,
    $process_person_profile: true,
  };
  for (const [key, values] of Object.entries(rules)) {
    if (key === "route_template") continue;
    const value: unknown = eventProperties[key];
    if (typeof value === "string" && values.includes(value))
      properties[key] = value;
  }
  if (event.event === "$pageview" && routeTemplate) {
    properties.$current_url = `${window.location.origin}${routeTemplate}`;
    properties.$pathname = routeTemplate;
    properties.$host = window.location.host;
  }
  if (event.event === "$screen" && routeTemplate) {
    properties.$screen_name = routeTemplate;
  }
  const session: unknown = eventProperties.$session_id;
  if (typeof session === "string" && /^[\da-f-]{36}$/i.test(session))
    properties.$session_id = session;
  if (event.event === "app_opened")
    properties.$set = {
      distribution: import.meta.env.VITE_PUBLIC_DISTRIBUTION,
    };
  return {
    event: event.event,
    uuid: event.uuid,
    timestamp: event.timestamp,
    properties,
  };
};

const start = (): Promise<void> => {
  if (client && opened) return Promise.resolve();
  if (starting) return starting;
  if (!isAnalyticsAvailable() || getAnalyticsConsent() !== "granted")
    return Promise.resolve();
  const currentGeneration = generation;
  // Loading the SDK only after consent also keeps it out of the initial bundle.
  starting = import("posthog-js")
    .then(({ default: posthog }) => {
      if (
        currentGeneration !== generation ||
        getAnalyticsConsent() !== "granted"
      )
        return;
      let id = read(ID_KEY);
      if (!id || !/^[\da-f-]{36}$/i.test(id)) {
        id = crypto.randomUUID();
        localStorage.setItem(ID_KEY, id);
      }
      if (!client) {
        client = posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          api_transport: "fetch",
          persistence: "memory",
          bootstrap: { distinctID: id, isIdentifiedID: false },
          person_profiles: "always",
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: false,
          capture_dead_clicks: false,
          rageclick: false,
          capture_exceptions: false,
          capture_performance: false,
          disable_session_recording: true,
          disable_surveys: true,
          disable_product_tours: true,
          disable_conversations: true,
          disableDeviceModel: true,
          disable_external_dependency_loading: true,
          advanced_disable_flags: true,
          advanced_disable_feature_flags: true,
          save_referrer: false,
          save_campaign_params: false,
          ip: false,
          request_batching: false,
          before_send: beforeSend,
        });
      } else {
        client.reset();
      }
      client?.opt_in_capturing({ captureEventName: false });
      if (client && !opened) {
        opened = true;
        client.capture("app_opened", {});
      }
    })
    .catch(() => {
      // Analytics must never prevent local editing, including blocked storage/SDKs.
    })
    .finally(() => {
      starting = undefined;
      if (
        currentGeneration !== generation &&
        getAnalyticsConsent() === "granted"
      )
        void start();
    });
  return starting;
};

export const trackEvent = <E extends keyof AnalyticsEvents>(
  event: E,
  properties: AnalyticsEvents[E],
) => {
  if (!isAnalyticsAvailable() || getAnalyticsConsent() !== "granted") return;
  const currentGeneration = generation;
  const send = () => {
    if (currentGeneration !== generation || getAnalyticsConsent() !== "granted")
      return;
    try {
      client?.capture(event, properties);
    } catch {
      /* Optional telemetry. */
    }
  };
  if (client && !starting) send();
  else void start().then(send);
};

const trackRouteView = (routeTemplate: AnalyticsRouteTemplate) => {
  if (isDesktopRuntime()) {
    trackEvent("$screen", { route_template: routeTemplate });
    return;
  }
  trackEvent("$pageview", { route_template: routeTemplate });
};

export const subscribeRouteAnalytics = (router: RouteAnalyticsRouter) => {
  let lastCapturedRouteKey: string | null = null;
  const captureCurrentRoute = () => {
    if (getAnalyticsConsent() !== "granted") return;
    const routeTemplate = currentRouteTemplate(router);
    if (!routeTemplate) return;
    const routeKey = currentRouteKey(router) ?? routeTemplate;
    if (routeKey === lastCapturedRouteKey) return;
    lastCapturedRouteKey = routeKey;
    trackRouteView(routeTemplate);
  };
  const unsubscribeRouter = router.subscribe("onResolved", captureCurrentRoute);
  const unsubscribeConsent = subscribeAnalyticsConsent(captureCurrentRoute);
  captureCurrentRoute();
  return () => {
    unsubscribeRouter();
    unsubscribeConsent();
  };
};

export const trackFirstGraphEdit = () => {
  if (
    !isAnalyticsAvailable() ||
    getAnalyticsConsent() !== "granted" ||
    editPending
  )
    return;
  editPending = true;
  const currentGeneration = generation;
  void start()
    .then(() => {
      if (
        !client ||
        currentGeneration !== generation ||
        getAnalyticsConsent() !== "granted"
      )
        return;
      const id = read(ID_KEY);
      if (!id || read(EDIT_KEY) === id) return;
      try {
        localStorage.setItem(EDIT_KEY, id);
        client.capture("first_graph_edit", {});
      } catch {
        /* Optional telemetry. */
      }
    })
    .finally(() => {
      editPending = false;
    });
};

const stop = () => {
  generation += 1;
  opened = false;
  try {
    client?.opt_out_capturing();
  } catch {
    /* Optional telemetry. */
  }
  try {
    localStorage.removeItem(ID_KEY);
    localStorage.removeItem(EDIT_KEY);
  } catch {
    /* Storage may be unavailable. */
  }
};

export const setAnalyticsConsent = (consent: "granted" | "denied") => {
  // Withdrawal takes effect even if storage becomes unavailable mid-session.
  if (consent === "denied") {
    deniedForSession = true;
    stop();
  }
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return false;
  }
  deniedForSession = consent === "denied";
  if (consent === "granted") void start();
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
};

export const subscribeAnalyticsConsent = (listener: () => void) => {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
};

export const initAnalytics = () => {
  if (initialized) return;
  initialized = true;
  window.addEventListener("storage", (event) => {
    if (event.key !== CONSENT_KEY && event.key !== null) return;
    deniedForSession = false;
    if (getAnalyticsConsent() === "granted") void start();
    else stop();
  });
  void start();
};

export const nodeCountBucket = (count: number): NodeCountBucket =>
  count <= 0 ? "0" : count <= 20 ? "1-20" : count <= 100 ? "21-100" : "100+";
