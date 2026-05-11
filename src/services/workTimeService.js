export function isWorkingTime() {
  const now = new Date();

  const moscowTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Europe/Moscow",
    })
  );

  const day = moscowTime.getDay();
  const hour = moscowTime.getHours();

  const isSunday = day === 0;
  const isWorkHour = hour >= 10 && hour < 20;

  return !isSunday && isWorkHour;
}

export function getLeadResponseMessage() {
  if (isWorkingTime()) {
    return {
      title: "Соединяем со специалистом",
      text: "Заявка принята. Обычно специалист связывается в течение 2 минут.",
      mode: "online",
    };
  }

  return {
    title: "Заявка принята",
    text: "Сейчас специалисты не на линии. Мы свяжемся с вами в ближайшее рабочее время.",
    mode: "offline",
  };
}