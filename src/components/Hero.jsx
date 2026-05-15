import "../styles/hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-wrap">
        <div className="hero-brand-bg">
  <img src="/brand/logo.png" alt="" />
</div>

        <div className="hero-content">
          <p className="hero-eyebrow">СТРОИТЕЛЬНАЯ КОМПАНИЯ</p>

          <h1>
            Пространство
            <br />
            начинается
            <br />
            <span>с решения</span>
          </h1>

          <p className="hero-description">
            Ремонт и строительство премиум-класса
            <br />
            под ключ в Москве и МО
          </p>

          <a href="#constructor" className="hero-button">
            Получить карту решений
          </a>
        </div>
      </div>

      <div className="hero-features">
        <article>
          <i>◈</i>
          <span>Прозрачные сметы</span>
        </article>

        <article>
          <i>◎</i>
          <span>Точные сроки</span>
        </article>

        <article>
          <i>◻</i>
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