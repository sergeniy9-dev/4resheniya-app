export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK;

  if (!BITRIX_WEBHOOK) {
    return res.status(500).json({
      ok: false,
      error: "BITRIX_WEBHOOK is not configured",
    });
  }

  try {
    const data = req.body || {};

    const bitrixPayload = {
      fields: {
        TITLE: `Заявка с сайта — ${data.source || "Без источника"}`,

        NAME: data.name || "Без имени",

        PHONE: data.contact
          ? [
              {
                VALUE: data.contact,
                VALUE_TYPE: "WORK",
              },
            ]
          : [],

        COMMENTS: `
Источник: ${data.source || "-"}

Имя: ${data.name || "-"}
Контакт: ${data.contact || "-"}

Сообщение:
${data.message || "-"}

Услуга:
${data.service || "-"}

Страница:
${data.page || "-"}

Устройство:
${data.device || "-"}

UTM Source: ${data.utm?.source || "-"}
UTM Medium: ${data.utm?.medium || "-"}
UTM Campaign: ${data.utm?.campaign || "-"}
UTM Content: ${data.utm?.content || "-"}
        `,

        SOURCE_DESCRIPTION: "4-solutions.ru",
      },
      params: {
        REGISTER_SONET_EVENT: "Y",
      },
    };

    const bitrixResponse = await fetch(
      `${BITRIX_WEBHOOK}/crm.lead.add.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bitrixPayload),
      }
    );

    const bitrixResult = await bitrixResponse.json();

    if (!bitrixResponse.ok || bitrixResult.error) {
      return res.status(500).json({
        ok: false,
        error: "Bitrix API error",
        bitrix: bitrixResult,
      });
    }

    return res.status(200).json({
      ok: true,
      leadId: bitrixResult.result,
      bitrix: bitrixResult,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Bitrix integration error",
      message: error.message,
    });
  }
}