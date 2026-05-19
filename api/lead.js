export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      source,
      name,
      contact,
      message,
      service,
      utm,
      page,
      device,
    } = req.body;

    const response = await fetch(
      `${process.env.BITRIX_WEBHOOK}/crm.lead.add.json`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fields: {
            TITLE: `Заявка с сайта — ${source || "Без источника"}`,

            NAME: name || "Без имени",

            PHONE: [
              {
                VALUE: contact || "",
                VALUE_TYPE: "WORK",
              },
            ],

            COMMENTS: `
Источник: ${source || "-"}

Сообщение:
${message || "-"}

Услуга:
${service || "-"}

Страница:
${page || "-"}

Устройство:
${device || "-"}

UTM:
${JSON.stringify(utm || {}, null, 2)}
            `,

            SOURCE_DESCRIPTION: "4-solutions.ru",
          },
        }),
      }
    );

    const result = await response.json();

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Bitrix integration error",
    });
  }
}