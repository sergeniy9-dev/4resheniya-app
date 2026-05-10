import { useEffect, useState } from "react";
import "../styles/constructor.css";

import { constructorSteps, recommendations } from "../data/solutions";
import { atmosphereThemes } from "../data/themes";
import { sendLeadToCRM } from "../services/leadService";
import { trackEvent } from "../services/analyticsService";

export default function Constructor() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(false);
  const [visible, setVisible] = useState(false);

  const [form, setForm] = useState({
    name: "",
    contact: "",
  });

  const [answers, setAnswers] = useState({
    object: "",
    priority: "",
    mood: "",
    level: "",
  });

  const current = constructorSteps[step];
  const selected = answers[current.key];

  const recommendation =
    recommendations[answers.priority] || recommendations.default;

  const activeTheme =
    atmosphereThemes[answers.mood] || atmosphereThemes.default;

  useEffect(() => {
    const section = document.querySelector("#constructor");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  function selectOption(value) {
    setAnswers((prev) => ({
      ...prev,
      [current.key]: value,
    }));

    trackEvent("constructor_select", {
      step: current.key,
      value,
    });
  }

  function nextStep() {
    if (!selected) return;

    if (step < constructorSteps.length - 1) {
      setStep(step + 1);
      return;
    }

    trackEvent("constructor_completed", {
      ...answers,
      recommendation,
    });

    setResult(true);
  }

  function prevStep() {
    if (result) {
      setResult(false);
      return;
    }

    if (step > 0) {
      setStep(step - 1);
    }
  }

  async function handleLeadSubmit() {
    if (!form.name || !form.contact) {
      alert("Введите имя и телефон или Telegram.");
      return;
    }

    const lead = {
      name: form.name,
      contact: form.contact,
      ...answers,
      recommendation,
    };

    trackEvent("lead_form_submit", lead);

    await sendLeadToCRM(lead);

    alert("Заявка собрана. Специалист свяжется с вами.");
  }

  return (
    <section
      id="constructor"
      className={
        visible
          ? `constructor constructor-visible ${activeTheme.className}`
          : `constructor ${activeTheme.className}`
      }
    >
      <div className="constructor-bg"></div>

      <div className="constructor-wrap">
        <div className="constructor-title reveal-item reveal-1">
          <p className="eyebrow">МЕТОД 4РЕШЕНИЯ</p>
          <h2>Получите карту решений</h2>
          <span>
            Это не бесплатный дизайн-проект, а предварительная карта 4 сценариев:
            как можно подойти к вашему пространству до начала работ.
          </span>
        </div>

        <div className="constructor-layout">
          <div className="constructor-main reveal-item reveal-2">
            {!result ? (
              <div className="step-screen" key={step}>
                <div className="constructor-head">
                  <div>
                    <p className="eyebrow">
                      Шаг {step + 1} из {constructorSteps.length}
                    </p>
                    <h3>{current.title}</h3>
                    <span>{current.desc}</span>
                  </div>

                  <div className="progress">
                    {constructorSteps.map((_, index) => (
                      <i
                        key={index}
                        className={index <= step ? "active" : ""}
                      ></i>
                    ))}
                  </div>
                </div>

                <div className="option-grid">
                  {current.options.map(([title, desc], index) => (
                    <button
                      key={title}
                      className={
                        answers[current.key] === title
                          ? "constructor-card active"
                          : "constructor-card"
                      }
                      onClick={() => selectOption(title)}
                    >
                      <span>0{index + 1}</span>
                      <b>{title}</b>
                      <small>{desc}</small>

                      {answers[current.key] === title && (
                        <em className="check">✓</em>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="result-view result-premium">
                <p className="eyebrow">Ваша карта решений</p>
                <h3>Мы подготовили 4 сценария</h3>

                <p className="result-text">
                  На основе выбора: {answers.object}, приоритет «
                  {answers.priority}», атмосфера «{answers.mood}», уровень «
                  {answers.level}».
                </p>

                <div className="recommendation">
                  <span>Рекомендованный сценарий</span>
                  <h4>{recommendation}</h4>
                  <p>
                    Для точной оценки нужны планировка, площадь, бюджет и сроки.
                    Менеджер уточнит детали после заявки.
                  </p>
                </div>

                <div className="result-grid">
                  <article>
                    <span>01</span>
                    <b>Рациональное</b>
                    <p>Смета, сроки и практичные материалы.</p>
                  </article>

                  <article>
                    <span>02</span>
                    <b>Эстетическое</b>
                    <p>Свет, фактуры и визуальная цельность.</p>
                  </article>

                  <article>
                    <span>03</span>
                    <b>Статусное</b>
                    <p>Материалы, детали и комплектация.</p>
                  </article>

                  <article>
                    <span>04</span>
                    <b>Под вас</b>
                    <p>Сценарий под образ жизни и задачи.</p>
                  </article>
                </div>
              </div>
            )}

            <div className="constructor-actions">
              <button
                className="constructor-secondary"
                onClick={prevStep}
                disabled={step === 0 && !result}
              >
                ← Назад
              </button>

              {!result && (
                <button
                  className={
                    selected
                      ? "constructor-primary ready"
                      : "constructor-primary disabled"
                  }
                  onClick={nextStep}
                >
                  {step === constructorSteps.length - 1
                    ? "Получить карту"
                    : "Далее"}{" "}
                  →
                </button>
              )}
            </div>
          </div>

          <aside className="constructor-side reveal-item reveal-3">
            <p className="eyebrow">Ваш выбор</p>

            <div className="summary-list">
              <Summary label="Объект" value={answers.object} />
              <Summary label="Приоритет" value={answers.priority} />
              <Summary label="Атмосфера" value={answers.mood} />
              <Summary label="Уровень" value={answers.level} />
            </div>

            <div className="atmosphere-preview">
              <div className="atmosphere-visual">
                <i></i>
                <i></i>
                <i></i>
              </div>

              <div className="atmosphere-copy">
                <span>Атмосфера</span>
                <h4>{activeTheme.label}</h4>
                <p>{activeTheme.note}</p>
                <small>{activeTheme.material}</small>
              </div>
            </div>

            <form className={result ? "lead-form active" : "lead-form"}>
              <h3>Оставьте контакт</h3>
              <p>
                Специалист перезвонит, уточнит детали и подскажет следующий шаг.
              </p>

              <input
                placeholder="Ваше имя"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              <input
                placeholder="Телефон или Telegram"
                value={form.contact}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, contact: e.target.value }))
                }
              />

              <button type="button" onClick={handleLeadSubmit}>
                Жду звонка
              </button>

              <small>Выбор из конструктора будет передан в CRM.</small>
            </form>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Summary({ label, value }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <b>{value || "—"}</b>
    </div>
  );
}