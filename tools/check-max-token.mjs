const token = process.env.MAX_TOKEN?.trim();

if (!token) {
  console.error("❌ Ошибка: MAX_TOKEN не указан.");
  console.log("Запусти так:");
  console.log('$env:MAX_TOKEN="твой_токен"');
  console.log("node tools/check-max-token.mjs");
  process.exit(1);
}

async function checkMaxToken() {
  try {
    const response = await fetch("https://platform-api.max.ru/me", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const text = await response.text();

    console.log("HTTP статус:", response.status);

    if (!response.ok) {
      console.log("❌ MAX вернул ошибку:");
      console.log(text);
      return;
    }

    try {
      const data = JSON.parse(text);
      console.log("✅ Токен рабочий. Информация о боте:");
      console.log(JSON.stringify(data, null, 2));
    } catch {
      console.log("✅ Ответ получен, но это не JSON:");
      console.log(text);
    }
  } catch (error) {
    console.error("❌ Ошибка запроса:");
    console.error(error.message);
  }
}

checkMaxToken();