const METRIKA_ID =
  Number(import.meta.env.VITE_YANDEX_METRIKA_ID) || 109267393;

function getDeviceType() {
  if (typeof window === "undefined") {
    return "unknown";
  }

  return window.innerWidth <= 760 ? "mobile" : "desktop";
}

function getPageData() {
  if (typeof window === "undefined") {
    return {
      page: "",
      hash: "",
      url: "",
      device: "unknown",
      time: new Date().toISOString(),
    };
  }

  return {
    page: window.location.pathname,
    hash: window.location.hash,
    url: window.location.href,
    device: getDeviceType(),
    time: new Date().toISOString(),
  };
}

function normalizeEventName(eventName) {
  return String(eventName || "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}

export function trackEvent(eventName, payload = {}) {
  const safeEventName = normalizeEventName(eventName);

  if (!safeEventName) {
    return null;
  }

  const event = {
    event: safeEventName,
    eventName: safeEventName,
    payload,
    ...getPageData(),
  };

  console.log("Analytics event:", event);

  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);

    if (METRIKA_ID && typeof window.ym === "function") {
      try {
        window.ym(METRIKA_ID, "reachGoal", safeEventName, payload);
        console.log("YM goal sent:", safeEventName, payload);
      } catch (error) {
        console.warn("YM goal error:", error);
      }
    }
  }

  return event;
}

export function trackLead(source, payload = {}) {
  return trackEvent("lead_submit", {
    source,
    ...payload,
  });
}

export function trackContactClick(type, place = "site", payload = {}) {
  return trackEvent(`click_${type}`, {
    type,
    place,
    channel: type,
    ...payload,
  });
}

export function trackPhoneClick(place = "site", payload = {}) {
  return trackContactClick("phone", place, payload);
}

export function trackWhatsAppClick(place = "site", payload = {}) {
  return trackContactClick("whatsapp", place, payload);
}

export function trackTelegramClick(place = "site", payload = {}) {
  return trackContactClick("telegram", place, payload);
}

export function trackInstagramClick(place = "site", payload = {}) {
  return trackContactClick("instagram", place, payload);
}

export function trackMaxClick(place = "site", payload = {}) {
  return trackContactClick("max", place, payload);
}

export function trackOpenContacts(place = "site") {
  return trackEvent("open_contacts_popover", {
    place,
  });
}

export function trackServiceOpen(serviceName) {
  return trackEvent("service_open", {
    service: serviceName,
  });
}

export function trackServiceLead(serviceName) {
  return trackEvent("service_lead_click", {
    service: serviceName,
  });
}

export function trackConstructorSelect(step, value) {
  return trackEvent("constructor_select", {
    step,
    value,
  });
}

export function trackConstructorCompleted(payload = {}) {
  return trackEvent("constructor_completed", payload);
}

export function trackConstructorLead(payload = {}) {
  return trackEvent("constructor_lead_submit", payload);
}

export function trackProjectClick(projectName) {
  return trackEvent("project_click", {
    project: projectName,
  });
}

export function trackAboutOpen(opened) {
  return trackEvent(opened ? "about_open" : "about_close");
}

export function trackMainCta(place = "site", payload = {}) {
  return trackEvent("main_cta_click", {
    place,
    ...payload,
  });
}

export function trackDiscussProject(place = "site", payload = {}) {
  return trackEvent("click_discuss_project", {
    place,
    ...payload,
  });
}

export function trackImportantEvent(eventName, payload = {}) {
  return trackEvent(eventName, payload);
}