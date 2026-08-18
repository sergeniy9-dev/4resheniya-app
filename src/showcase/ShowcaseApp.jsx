import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Menu,
  X,
} from 'lucide-react'
import {
  dashboardTabs,
  documentItems,
  methodSteps,
  proofCards,
  qualityItems,
  stageItems,
} from './showcaseData'
import styles from './ShowcaseApp.module.css'

const consultationUrl =
  '/?openLead=1&utm_source=showcase&utm_medium=concept&utm_campaign=project_control'

function Brand() {
  return (
    <a className={styles.brand} href="/" aria-label="4 Решения — на главную">
      <img
        className={styles.brandLogo}
        src="/brand/logo.png"
        alt="4 Решения"
      />
    </a>
  )
}

function DashboardSummary() {
  return (
    <div className={styles.summaryGrid}>
      <article className={styles.progressCard}>
        <div className={styles.progressRing} aria-label="Демо: готовность 68%">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" />
            <circle className={styles.progressRingValue} cx="60" cy="60" r="52" />
          </svg>
          <span>
            <strong>68%</strong>
            <small>готовность</small>
          </span>
        </div>
        <div>
          <span className={styles.dashboardLabel}>Текущий этап</span>
          <h3>Инженерные и скрытые работы</h3>
          <p>Следующая контрольная точка — приёмка коммуникаций.</p>
        </div>
      </article>

      <article className={styles.metricCard}>
        <Clock3 size={20} strokeWidth={1.6} />
        <span>График</span>
        <strong>По плану</strong>
        <small>Отклонения фиксируются в истории проекта</small>
      </article>

      <article className={styles.metricCard}>
        <Check size={20} strokeWidth={1.8} />
        <span>Контрольные точки</span>
        <strong>7 из 11</strong>
        <small>Демо-показатель для визуализации системы</small>
      </article>

      <article className={styles.activityCard}>
        <span className={styles.dashboardLabel}>Последнее обновление</span>
        <div className={styles.activityRow}>
          <span className={styles.activityIcon}>12</span>
          <div>
            <strong>Добавлен фотоотчёт</strong>
            <small>Инженерные узлы и трассировка</small>
          </div>
          <ChevronRight size={18} />
        </div>
        <div className={styles.activityRow}>
          <span className={styles.activityIcon}>03</span>
          <div>
            <strong>Решения ждут согласования</strong>
            <small>Все изменения собраны в одном месте</small>
          </div>
          <ChevronRight size={18} />
        </div>
      </article>
    </div>
  )
}

function DashboardStages() {
  return (
    <div className={styles.stageList}>
      {stageItems.map((item, index) => (
        <article className={styles.stageRow} key={item.title}>
          <span className={`${styles.stageIndex} ${styles[item.state]}`}>
            {item.state === 'done' ? <Check size={16} /> : `0${index + 1}`}
          </span>
          <div className={styles.stageCopy}>
            <div>
              <h3>{item.title}</h3>
              <span>{item.note}</span>
            </div>
            <strong>{item.progress}%</strong>
          </div>
          <div className={styles.stageTrack} aria-hidden="true">
            <span style={{ width: `${item.progress}%` }} />
          </div>
        </article>
      ))}
    </div>
  )
}

function DashboardQuality() {
  return (
    <div className={styles.qualityList}>
      {qualityItems.map(({ title, note, status, Icon }) => (
        <article key={title}>
          <span className={styles.qualityIcon}>
            <Icon size={21} strokeWidth={1.6} />
          </span>
          <div>
            <h3>{title}</h3>
            <p>{note}</p>
          </div>
          <strong className={status === 'Принято' ? styles.accepted : styles.pending}>
            {status}
          </strong>
        </article>
      ))}
      <div className={styles.qualityNote}>
        <span>Принцип системы</span>
        <p>
          Следующий этап открывается после проверки предыдущего и сохранения
          результата.
        </p>
      </div>
    </div>
  )
}

function DashboardDocuments() {
  return (
    <div className={styles.documentList}>
      {documentItems.map(({ title, meta, Icon }, index) => (
        <article key={title}>
          <span className={styles.documentIcon}>
            <Icon size={21} strokeWidth={1.6} />
          </span>
          <div>
            <h3>{title}</h3>
            <p>{meta}</p>
          </div>
          <span className={styles.documentVersion}>v{index + 2}.0</span>
          <ArrowUpRight size={18} />
        </article>
      ))}
      <p className={styles.documentHint}>
        В рабочей версии здесь могут храниться договор, график, чертежи, акты и
        история согласований.
      </p>
    </div>
  )
}

