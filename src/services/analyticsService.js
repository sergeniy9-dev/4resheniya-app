const METRIKA_ID = Number(import.meta.env.VITE_YANDEX_METRIKA_ID);

function getDeviceType() {
  if (typeof window === "undefined") return "unknown";
  return window.innerWidth <= 760 ? "mobile" : "desktop";
}

function getPageData() {
  return {
    page: window.location.pathname,
    hash: window.location.hash,
    url: window.location.href,
    device: getDeviceType(),
    time: new Date().toISOString(),
  };
}

export function trackEvent(eventName, payload = {}) {
  const event = {
    event: eventName,
    eventName,
    payload,
    ...getPageData(),
  };

  console.log("Analytics event:", event);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);

  if (METRIKA_ID && window.ym) {
    window.ym(METRIKA_ID, "reachGoal", eventName, payload);
  }

  return event;
}

export function trackLead(source, payload = {}) {
  return trackEvent("lead_submit", {
    source,
    ...payload,
  });
}

export function trackContactClick(type, place = "site") {
  return trackEvent(`click_${type}`, {
    place,
  });
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

export function trackProjectClick(projectName) {
  return trackEvent("project_click", {
    project: projectName,
  });
}

export function trackAboutOpen(opened) {
  return trackEvent(opened ? "about_open" : "about_close");
}

export function trackMainCta(place = "site") {
  return trackEvent("main_cta_click", {
    place,
  });
}
export function trackImportantEvent(eventName, payload = {}) {
  return trackEvent(eventName, payload);
}