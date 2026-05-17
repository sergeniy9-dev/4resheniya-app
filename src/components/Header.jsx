import { useState } from "react";
import "../styles/header.css";
import { trackEvent, trackImportantEvent } from "../services/analyticsService";
import {
  Building2,
  Hammer,
  Layers3,
  PhoneCall,
} from "lucide-react";


export default function Header() {
  const [contactsOpen, setContactsOpen] = useState(false);

  return (
    <header className="header">
      <a href="#" className="header-logo" aria-label="4 Решения">
        <img src="/brand/logo.png" alt="4 Решения" />
      </a>

      <nav className="header-nav">
  <a href="#about">
    <i>
      <Building2 size={15} strokeWidth={2.2} />
    </i>
    О компании
  </a>

  <a href="#services">
    <i>
      <Hammer size={15} strokeWidth={2.2} />
    </i>
    Услуги
  </a>

  <a href="#constructor">
    <i>
      <Layers3 size={15} strokeWidth={2.2} />
    </i>
    Карта решений
  </a>

  <a href="#contacts">
    <i>
      <PhoneCall size={15} strokeWidth={2.2} />
    </i>
    Контакты
  </a>
</nav>

      <div className="header-actions">
        <a href="tel:+7 (495) 532-26-17" className="header-phone">
          +7 (495) 532-26-17
        </a>

        <button
  type="button"
  className="header-button"
  onClick={() => {
    setContactsOpen((prev) => !prev);

    trackImportantEvent("open_contacts_popover", {
      place: "header",
    });
  }}
>
  Обсудить проект <em>→</em>
</button>

        {contactsOpen && (
          <div className="contact-popover">
            <div className="contact-popover-head">
              <span>Связаться с нами</span>
              <button type="button" onClick={() => setContactsOpen(false)}>
                ×
              </button>
            </div>

            <div className="contact-grid">
              <a href="tel:+79999999999">
                <i>☎</i>
                <b>Телефон</b>
                <small>Позвонить сейчас</small>
              </a>
            <a href="#" target="_blank" rel="noreferrer">
                <i>◆</i>
                <b>MAX</b>
            <small>Связь в мессенджере</small>
            </a>
              <a href="https://t.me/USERNAME" target="_blank" rel="noreferrer">
                <i>✈</i>
                <b>Telegram</b>
                <small>Написать в чат</small>
              </a>

              <a href="https://wa.me/79999999999" target="_blank" rel="noreferrer">
                <i>☘</i>
                <b>WhatsApp</b>
                <small>Быстрый вопрос</small>
              </a>
            <a href="https://instagram.com/USERNAME" target="_blank" rel="noreferrer">
  <i>◎</i>
  <b>Instagram</b>
  <small>Кейсы и визуал</small>
            </a>
              <a href="mailto:info@4resheniya.ru">
                <i>✉</i>
                <b>Почта</b>
                <small>Отправить письмо</small>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}