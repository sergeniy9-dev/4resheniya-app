import { appConfig } from "../config/appConfig";

export async function sendLeadToCRM(lead) {
  const payload = {
    ...lead,
    source: appConfig.leadSource,
    funnel: appConfig.funnelName,
    page: window.location.href,
    createdAt: new Date().toISOString(),
  };

  console.log("Лид:", payload);

  await fetch("/api/send-telegram", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return {
    ok: true,
    payload,
  };
}