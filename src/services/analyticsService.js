export function trackEvent(eventName, payload = {}) {
  const event = {
    eventName,
    payload,
    page: window.location.pathname,
    time: new Date().toISOString(),
    device: window.innerWidth <= 760 ? "mobile" : "desktop",
  };

  console.log("Analytics event:", event);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);

  return event;
}

export async function trackImportantEvent(eventName, payload = {}) {
  const event = trackEvent(eventName, payload);

  try {
    await fetch("/api/send-telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "Аналитика сайта",
        name: "Событие",
        contact: eventName,
        message: JSON.stringify(event, null, 2),
      }),
    });
  } catch (error) {
    console.warn("Analytics notify failed:", error);
  }
}