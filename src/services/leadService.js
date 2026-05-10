import { appConfig } from "../config/appConfig";

export async function sendLeadToCRM(lead) {
  const payload = {
    ...lead,
    source: appConfig.leadSource,
    funnel: appConfig.funnelName,
    page: window.location.href,
    createdAt: new Date().toISOString(),
  };

  console.log("Лид для CRM:", payload);

  if (!appConfig.bitrixWebhookUrl) {
    return {
      ok: true,
      mode: "console",
      payload,
    };
  }

  const response = await fetch(appConfig.bitrixWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        TITLE: `Карта решений — ${payload.object || "Новый лид"}`,
        NAME: payload.name,
        PHONE: [{ VALUE: payload.contact, VALUE_TYPE: "WORK" }],
        SOURCE_ID: "WEB",
        COMMENTS:
          `Источник: ${payload.source}\n` +
          `Воронка: ${payload.funnel}\n` +
          `Объект: ${payload.object}\n` +
          `Приоритет: ${payload.priority}\n` +
          `Атмосфера: ${payload.mood}\n` +
          `Уровень: ${payload.level}\n` +
          `Рекомендация: ${payload.recommendation}\n` +
          `Страница: ${payload.page}`,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Ошибка отправки лида");
  }

  return response.json();
}