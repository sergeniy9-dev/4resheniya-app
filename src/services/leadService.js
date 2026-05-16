export async function sendLeadToCRM(lead) {
  console.log("Лид:", lead);

  const response = await fetch("/api/send-telegram", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: lead.source || "Сайт",
      name: lead.name || "Не указано",
      contact: lead.contact || "Не указано",
      message: lead.message || "",
      object: lead.object || "",
      priority: lead.priority || "",
      mood: lead.mood || "",
      level: lead.level || "",
      recommendation: lead.recommendation || "",
      previewImage: lead.previewImage || "",
    }),
  });

  if (!response.ok) {
    throw new Error("Не удалось отправить заявку");
  }

  return response.json();
}