import "../styles/header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <img src="/brand/logo.png" alt="4 Решения" />
      </div>

      <nav className="header-nav">
        <a href="#about">О компании</a>
        <a href="#services">Услуги</a>
        <a href="#constructor">Карта решений</a>
        <a href="#contacts">Контакты</a>
      </nav>

      <div className="header-actions">
        <a href="tel:+79999999999" className="header-phone">
          +7 (999) 999-99-99
        </a>

        <button className="header-button">
          Обсудить проект
        </button>
      </div>
    </header>
  );
}