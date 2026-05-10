import "../styles/hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-noise" />
      <div className="hero-light hero-light-one" />
      <div className="hero-light hero-light-two" />

      <header className="header">
        <div className="logo">
          <div className="logo-box">4</div>

          <div>
            <b>4РЕШЕНИЯ</b>
            <span>ремонт · дизайн · комплектация</span>
          </div>
        </div>

        <nav>
          <a>Проекты</a>
          <a>Карта решений</a>
          <a>White Box</a>
          <a>Этапы</a>
          <a>Контакты</a>
        </nav>

        <button>Получить карту</button>
      </header>

      <div className="hero-inner">
        <div className="hero-content">
          <p className="eyebrow">МЕТОД 4РЕШЕНИЯ</p>

          <h1>
            Пространство
            <span>начинается</span>
            с решения
          </h1>

          <p className="hero-text">
            Интерактивная карта показывает 4 сценария будущего пространства:
            рациональный, эстетический, статусный и персональный — до начала проекта.
          </p>

          <div className="hero-actions">
            <button
              className="primary"
              onClick={() =>
                document.querySelector("#constructor")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Открыть карту решений
            </button>

            <button className="secondary">Смотреть проекты</button>
          </div>

          <div className="hero-metrics">
            <div>
              <b>10+</b>
              <span>лет опыта</span>
            </div>

            <div>
              <b>150+</b>
              <span>реализованных проектов</span>
            </div>

            <div>
              <b>4</b>
              <span>сценария решений</span>
            </div>
          </div>
        </div>

        <div className="hero-stage">
          <div className="stage-grid" />

          <div className="glass-card main-scenario">
            <p>01 · Базовый сценарий</p>
            <h3>Рациональный сценарий</h3>
            <span>
              Материалы, детализация, комплектация и сильное первое впечатление.
            </span>

            <div className="scenario-lines">
              <i />
              <i />
              <i />
            </div>
          </div>

         <div className="glass-card mini-card card-a">
  <small>02</small>
  <b>Рационально</b>
</div>

<div className="glass-card mini-card card-c">
  <small>03</small>
  <b>Персонально</b>
</div>

<div className="glass-card mini-card card-b">
  <small>04</small>
  <b>Эстетично</b>
</div>

          
        </div>
      </div>
    </section>
  );
}