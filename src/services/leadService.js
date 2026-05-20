function getUtm() {
  if (typeof window === "undefined") {
    return {
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      utm_term: "",
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
  };
}

function getPageUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
}

function getDeviceType() {
  if (typeof window === "undefined") {
    return "unknown";
  }

  return window.innerWidth <= 760 ? "mobile" : "desktop";
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function detectContactType(value) {
  const contact = normalizeString(value);

  if (!contact) {
    return "unknown";
  }

  const lower = contact.toLowerCase();

  if (contact.startsWith("@") || lower.includes("t.me/") || lower.includes("telegram")) {
    return "telegram";
  }

  if (lower.includes("wa.me/") || lower.includes("whatsapp")) {
    return "whatsapp";
  }

  if (lower.includes("instagram.com") || lower.startsWith("instagram")) {
    return "instagram";
  }

  if (contact.includes("@") && contact.includes(".")) {
    return "email";
  }

  const digits = contact.replace(/\D/g, "");

  if (digits.length >= 10) {
    return "phone";
  }

  return "other";
}

function normalizePhone(value) {
  const contact = normalizeString(value);
  const digits = contact.replace(/\D/g, "");

  if (digits.length < 10) {
    return "";
  }

  if (digits.length === 11 && digits.startsWith("8")) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits}`;
  }

  if (contact.startsWith("+")) {
    return contact;
  }

  return digits;
}

export async function sendLeadToCRM(data = {}) {
  const name = normalizeString(data.name);

  const rawContact = normalizeString(
    data.contact || data.phone || data.phoneNumber || data.telegram || data.email
  );

  const contactType = detectContactType(rawContact);
  const phone = contactType === "phone" ? normalizePhone(rawContact) : "";

  const payload = {
    ...data,

    name,

    // ВАЖНО:
    // phone заполняется только если это реально номер телефона.
    phone,

    // contact хранит то, что человек реально ввёл:
    // телефон, Telegram, WhatsApp, email, ник и т.д.
    contact: rawContact,

    contactType,
    contact_type: contactType,

    page: getPageUrl(),
    device: getDeviceType(),
    utm: getUtm(),
  };

  const response = await fetch("/api/lead.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  let result;

  try {
    result = await response.json();
  } catch (error) {
    console.error("Lead API invalid JSON response:", error);
    throw new Error("Сервер вернул некорректный ответ");
  }

  if (!response.ok || !result.success) {
    console.error("Lead API error:", result);
    throw new Error(result.message || result.error || "Lead API error");
  }

  console.log("Lead created:", result);

  return result;
}

export const sendLead = sendLeadToCRM;

export default sendLeadToCRM;