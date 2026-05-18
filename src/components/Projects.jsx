import { useState } from "react";
import "../styles/projects.css";
import { trackProjectClick, trackMainCta } from "../services/analyticsService";

const projects = [
  {
    title: "Частный дом",
    location: "Московская область",
    subtitle: "Реализация под ключ\nс расширенной комплектацией",
    image: "/projects/house.jpg",
    description:
      "Комплексная реализация частного дома: архитектурная логика, материалы, свет, инженерия и контроль исполнения в единой системе.",
    details: ["Под ключ", "Комплектация", "Авторский контроль"],
  },
  {
    title: "Квартира",
    location: "Москва",
    subtitle: "Спокойный минимализм\nи архитектурный свет",
    image: "/projects/apartment.jpg",
    description:
      "Интерьер с акцентом на спокойную эстетику, сценарии света, натуральные материалы и чистую организацию пространства.",
    details: ["Интерьер", "Свет", "Материалы"],
  },
  {
    title: "Коммерческое пространство",
    location: "Москва-Сити",
    subtitle: "Интерьер для бренда\nс акцентом на атмосферу",
    image: "/projects/commercial.jpg",
    description:
      "Пространство, где интерьер работает на восприятие бренда: статус, удобство, визуальная цельность и премиальная подача.",
    details: ["Бренд-среда", "Коммерция", "Атмосфера"],
  },
];

export default function Projects() {
  const [activeProject, setActiveProject] = useState(null);

  function openProject(item) {
    setActiveProject(item);
    trackProjectClick(item.title);
  }

  function closeProject() {
    setActiveProject(null);
  }

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

                <button type="button" onClick={() => openProject(item)}>
                  Смотреть проект
                  <i>→</i>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeProject && (
        <div className="project-modal" onClick={closeProject}>
          <div className="project-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="project-modal-close"
              onClick={closeProject}
            >
              ×
            </button>

            <div
              className="project-modal-image"
              style={{
                backgroundImage: `url(${activeProject.image})`,
              }}
            ></div>

            <div className="project-modal-content">
              <p className="eyebrow">{activeProject.location}</p>

              <h3>{activeProject.title}</h3>

              <p>{activeProject.description}</p>

              <div className="project-modal-tags">
                {activeProject.details.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <a
                href="#contacts"
                className="project-modal-button"
                onClick={() => {
                  trackMainCta("project_modal");
                  closeProject();
                }}
              >
                Обсудить похожий проект
                <i>→</i>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}