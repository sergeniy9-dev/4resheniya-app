import { useEffect, useRef, useState } from "react";
import "../styles/projects.css";
import {
  trackMainCta,
  trackProjectClick,
} from "../services/analyticsService";

const ALBUM_PAGE_COUNT = 28;
const ALBUM_PDF_URL = "/docs/projects-album-2026.pdf";

const albumPages = Array.from(
  { length: ALBUM_PAGE_COUNT },
  (_, index) =>
    `/projects/album/page-${String(index + 1).padStart(2, "0")}.jpg`,
);

const albumHighlights = [
  { page: 0, className: "album-sheet-cover" },
  { page: 20, className: "album-sheet-left" },
  { page: 22, className: "album-sheet-right" },
];

const projects = [
  {
    title: "Частный дом",
    location: "Московская область",
    subtitle: "Комплексная реализация\nи расширенная комплектация",
    image: "/projects/house.jpg",
    description:
      "Комплексная реализация частного дома: архитектурная логика, материалы, свет, инженерия и контроль исполнения в единой системе.",
    details: ["Реализация", "Комплектация", "Авторский контроль"],
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
  const touchStartX = useRef(null);
  const [activeProject, setActiveProject] = useState(null);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [albumPage, setAlbumPage] = useState(0);

  useEffect(() => {
    if (!activeProject && !albumOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setActiveProject(null);
        setAlbumOpen(false);
      }

      if (!albumOpen) {
        return;
      }

      if (event.key === "ArrowRight") {
        setAlbumPage((current) => (current + 1) % ALBUM_PAGE_COUNT);
      }

      if (event.key === "ArrowLeft") {
        setAlbumPage(
          (current) =>
            (current - 1 + ALBUM_PAGE_COUNT) % ALBUM_PAGE_COUNT,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject, albumOpen]);

  function openProject(item) {
    setActiveProject(item);
    trackProjectClick(item.title);
  }

  function closeProject() {
    setActiveProject(null);
  }

  function openAlbum(startPage = 0, place = "projects_showcase") {
    setAlbumPage(Math.min(Math.max(startPage, 0), ALBUM_PAGE_COUNT - 1));
    setActiveProject(null);
    setAlbumOpen(true);
    trackMainCta(place);
  }

  function closeAlbum() {
    setAlbumOpen(false);
  }

  function showPreviousAlbumPage() {
    setAlbumPage(
      (current) => (current - 1 + ALBUM_PAGE_COUNT) % ALBUM_PAGE_COUNT,
    );
  }

  function showNextAlbumPage() {
    setAlbumPage((current) => (current + 1) % ALBUM_PAGE_COUNT);
  }

  function handleAlbumTouchStart(event) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleAlbumTouchEnd(event) {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 48) {
      return;
    }

    if (distance < 0) {
      showNextAlbumPage();
    } else {
      showPreviousAlbumPage();
    }
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

        <div className="album-showcase">
          <div className="album-showcase-copy">
            <p className="eyebrow">АЛЬБОМ ПРОЕКТОВ · 2026</p>

            <h3>Реальные пространства — от планировки до деталей</h3>

            <p className="album-showcase-lead">
              Собрали в одном альбоме планировки, визуальные концепции и
              интерьерные решения реализованных объектов Москвы и Московской
              области.
            </p>

            <div className="album-facts" aria-label="Состав альбома">
              <div>
                <strong>13</strong>
                <span>проектов</span>
              </div>
              <div>
                <strong>28</strong>
                <span>страниц</span>
              </div>
              <div>
                <strong>42–110 м²</strong>
                <span>площадь объектов</span>
              </div>
            </div>

            <div className="album-showcase-actions">
              <button
                type="button"
                className="album-primary-button"
                onClick={() => openAlbum(0)}
              >
                Смотреть альбом <i>→</i>
              </button>

              <a
                href={ALBUM_PDF_URL}
                className="album-secondary-button"
                download
                onClick={() => trackMainCta("project_album_download")}
              >
                Скачать PDF
              </a>
            </div>
          </div>

          <button
            type="button"
            className="album-showcase-visual"
            onClick={() => openAlbum(0, "projects_showcase_visual")}
            aria-label="Открыть альбом реализованных проектов"
          >
            <span className="album-visual-glow"></span>

            {albumHighlights.map((item) => (
              <span className={`album-sheet ${item.className}`} key={item.page}>
                <img
                  src={albumPages[item.page]}
                  alt={
                    item.page === 0
                      ? "Обложка альбома реализованных проектов"
                      : `Разворот альбома, страница ${item.page + 1}`
                  }
                  loading="lazy"
                />
              </span>
            ))}

            <span className="album-open-hint">Открыть 28 страниц</span>
          </button>
        </div>
      </div>

      {activeProject && (
        <div className="project-modal" onClick={closeProject}>
          <div
            className="project-modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={activeProject.title}
          >
            <button
              type="button"
              className="project-modal-close"
              onClick={closeProject}
              aria-label="Закрыть"
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

              <button
                type="button"
                className="project-modal-button"
                onClick={() => openAlbum(0, "project_modal_album")}
              >
                Смотреть все наши проекты
                <i>→</i>
              </button>
            </div>
          </div>
        </div>
      )}

      {albumOpen && (
        <div className="album-viewer" onClick={closeAlbum}>
          <div
            className="album-viewer-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Альбом реализованных проектов"
          >
            <div className="album-viewer-toolbar">
              <div className="album-viewer-brand">
                <img src="/brand/logo.png" alt="4 Решения" />
                <div>
                  <strong>Альбом реализованных проектов</strong>
                  <span>
                    Страница {albumPage + 1} из {ALBUM_PAGE_COUNT}
                  </span>
                </div>
              </div>

              <div className="album-viewer-actions">
                <a
                  href={ALBUM_PDF_URL}
                  download
                  onClick={() => trackMainCta("album_viewer_download")}
                >
                  Скачать PDF
                </a>

                <button type="button" onClick={closeAlbum} aria-label="Закрыть">
                  ×
                </button>
              </div>
            </div>

            <div
              className="album-viewer-stage"
              onTouchStart={handleAlbumTouchStart}
              onTouchEnd={handleAlbumTouchEnd}
            >
              <button
                type="button"
                className="album-viewer-arrow album-viewer-arrow-left"
                onClick={showPreviousAlbumPage}
                aria-label="Предыдущая страница"
              >
                ←
              </button>

              <img
                className="album-viewer-page"
                src={albumPages[albumPage]}
                alt={`Альбом реализованных проектов, страница ${albumPage + 1}`}
              />

              <button
                type="button"
                className="album-viewer-arrow album-viewer-arrow-right"
                onClick={showNextAlbumPage}
                aria-label="Следующая страница"
              >
                →
              </button>
            </div>

            <div className="album-viewer-filmstrip" aria-label="Страницы альбома">
              {albumPages.map((page, index) => (
                <button
                  type="button"
                  className={index === albumPage ? "is-active" : ""}
                  onClick={() => setAlbumPage(index)}
                  key={page}
                  aria-label={`Открыть страницу ${index + 1}`}
                >
                  <img src={page} alt="" loading="lazy" />
                  <span>{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
