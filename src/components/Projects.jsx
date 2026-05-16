import "../styles/projects.css";

const projects = [
  {
    title: "Частный дом",
    location: "Московская область",
    subtitle: "Реализация под ключ\nс расширенной комплектацией",
    image: "/projects/house.jpg",
  },
  {
    title: "Квартира",
    location: "Москва",
    subtitle: "Спокойный минимализм\nи архитектурный свет",
    image: "/projects/apartment.jpg",
  },
  {
    title: "Коммерческое пространство",
    location: "Москва-Сити",
    subtitle: "Интерьер для бренда\nс акцентом на атмосферу",
    image: "/projects/commercial.jpg",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="projects reveal">
      <div className="projects-wrap">
        <div className="projects-head">
          <p className="eyebrow">ПРОЕКТЫ</p>

          <h2>
            Реализованные
            <br />
            пространства
          </h2>
        </div>

        <div className="projects-grid">
          {projects.map((item) => (
            <article
              className="project-card"
              key={item.title}
              style={{
                backgroundImage: `url(${item.image})`,
              }}
            >
              <div className="project-overlay"></div>

              <div className="project-content">
                <span>{item.location}</span>

                <h3>{item.title}</h3>

                <p>
                  {item.subtitle.split("\n").map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>

                <button type="button">
                  Смотреть проект
                  <i>→</i>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}