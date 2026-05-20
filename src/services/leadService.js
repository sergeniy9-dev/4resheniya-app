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

function getDevice() {
  if (typeof window === "undefined") {
    return "unknown";
  }

  return window.innerWidth <= 760 ? "mobile" : "desktop";
}

function getPageUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function sendLeadToCRM(data = {}) {
  const name = normalizeString(data.name);
  const phone = normalizeString(data.phone || data.contact || data.phoneNumber);

  const payload = {
    ...data,

    // PHP ждёт именно phone
    name,
    phone,

    // Оставляем contact для совместимости со старой логикой
    contact: normalizeString(data.contact) || phone,

    page: getPageUrl(),
    device: getDevice(),
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

    // Временная страховка:
    // если заявка сохранена в лог, но Bitrix пока не принял из-за прав,
    // не показываем пользователю падение формы.
    const savedButCrmFailed =
      response.status >= 500 &&
      typeof result.message === "string" &&
      result.message.includes("Заявка сохранена");

    if (savedButCrmFailed) {
      return {
        ...result,
        success: true,
        crmSuccess: false,
      };
    }

    throw new Error(result.message || result.error || "Lead API error");
  }

  console.log("Lead created:", result);

  return {
    ...result,
    crmSuccess: true,
  };
}

// Дополнительный экспорт на случай, если где-то уже используется sendLead
export const sendLead = sendLeadToCRM;

export default sendLeadToCRM;