function getUTM() {
  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    content: params.get("utm_content") || "",
  };
}

function getDeviceType() {
  return window.innerWidth <= 760 ? "mobile" : "desktop";
}

export async function sendLeadToCRM(data) {
  const response = await fetch("/api/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      ...data,
      page: window.location.href,
      device: getDeviceType(),
      utm: getUTM(),
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    console.error("Lead API error:", result);
    throw new Error(result.error || "Lead API error");
  }

  console.log("Lead created:", result);

  return result;
}