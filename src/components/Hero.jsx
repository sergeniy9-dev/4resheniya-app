import "../styles/hero.css";
import { trackMainCta } from "../services/analyticsService";

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-brand-bg">
        <img src="/brand/logo.png" alt="" />
      </div>

      <div className="hero-content">
        <p className="hero-eyebrow">СТРОИТЕЛЬНАЯ КОМПАНИЯ</p>

        <h1 className="hero-title">
          <span className="hero-title-line line-1">Пространство</span>
          <span className="hero-title-line line-2">начинается</span>
          <span className="hero-title-line line-3">с решения</span>
        </h1>

        <p className="hero-description">
          Проектирование, строительство и комплексная реализация
          <br />
          пространств в Москве и Московской области
        </p>

        <a
          href="#constructor"
          className="hero-button"
          onClick={() => trackMainCta("hero_constructor")}
        >
          Получить карту решений
        </a>
      </div>

      <div className="hero-features">
        <article>
          <i>◇</i>
          <span>Прозрачные сметы</span>
        </article>

        <article>
          <i>◎</i>
          <span>Точные сроки</span>
        </article>

        <article>
          <i>□</i>
          <span>Премиальные материалы</span>
        </article>

        <article>
          <i>⬢</i>
          <span>Полный цикл работ</span>
        </article>
      </div>
    </section>
  );
}
