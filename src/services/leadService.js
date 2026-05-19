function getUTM() {
  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
  };
}

function getDeviceType() {
  return window.innerWidth <= 760
    ? "mobile"
    : "desktop";
}

export async function sendLeadToCRM(data) {
  try {
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

    return await response.json();
  } catch (error) {
    console.error("Lead API error:", error);
  }
}