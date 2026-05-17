import { useState } from "react";
import "../styles/about.css";

export default function About() {
  const [opened, setOpened] = useState(false);

  return (
    <section id="about" className="about reveal">
      <div className="about-wrap">
        <div className="about-preview">
          <div className="about-preview-left">
            <p className="eyebrow">О КОМПАНИИ</p>

            <h2>
              Инженерные решения
              <br />
              для сложных задач
            </h2>

            <p>
              Проектируем, строим и комплектуем объекты,
где каждая деталь подчинена общей логике пространства.
            </p>

            <button
              className="about-open-button"
              onClick={() => setOpened(!opened)}
            >
              {opened ? "Скрыть информацию" : "Подробнее о компании"}
            </button>
          </div>

          <div className="about-preview-points">
            <div>
              <span>10+</span>
              <p>лет практики</p>
            </div>

            <div>
              <span>Полный цикл</span>
              <p>от проекта до сдачи</p>
            </div>

            <div>
              <span>24/7</span>
              <p>контроль проекта</p>
            </div>
          </div>
        </div>

        {opened && (
          <div className="about-expanded">
            <div
              className="about-image"
              style={{
                backgroundImage: `url("/about/about-main.jpg")`,
              }}
            ></div>

            <div className="about-content">
              <h3>
                Создаём пространство,
                <br />
                которое работает годами
              </h3>

              <p>
                Каждый объект собирается как цельная система —
                от архитектуры и инженерии
                до материалов, света и финальной реализации.
              </p>

              <div className="about-list">
                <div>Контроль каждого этапа</div>
                <div>Понятная реализация</div>
                <div>Реальные сроки</div>
                <div>Единая система работы</div>
              </div>

              <div className="about-stats">
                <div>
                  <strong>Москва и МО</strong>
                  <span>   основной регион работы</span>
                </div>

                <div>
                  <strong>Архитектурный</strong>
                  <span>   подход к реализации</span>
                </div>

                <div>
                  <strong>Полный цикл</strong>
                  <span>   от концепции до сдачи</span>
                </div>
              </div>

              <></><a href="#contacts" className="about-contact-button">
                                  <strong>Обсудить проект</strong>

              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}