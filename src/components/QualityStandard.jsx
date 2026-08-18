import { useState } from "react";
import {
  Cable,
  Camera,
  ClipboardCheck,
  FileCheck2,
  Layers3,
  Ruler,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { trackMainCta } from "../services/analyticsService";
import "../styles/quality-standard.css";

const qualityPrinciples = [
  {
    number: "01",
    title: "Рабочая документация",
    text: "Сверяем планировки, узлы, материалы и инженерные решения до начала соответствующего этапа работ.",
    Icon: FileCheck2,
  },
  {
    number: "02",
    title: "Геометрия поверхностей",
    text: "Проверяем плоскости, вертикали, горизонтали, углы и проёмы до перехода к чистовой отделке.",
    Icon: Ruler,
  },
  {
    number: "03",
    title: "Инженерные узлы",
    text: "Координируем электрику, сантехнику, вентиляцию и оборудование с проектом и будущей отделкой.",
    Icon: Cable,
  },
  {
    number: "04",
    title: "Скрытые работы",
    text: "Принимаем и фиксируем важные этапы до того, как коммуникации и конструкции будут закрыты.",
    Icon: Camera,
  },
  {
    number: "05",
    title: "Стыки и примыкания",
    text: "Отдельно контролируем сопряжения материалов, теневые швы, плинтусы, раскладки и запилы под 45°.",
    Icon: Layers3,
  },
  {
    number: "06",
    title: "Защита результата",
    text: "Готовые поверхности, мебель и оборудование защищаются до завершения последующих работ на объекте.",
    Icon: ShieldCheck,
  },
  {
    number: "07",
    title: "Контрольные точки",
    text: "Каждый этап проходит промежуточную проверку до допуска следующей бригады или вида работ.",
    Icon: Workflow,
  },
  {
    number: "08",
    title: "Финальная приёмка",
    text: "Формируем перечень замечаний, устраняем их и передаём объект после итоговой проверки и комплектации.",
    Icon: ClipboardCheck,
  },
];

export default function QualityStandard() {
  const [expanded, setExpanded] = useState(false);
  const visiblePrinciples = expanded
    ? qualityPrinciples
    : qualityPrinciples.slice(0, 4);

  function toggleExpanded() {
    const nextValue = !expanded;
    setExpanded(nextValue);
    trackMainCta(nextValue ? "quality_standard_open" : "quality_standard_close");
  }

  return (
    <section id="quality" className="quality-standard reveal">
      <div className="quality-standard-wrap">
        <div className="quality-standard-head">
          <div>
            <p className="eyebrow">СТАНДАРТ КАЧЕСТВА · 4 РЕШЕНИЯ</p>
            <h2>
              Качество,
              <br />
              которое можно проверить
            </h2>
          </div>

          <p>
            Для нас качество — не впечатление в финале, а система контрольных
            точек: от рабочей документации и скрытых работ до итоговой приёмки
            объекта.
          </p>
        </div>

        <div className="quality-standard-layout">
          <div
            className="quality-standard-visual"
            style={{ backgroundImage: 'url("/services/repair.jpg")' }}
          >
            <div className="quality-standard-visual-overlay"></div>

            <div className="quality-standard-visual-content">
              <span>ПРИНЦИП РАБОТЫ</span>
              <strong>
                Проверяем результат
                <br />
                до следующего этапа
              </strong>

              <div className="quality-standard-route">
                <span>Документация</span>
                <i>→</i>
                <span>Контроль</span>
                <i>→</i>
                <span>Приёмка</span>
              </div>
            </div>
          </div>

          <div className="quality-principles">
            {visiblePrinciples.map(({ number, title, text, Icon }) => (
              <article className="quality-principle" key={number}>
                <div className="quality-principle-top">
                  <span>{number}</span>
                  <i>
                    <Icon size={21} strokeWidth={1.7} />
                  </i>
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="quality-standard-actions">
          <button type="button" onClick={toggleExpanded}>
            {expanded ? "Свернуть стандарт" : "Смотреть весь стандарт"}
            <i>{expanded ? "↑" : "↓"}</i>
          </button>

          <a
            href="#contacts"
            onClick={() => trackMainCta("quality_standard_consultation")}
          >
            Обсудить контроль вашего проекта <i>→</i>
          </a>
        </div>
      </div>
    </section>
  );
}
