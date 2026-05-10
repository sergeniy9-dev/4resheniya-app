export function getPreviewImage(answers) {
  const object = answers.object?.toLowerCase() || "";
  const mood = answers.mood?.toLowerCase() || "";

  // КВАРТИРА
  if (object.includes("кварт")) {
    if (mood.includes("тёп")) {
      return "/previews/library/apartment-warm.jpg";
    }

    if (mood.includes("конт")) {
      return "/previews/library/apartment-contrast.jpg";
    }

    return "/previews/library/apartment-soft.jpg";
  }

  // ДОМ
  if (object.includes("дом")) {
    if (mood.includes("класс")) {
      return "/previews/library/house-classic.jpg";
    }

    if (mood.includes("конт")) {
      return "/previews/library/house-contrast.jpg";
    }

    return "/previews/library/house-warm.jpg";
  }

  // КОММЕРЦИЯ
  if (object.includes("коммер")) {
    if (mood.includes("класс")) {
      return "/previews/library/commercial-classic.jpg";
    }

    if (mood.includes("конт")) {
      return "/previews/library/commercial-contrast.jpg";
    }

    return "/previews/library/commercial-soft.jpg";
  }

  // ОФИС
  if (object.includes("офис")) {
    if (mood.includes("конт")) {
      return "/previews/library/office-contrast.jpg";
    }

    if (mood.includes("класс")) {
      return "/previews/library/office-classic.jpg";
    }

    return "/previews/library/office-soft.jpg";
  }

  return "/previews/warm.jpg";
}