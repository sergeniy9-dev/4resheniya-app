import { useState } from "react";
import "../styles/header.css";

export default function Header() {
  const [contactsOpen, setContactsOpen] = useState(false);

  return (
    <header className="header">
      <a href="#" className="header-logo" aria-label="4 Решения">
        <img src="/brand/logo.png" alt="4 Решения" />
      </a>

      <nav className="header-nav">
        <a href="#about">
          <i>▥</i>
          <span>О компании</span>
        </a>

        <a href="#services">
          <i>◠</i>
          <span>Услуги</span>
        </a>

        <a href="#constructor">
          <i>▱</i>
          <span>Карта решений</span>
        </a>

        <a href="#contacts">
          <i>☎</i>
          <span>Контакты</span>
        </a>
      </nav>

      <div className="header-actions">
        <a href="tel:+79999999999" className="header-phone">
          +7 (999) 999-99-99
        </a>

        <button
          type="button"
          className="header-button"
          onClick={() => setContactsOpen((prev) => !prev)}
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