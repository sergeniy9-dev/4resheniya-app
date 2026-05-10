export function trackEvent(eventName, eventData = {}) {
  const payload = {
    event: eventName,
    data: eventData,
    page: window.location.href,
    createdAt: new Date().toISOString(),
  };

  console.log("Analytics event:", payload);

  if (window.ym) {
    window.ym("reachGoal", eventName, eventData);
  }
}