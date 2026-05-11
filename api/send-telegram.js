export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      ok: false,
      error: "Telegram env variables are missing",
    });
  }

  const lead = req.body || {};

  const text = [
    "🟡 Новая заявка 4РЕШЕНИЯ",
    "",
    `Имя: ${lead.name || "—"}`,
    `Контакт: ${lead.contact || "—"}`,
    "",
    `Объект: ${lead.object || "—"}`,
    `Приоритет: ${lead.priority || "—"}`,
    `Атмосфера: ${lead.mood || "—"}`,
    `Уровень: ${lead.level || "—"}`,
    "",
    `Рекомендация: ${lead.recommendation || "—"}`,
    `Страница: ${lead.page || "—"}`,
  ].join("\n");

  const tgResponse = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    }
  );

  const data = await tgResponse.json();

  if (!tgResponse.ok) {
    return res.status(500).json({ ok: false, error: data });
  }

  return res.status(200).json({ ok: true, data });
}