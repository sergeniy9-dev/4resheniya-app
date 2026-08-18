import { useEffect, useRef, useState } from "react";
import "../styles/services.css";
import { sendLeadToCRM } from "../services/leadService";
import {
  trackEvent,
  trackLead,
  trackServiceOpen,
  trackServiceLead,
} from "../services/analyticsService";

const PRESENTATION_QR_SERVICE = {
  number: "presentation_qr",
  title: "Обсудить проект",
};

const PRESENTATION_QR_LEAD_DATA = {
  formName: "presentation_qr_modal",
  entryPoint: "presentation_qr_callback",
  source: "presentation",
};

function shouldAutoOpenPresentationLead() {
  if (typeof window === "undefined") {
    return false;
  }

  const url = new URL(window.location.href);
  const isHomePage =
    url.pathname === "/" || url.pathname.endsWith("/index.html");

  return (
    isHomePage &&
    (url.searchParams.get("openLead") === "1" ||
      url.searchParams.get("modal") === "lead")
  );
}

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
    title: "Реализация интерьера",
    text: "Строительно-отделочные работы, управление сметой и сроками, контроль качества и сдача объекта.",
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
  const autoOpenHandled = useRef(false);
  const [initialPresentationLead] = useState(shouldAutoOpenPresentationLead);
  const [activeService, setActiveService] = useState(null);
  const [modalService, setModalService] = useState(
    initialPresentationLead ? PRESENTATION_QR_SERVICE : null
  );
  const [leadContext, setLeadContext] = useState(
    initialPresentationLead ? "presentation_qr" : "service"
  );
  const [leadForm, setLeadForm] = useState({
    name: "",
    contact: "",
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadStatus, setLeadStatus] = useState(null);

  useEffect(() => {
    if (autoOpenHandled.current || typeof window === "undefined") {
      return;
    }

    autoOpenHandled.current = true;

    if (!initialPresentationLead) {
      return;
    }

    trackEvent("qr_presentation_lead_open", PRESENTATION_QR_LEAD_DATA);

    const url = new URL(window.location.href);

    if (url.searchParams.get("openLead") === "1") {
      url.searchParams.delete("openLead");
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}${url.hash}`
      );
    }
  }, [initialPresentationLead]);

  function toggleService(item) {
    const nextValue = activeService === item.number ? null : item.number;

    setActiveService(nextValue);

    if (nextValue) {
      trackServiceOpen(item.title);
    }
  }

  function handleServiceLead(item) {
    trackServiceLead(item.title);

    if (typeof window === "undefined") {
      return;
    }

    setLeadContext("service");
    setModalService(item);
    setLeadStatus(null);
  }

  function closeLeadModal() {
    if (leadSubmitting) {
      return;
    }

    setModalService(null);
    setLeadStatus(null);
  }

  async function submitServiceLead(event) {
    event.preventDefault();

    if (!modalService || leadSubmitting) {
      return;
    }

    const name = leadForm.name.trim();
    const contact = leadForm.contact.trim();

    if (!name || !contact) {
      setLeadStatus({
        mode: "error",
        text: "Укажите имя и телефон или Telegram для связи.",
      });

      return;
    }

    setLeadSubmitting(true);
    setLeadStatus(null);

    try {
      const isPresentationQrLead = leadContext === "presentation_qr";

      await sendLeadToCRM({
        source: isPresentationQrLead
          ? PRESENTATION_QR_LEAD_DATA.source
          : "Форма услуги",
        name,
        contact,
        service: modalService.title,
        formName: isPresentationQrLead
          ? PRESENTATION_QR_LEAD_DATA.formName
          : "Модальное окно услуги",
        channel: "website_form",
        entryPoint: isPresentationQrLead
          ? PRESENTATION_QR_LEAD_DATA.entryPoint
          : "service_modal",
        message: `Пользователь интересовался услугой: ${modalService.title}`,
      });

      trackLead(
        isPresentationQrLead
          ? PRESENTATION_QR_LEAD_DATA.entryPoint
          : "service_modal",
        {
          service: modalService.title,
          formName: isPresentationQrLead
            ? PRESENTATION_QR_LEAD_DATA.formName
            : "Модальное окно услуги",
        }
      );

      setLeadStatus({
        mode: "success",
        text: "Заявка отправлена. Специалист свяжется с вами.",
      });
      setLeadForm({
        name: "",
        contact: "",
      });

      setTimeout(() => {
        setModalService(null);
        setLeadStatus(null);
      }, 1400);
    } catch (error) {
      console.error("Service lead submit error:", error);
      setLeadStatus({
        mode: "error",
        text: "Не получилось отправить заявку. Попробуйте ещё раз.",
      });
    } finally {
      setLeadSubmitting(false);
    }
  }

  function updateLeadForm(field, value) {
    setLeadForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
              key={item.number}
              className={
                activeService === item.number
                  ? "service-card service-card-open"
                  : "service-card"
              }
              onClick={() => toggleService(item)}
            >
              <span>{item.number}</span>

              <h3>{item.title}</h3>
              <p>{item.text}</p>

              <button
                type="button"
                className="service-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleService(item);
                }}
                aria-label={`Подробнее: ${item.title}`}
              >
                →
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
                      Обсудить со специалистом <i>→</i>
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {modalService && (
        <div
          className="service-modal-overlay"
          role="presentation"
          onClick={closeLeadModal}
        >
          <div
            className="service-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="service-modal-close"
              aria-label="Закрыть окно"
              onClick={closeLeadModal}
            >
              ×
            </button>

            <span className="service-modal-kicker">Заявка на услугу</span>
            <h3 id="service-modal-title">{modalService.title}</h3>
            <p>
              Оставьте контакт, и специалист подскажет следующий шаг по этой
              услуге.
            </p>

            <form className="service-modal-form" onSubmit={submitServiceLead}>
              <label>
                Имя
                <input
                  value={leadForm.name}
                  onChange={(e) => updateLeadForm("name", e.target.value)}
                  placeholder="Ваше имя"
                  autoFocus
                />
              </label>

              <label>
                Телефон или Telegram
                <input
                  value={leadForm.contact}
                  onChange={(e) => updateLeadForm("contact", e.target.value)}
                  placeholder="+7 (000) 000-00-00"
                />
              </label>

              <button type="submit" disabled={leadSubmitting}>
                {leadSubmitting ? "Отправляем..." : "Жду звонка"}
              </button>
            </form>

            {leadStatus && (
              <div className={`service-modal-status ${leadStatus.mode}`}>
                {leadStatus.text}
              </div>
            )}

            <small>
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности и
              пользовательским соглашением.
            </small>
          </div>
        </div>
      )}
    </section>
  );
}
