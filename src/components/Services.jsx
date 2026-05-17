import { useState } from "react";
import "../styles/services.css";
import { sendLeadToCRM } from "../services/leadService";

const services = [
  {
    number: "01",
    title: "Дизайн-проект",
    text: "Планировка, визуальная концепция, материалы, свет и сценарии пространства.",
    image: "/services/design.jpg",
    details: [
      "Обмерный план",
      "Планировочные решения",
      "3D-визуализации интерьеров",
      "Подбор материалов и мебели",
      "Сценарии освещения",
    ],
  },
  {
    number: "02",
    title: "Ремонт под ключ",
    text: "Организация работ, сметы, сроки, контроль качества и сдача объекта.",
    image: "/services/repair.jpg",
    details: [
      "Подробная смета без скрытых затрат",
      "Закупка и доставка материалов",
      "Все виды строительно-отделочных работ",
      "Контроль качества на каждом этапе",
      "Сдача объекта точно по плану",
    ],
  },
  {
    number: "03",
    title: "Строительство",
    text: "Проектирование и реализация частных домов с понятной логикой этапов.",
    image: "/services/build.jpg",
    details: [
      "Разработка проекта дома",
      "Поэтапная реализация работ",
      "Инженерные системы",
      "Контроль строительного процесса",
      "Благоустройство территории",
    ],
  },
  {
    number: "04",
    title: "Комплектация",
    text: "Подбор материалов, мебели, света и инженерных решений под бюджет.",
    image: "/services/complete.jpg",
    details: [
      "Подбор отделочных материалов",
      "Подбор мебели и освещения",
      "Инженерные решения",
      "Согласование с проектом и бюджетом",
      "Авторский надзор при комплектации",
    ],
  },
];

export default function Services() {
  const [activeService, setActiveService] = useState(null);

  async function handleServiceLead(item) {
    await sendLeadToCRM({
      source: "Интерес к услуге",
      name: "Пользователь сайта",
      contact: "Клик по услуге",
      message: `Пользователь нажал подробнее: ${item.title}`,
      service: item.title,
    });

    alert("Заявка по услуге отправлена. Мы свяжемся с вами.");
  }

  return (
    <section id="services" className="services reveal">
      <div className="services-bg"></div>

      <div className="services-wrap">
        <div className="services-head">
          <p className="eyebrow">НАПРАВЛЕНИЯ</p>
          <h2>Четыре решения для вашего пространства</h2>
          <span>
            Мы соединяем проектирование, реализацию, комплектацию и контроль в
            единую систему.
          </span>
        </div>

        <div className="services-grid">
          {services.map((item) => (
            <article
              className={
                activeService === item.number
                  ? "service-card service-card-open"
                  : "service-card"
              }
              key={item.number}
              onClick={() =>
                setActiveService(
                  activeService === item.number ? null : item.number
                )
              }
            >
              <span>{item.number}</span>

              <h3>{item.title}</h3>
              <p>{item.text}</p>

              <button
                type="button"
                className="service-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveService(
                    activeService === item.number ? null : item.number
                  );
                }}
              >
                {activeService === item.number ? "→" : "→"}
              </button>

              {activeService === item.number && (
                <div className="service-expanded">
                  <div
                    className="service-image"
                    style={{ backgroundImage: `url(${item.image})` }}
                  ></div>

                  <div className="service-details">
                    <b>Что входит:</b>

                    <ul>
                      {item.details.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      className="service-lead-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceLead(item);
                      }}
                    >
                      Подробнее об услуге <i>→</i>
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}