export default function ShowcaseApp() {
  const [activeTab, setActiveTab] = useState('summary')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.getAttribute('content')

    document.title = '4 Решения — проект под контролем · концепт'
    description?.setAttribute(
      'content',
      'Демонстрационный концепт цифровой подачи строительной компании 4 Решения.',
    )

    return () => {
      document.title = previousTitle
      if (description && previousDescription) {
        description.setAttribute('content', previousDescription)
      }
    }
  }, [])

  useEffect(() => {
    if (!window.location.hash) return undefined

    const previousScrollBehavior = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'auto'

    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector(window.location.hash)
      if (target) window.scrollTo(0, target.offsetTop)
      document.documentElement.style.scrollBehavior = previousScrollBehavior
    })

    return () => {
      window.cancelAnimationFrame(frame)
      document.documentElement.style.scrollBehavior = previousScrollBehavior
    }
  }, [])

  let dashboardContent = <DashboardSummary />
  if (activeTab === 'stages') dashboardContent = <DashboardStages />
  if (activeTab === 'quality') dashboardContent = <DashboardQuality />
  if (activeTab === 'documents') dashboardContent = <DashboardDocuments />

  return (
    <div className={styles.showcasePage}>
      <div className={styles.conceptBar}>
        <span>Концепт направления</span>
        <strong>Не публичная версия · данные интерфейса условные</strong>
      </div>

      <header className={styles.header}>
        <Brand />

        <nav className={menuOpen ? styles.navOpen : ''} aria-label="Навигация концепта">
          <a href="#proof" onClick={() => setMenuOpen(false)}>
            Подход
          </a>
          <a href="#case" onClick={() => setMenuOpen(false)}>
            Кейс
          </a>
          <a href="#control" onClick={() => setMenuOpen(false)}>
            Контроль
          </a>
          <a href="#method" onClick={() => setMenuOpen(false)}>
            Метод
          </a>
        </nav>

        <a className={styles.headerCta} href={consultationUrl}>
          Обсудить проект <ArrowUpRight size={16} />
        </a>

        <button
          className={styles.menuButton}
          type="button"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              4 Решения <span /> Проектирование и реализация
            </p>
            <h1>
              Проект,
              <br />
              который можно
              <br />
              <em>проверить.</em>
            </h1>
            <p className={styles.heroLead}>
              Одна команда связывает проект, инженерные решения, реализацию и
              комплектацию — а клиент видит понятную картину на каждом этапе.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#control">
                Смотреть систему контроля <ArrowDown size={17} />
              </a>
              <a
                className={styles.textButton}
                href="/docs/projects-album-2026.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Открыть альбом <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          <div className={styles.heroMedia}>
            <img
              src="/projects/apartment.jpg"
              alt="Визуальная концепция современного интерьера"
            />
            <div className={styles.heroImageShade} />
            <span className={styles.mediaLabel}>Визуальная концепция</span>
            <div className={styles.heroProjectCard}>
              <span>01 / направление</span>
              <strong>От красивой картинки — к доказуемому процессу</strong>
              <small>Новая цифровая подача компании</small>
            </div>
          </div>

          <a className={styles.scrollCue} href="#proof" aria-label="Перейти ниже">
            <span>Смотреть концепт</span>
            <ArrowDown size={16} />
          </a>
        </section>

        <section className={styles.proofSection} id="proof">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionNumber}>01 / Подход</p>
            <h2>
              Дорогой интерьер —
              <br />
              ещё не доказательство.
            </h2>
            <p>
              Уровень компании становится виден, когда клиент понимает не только
              результат, но и то, как команда управляет сроками, решениями и
              качеством.
            </p>
          </div>

          <div className={styles.proofGrid}>
            {proofCards.map(({ number, title, text, Icon }) => (
              <article key={number}>
                <div className={styles.proofTop}>
                  <span>{number}</span>
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.caseSection} id="case">
          <div className={styles.caseHeading}>
            <div>
              <p className={styles.sectionNumber}>02 / Пилотный кейс</p>
              <h2>Частный дом</h2>
            </div>
            <p>
              Пример того, как один проект из существующего альбома можно
              превратить из подборки изображений в понятную историю решений.
            </p>
          </div>

          <div className={styles.caseFacts}>
            <article>
              <span>Площадь</span>
              <strong>110 м²</strong>
            </article>
            <article>
              <span>Направление</span>
              <strong>Современный стиль</strong>
            </article>
            <article>
              <span>Сценарий</span>
              <strong>Нестандартные решения</strong>
            </article>
            <article>
              <span>Источник</span>
              <strong>Альбом проектов</strong>
            </article>
          </div>

          <div className={styles.caseStory}>
            <figure className={styles.planFigure}>
              <img
                src="/projects/album/page-20.jpg"
                alt="Планировка частного дома, 110 квадратных метров"
                loading="lazy"
              />
              <figcaption>
                <span>01</span>
                <div>
                  <strong>Задача и планировка</strong>
                  <small>Исходные материалы из альбома компании</small>
                </div>
              </figcaption>
            </figure>

            <div className={styles.caseNarrative}>
              <span className={styles.caseQuote}>«</span>
              <h3>
                Необычная архитектура и нишевое освещение создают особую
                атмосферу пространства.
              </h3>
              <p>
                В новой подаче кейс раскрывает не только стиль. Здесь должны
                появиться ограничения объекта, логика планировки, выбранные
                материалы, рабочие узлы и фактический результат.
              </p>
              <ul>
                <li>
                  <Check size={16} /> реальная задача клиента
                </li>
                <li>
                  <Check size={16} /> решения и зона ответственности
                </li>
                <li>
                  <Check size={16} /> сроки и бюджет план / факт
                </li>
              </ul>
            </div>

            <figure className={styles.visualFigure}>
              <img
                src="/projects/album/page-21.jpg"
                alt="Визуальные решения проекта частного дома"
                loading="lazy"
              />
              <figcaption>
                <span>02</span>
                <div>
                  <strong>Визуальное решение</strong>
                  <small>Отдельно отмечаем: визуализация или фотография</small>
                </div>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className={styles.controlSection} id="control">
          <div className={styles.controlIntro}>
            <p className={styles.sectionNumber}>03 / Цифровой контроль</p>
            <h2>
              Весь проект.
              <br />
              В одном окне.
            </h2>
            <p>
              Это демонстрация будущего клиентского интерфейса. Он превращает
              обещание «мы всё контролируем» в видимую систему.
            </p>
            <div className={styles.controlPrinciples}>
              <span>
                <Check size={15} /> статус без звонка менеджеру
              </span>
              <span>
                <Check size={15} /> единая история решений
              </span>
              <span>
                <Check size={15} /> контрольные точки качества
              </span>
            </div>
          </div>

          <div className={styles.dashboardShell}>
            <div className={styles.dashboardTopbar}>
              <div className={styles.dashboardProject}>
                <span className={styles.dashboardProjectMark}>4</span>
                <div>
                  <strong>Проект клиента</strong>
                  <small>Демонстрационный режим</small>
                </div>
              </div>
              <span className={styles.demoPill}>Данные условные</span>
            </div>

            <div className={styles.dashboardTabs} role="tablist" aria-label="Разделы проекта">
              {dashboardTabs.map((tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={activeTab === tab.id ? styles.activeTab : ''}
                  onClick={() => setActiveTab(tab.id)}
                  key={tab.id}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.dashboardContent} role="tabpanel">
              {dashboardContent}
            </div>
          </div>
        </section>

        <section className={styles.methodSection} id="method">
          <div className={styles.methodHeading}>
            <p className={styles.sectionNumber}>04 / Метод 4 Решения</p>
            <h2>Одна логика от идеи до передачи объекта.</h2>
          </div>

          <div className={styles.methodGrid}>
            {methodSteps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <div className={styles.methodLine} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.honestySection}>
          <div>
            <p className={styles.sectionNumber}>Перед публикацией</p>
            <h2>Концепт станет сильным кейсом только на реальных данных.</h2>
          </div>
          <div className={styles.honestyList}>
            <span>01</span>
            <p>Добавить фотографии процесса, скрытых работ и готового объекта.</p>
            <span>02</span>
            <p>Указать фактический срок, состав работ и план / факт бюджета.</p>
            <span>03</span>
            <p>Показать команду, ответственность и отзыв заказчика.</p>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.finalCtaImage} aria-hidden="true" />
          <div className={styles.finalCtaShade} />
          <div className={styles.finalCtaCopy}>
            <p>Следующий шаг</p>
            <h2>
              Не просто показать результат.
              <br />
              Показать уровень работы.
            </h2>
            <a href={consultationUrl}>
              Обсудить проект с руководителем <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Brand />
        <p>Демонстрационный концепт · 2026</p>
        <a href="/">
          Вернуться на текущий сайт <ArrowUpRight size={15} />
        </a>
      </footer>
    </div>
  )
}
