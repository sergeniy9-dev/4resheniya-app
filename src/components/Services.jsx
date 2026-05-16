import "../styles/services.css";

const services = [
  {
    number: "01",
    title: "Дизайн-проект",
    text: "Планировка, визуальная концепция, материалы, свет и сценарии пространства.",
  },
  {
    number: "02",
    title: "Ремонт под ключ",
    text: "Организация работ, сметы, сроки, контроль качества и сдача объекта.",
  },
  {
    number: "03",
    title: "Строительство",
    text: "Проектирование и реализация частных домов с понятной логикой этапов.",
  },
  {
    number: "04",
    title: "Комплектация",
    text: "Подбор материалов, мебели, света и инженерных решений под бюджет.",
  },
];

export default function Services() {
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
            <article className="service-card" key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <i>→</i>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}