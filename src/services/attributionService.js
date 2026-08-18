const STORAGE_KEY = "4sn_attribution";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getEmptyUtm() {
  return UTM_KEYS.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});
}

function readCookie(name) {
  if (!isBrowser()) {
    return "";
  }

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : "";
}

function readStoredAttribution() {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Attribution storage read error:", error);
    return null;
  }
}

function writeStoredAttribution(value) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn("Attribution storage write error:", error);
  }
}

function getCurrentUtm() {
  if (!isBrowser()) {
    return getEmptyUtm();
  }

  const params = new URLSearchParams(window.location.search);

  return UTM_KEYS.reduce((acc, key) => {
    acc[key] = cleanString(params.get(key) || "");
    return acc;
  }, {});
}

function hasAnyUtm(utm) {
  return UTM_KEYS.some((key) => cleanString(utm[key]) !== "");
}

function detectReferrerSource(referrer) {
  const value = cleanString(referrer).toLowerCase();

  if (value.includes("instagram.com") || value.includes("l.instagram.com")) {
    return "instagram";
  }

  if (value.includes("t.me") || value.includes("telegram")) {
    return "telegram";
  }

  if (value.includes("yandex.")) {
    return "yandex";
  }

  if (value.includes("google.")) {
    return "google";
  }

  return "";
}

function buildAttribution(stored = null) {
  const currentUtm = getCurrentUtm();
  const hasCurrentUtm = hasAnyUtm(currentUtm);
  const now = new Date().toISOString();
  const currentPage = isBrowser() ? window.location.href : "";
  const referrer = isBrowser() ? document.referrer : "";
  const storedUtm = stored?.utm && typeof stored.utm === "object" ? stored.utm : {};
  const activeUtm = hasCurrentUtm ? currentUtm : { ...getEmptyUtm(), ...storedUtm };
  const source = activeUtm.utm_source || stored?.source || detectReferrerSource(referrer);

  return {
    utm: {
      ...getEmptyUtm(),
      ...activeUtm,
    },
    source,
    landing_page: hasCurrentUtm ? currentPage : stored?.landing_page || currentPage,
    first_seen_at: hasCurrentUtm ? now : stored?.first_seen_at || now,
    referrer: hasCurrentUtm ? referrer : stored?.referrer || referrer,
    current_page: currentPage,
    last_seen_at: now,
    yandex_client_id: readCookie("_ym_uid"),
  };
}

export function initAttribution() {
  const stored = readStoredAttribution();
  const attribution = buildAttribution(stored);
  writeStoredAttribution(attribution);

  return attribution;
}

export function getAttributionData() {
  return initAttribution();
}
