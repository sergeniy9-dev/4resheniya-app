import {
  Camera,
  ChartNoAxesCombined,
  CircleCheckBig,
  FileText,
  FolderCheck,
  Layers3,
  Ruler,
  ShieldCheck,
} from 'lucide-react'

export const proofCards = [
  {
    number: '01',
    title: 'План / факт',
    text: 'Клиент видит этапы, контрольные даты и реальное состояние проекта.',
    Icon: ChartNoAxesCombined,
  },
  {
    number: '02',
    title: 'История решений',
    text: 'Согласования, изменения и ответственность не теряются в переписке.',
    Icon: FolderCheck,
  },
  {
    number: '03',
    title: 'Контроль качества',
    text: 'Скрытые работы и ключевые узлы фиксируются до следующего этапа.',
    Icon: ShieldCheck,
  },
  {
    number: '04',
    title: 'Фотоотчёты',
    text: 'У заказчика есть понятная хронология работ, а не набор сообщений.',
    Icon: Camera,
  },
]

export const dashboardTabs = [
  { id: 'summary', label: 'Сводка' },
  { id: 'stages', label: 'Этапы' },
  { id: 'quality', label: 'Качество' },
  { id: 'documents', label: 'Документы' },
]

export const stageItems = [
  {
    state: 'done',
    title: 'Концепция и планировка',
    note: 'Согласовано',
    progress: 100,
  },
  {
    state: 'done',
    title: 'Рабочая документация',
    note: 'Передано в производство',
    progress: 100,
  },
  {
    state: 'active',
    title: 'Инженерные и скрытые работы',
    note: 'Текущий этап',
    progress: 68,
  },
  {
    state: 'next',
    title: 'Чистовая отделка',
    note: 'Следующий этап',
    progress: 12,
  },
]

export const qualityItems = [
  {
    title: 'Геометрия поверхностей',
    note: 'Проверка завершена',
    status: 'Принято',
    Icon: Ruler,
  },
  {
    title: 'Инженерные узлы',
    note: 'Фотофиксация добавлена',
    status: 'Принято',
    Icon: Layers3,
  },
  {
    title: 'Скрытые работы',
    note: 'Ожидает контрольной точки',
    status: 'В работе',
    Icon: ShieldCheck,
  },
]

export const documentItems = [
  {
    title: 'Рабочая документация',
    meta: 'Комплект чертежей · актуальная версия',
    Icon: FileText,
  },
  {
    title: 'Ведомость комплектации',
    meta: 'Материалы, мебель и оборудование',
    Icon: FolderCheck,
  },
  {
    title: 'Акт контрольной точки',
    meta: 'Инженерные и скрытые работы',
    Icon: CircleCheckBig,
  },
]

export const methodSteps = [
  {
    number: '01',
    title: 'Проектируем',
    text: 'Фиксируем сценарий, планировку, материалы и инженерные решения.',
  },
  {
    number: '02',
    title: 'Собираем',
    text: 'Связываем смету, график, поставки и рабочую документацию.',
  },
  {
    number: '03',
    title: 'Реализуем',
    text: 'Ведём работы по контрольным точкам с фотофиксацией.',
  },
  {
    number: '04',
    title: 'Передаём',
    text: 'Закрываем замечания, комплектуем и сдаём готовое пространство.',
  },
]
