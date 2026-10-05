import { config, collection, singleton, fields } from '@keystatic/core';

// Локально без GitHub админка пишет файлы прямо в проект.
// С GitHub — сохраняет изменения в репозиторий, после чего Vercel пересобирает сайт.
const githubRepo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO as `${string}/${string}` | undefined;

const caseImage = (label: string, description?: string) =>
  fields.image({
    label,
    description,
    directory: 'src/assets/cases',
    publicPath: '../../assets/cases/',
  });

const siteImage = (label: string, description?: string) =>
  fields.image({
    label,
    description,
    directory: 'src/assets/site',
    publicPath: '../assets/site/',
  });

const textHint =
  'Пустая строка — новый абзац. Строка, которая начинается с «- », станет пунктом списка.';

type TextOpts = { description?: string; multiline?: boolean; defaultValue?: string };

// Пара полей «по-русски + по-английски». Если английское пустое — на /en показывается русское.
function tr<K extends string>(key: K, label: string, opts: TextOpts = {}) {
  return {
    [key]: fields.text({ label, ...opts }),
    [`${key}En`]: fields.text({
      label: `${label} (EN)`,
      multiline: opts.multiline,
      description: 'Английская версия. Можно оставить пустым — тогда будет русский текст',
    }),
  } as Record<K | `${K}En`, ReturnType<typeof fields.text>>;
}

export default config({
  storage: githubRepo ? { kind: 'github', repo: githubRepo } : { kind: 'local' },
  locale: 'ru-RU',
  ui: {
    brand: { name: 'Портфолио' },
    navigation: {
      'Контент': ['cases'],
      'Страницы': ['settings', 'about', 'privacy'],
    },
  },

  collections: {
    cases: collection({
      label: 'Кейсы',
      slugField: 'title',
      path: 'src/content/cases/*',
      format: { data: 'yaml' },
      columns: ['title', 'year'],
      entryLayout: 'form',
      schema: {
        title: fields.slug({
          name: { label: 'Название проекта', validation: { isRequired: true } },
          slug: {
            label: 'Адрес страницы',
            description: 'Латиницей, без пробелов. Например: dokrutim → amineva.ru/cases/dokrutim',
          },
        }),
        titleEn: fields.text({ label: 'Название проекта (EN)' }),
        published: fields.checkbox({
          label: 'Показывать на сайте',
          description: 'Сними галочку, чтобы спрятать кейс (черновик)',
          defaultValue: true,
        }),
        order: fields.integer({
          label: 'Порядок',
          description: 'Чем меньше число, тем выше кейс на главной',
          defaultValue: 10,
        }),
        year: fields.text({ label: 'Год', validation: { isRequired: true } }),
        ...tr('direction', 'Направление', { description: 'Например: B2C, недвижимость' }),
        ...tr('summary', 'Короткое описание для карточки', {
          description: '1–2 предложения, видно на главной',
          multiline: true,
        }),
        ...tr('lead', 'Главная мысль кейса', {
          description: 'Крупный текст в начале страницы кейса',
          multiline: true,
        }),
        ...tr('role', 'Роль', { description: 'Например: продуктовый дизайнер' }),
        ...tr('duration', 'Срок', { description: 'Например: 3 месяца' }),
        ...tr('team', 'Команда', { multiline: true }),
        metrics: fields.array(
          fields.object({
            value: fields.text({ label: 'Цифра', description: 'Например: +40%' }),
            ...tr('label', 'Что это', { description: 'Например: CTR рекламы' }),
          }),
          {
            label: 'Результаты в цифрах',
            description: 'Видны на карточке и в начале кейса. Лучше 2–3 штуки',
            itemLabel: (props) => `${props.fields.value.value} — ${props.fields.label.value}`,
          }
        ),
        cardImage: caseImage('Обложка на главной', 'Квадратная (или близкая к квадрату), например 1600×1600'),
        cardPosition: fields.select({
          label: 'Как обрезать обложку',
          description: 'Обложка на главной квадратная. Если важное (текст, логотип) у края — прижми к этому краю',
          options: [
            { label: 'По центру', value: 'center' },
            { label: 'Прижать влево', value: 'left' },
            { label: 'Прижать вправо', value: 'right' },
          ],
          defaultValue: 'center',
        }),
        cardImage2: caseImage('Картинка карточки 2', 'Сейчас не используется'),
        coverVideo: fields.file({
          label: 'Видео на обложку',
          description: 'Необязательно. MP4 без звука, квадратное, до 5 МБ. Если загружено — на главной вместо обложки крутится видео',
          directory: 'public/video/cases',
          publicPath: '/video/cases/',
        }),
        cardVideo: fields.url({
          label: 'Видео вместо картинки 2',
          description: 'Ссылка на Kinescope (embed). Если заполнено — показывается вместо картинки 2',
        }),
        heroImage: caseImage('Обложка внутри кейса', 'Большая картинка в начале страницы кейса'),
        blocks: fields.blocks(
          {
            section: {
              label: 'Текст с заголовком',
              itemLabel: (props) => props.fields.heading.value || 'Текст',
              schema: fields.object({
                ...tr('heading', 'Заголовок', { description: 'Например: Исследование' }),
                ...tr('text', 'Текст', { multiline: true, description: textHint }),
                inNav: fields.checkbox({
                  label: 'Показывать в оглавлении слева',
                  defaultValue: true,
                }),
              }),
            },
            image: {
              label: 'Картинка',
              itemLabel: (props) => props.fields.caption.value || 'Картинка',
              schema: fields.object({
                image: caseImage('Картинка'),
                ...tr('alt', 'Что на картинке', { description: 'Для поисковиков и незрячих' }),
                ...tr('caption', 'Подпись под картинкой'),
                wide: fields.checkbox({
                  label: 'Во всю ширину экрана',
                  defaultValue: false,
                }),
              }),
            },
            pair: {
              label: 'Две картинки рядом',
              schema: fields.object({
                left: caseImage('Левая'),
                right: caseImage('Правая'),
                ...tr('caption', 'Подпись'),
              }),
            },
            marquee: {
              label: 'Бегущая лента',
              itemLabel: (props) =>
                `Бегущая лента · ${props.fields.images.elements.length} шт.` +
                (props.fields.frame.value === 'phone' ? ' · в рамке телефона' : ''),
              schema: fields.object({
                images: fields.array(caseImage('Картинка'), {
                  label: 'Картинки',
                  description: 'Лучше 4–8 штук. Для рамки телефона — вертикальные скриншоты экранов',
                }),
                frame: fields.select({
                  label: 'Рамка',
                  options: [
                    { label: 'Без рамки (квадратные карточки)', value: 'none' },
                    { label: 'Телефон (для экранов интерфейса)', value: 'phone' },
                  ],
                  defaultValue: 'none',
                }),
                reverse: fields.checkbox({ label: 'Ехать в обратную сторону', defaultValue: false }),
                ...tr('caption', 'Подпись'),
              }),
            },
            video: {
              label: 'Видео',
              schema: fields.object({
                url: fields.url({ label: 'Ссылка на видео (Kinescope / YouTube embed)' }),
                ...tr('caption', 'Подпись'),
              }),
            },
            quote: {
              label: 'Цитата / инсайт',
              schema: fields.object({
                ...tr('text', 'Текст', { multiline: true }),
                ...tr('author', 'Кто сказал', { description: 'Необязательно' }),
              }),
            },
          },
          { label: 'Содержимое кейса' }
        ),
      },
    }),
  },

  singletons: {
    settings: singleton({
      label: 'Главная и контакты',
      path: 'src/content/settings',
      format: { data: 'yaml' },
      schema: {
        ...tr('name', 'Имя и фамилия'),
        ...tr('role', 'Роль', { description: 'Например: Продуктовый дизайнер' }),
        ...tr('greeting', 'Приветствие', { defaultValue: 'Привет!' }),
        ...tr('intro', 'О себе в двух строках', { multiline: true }),
        ...tr('location', 'Где живу', { description: '~~текст~~ — зачёркнутый' }),
        openToWork: fields.checkbox({ label: 'Ищу работу (зелёная точка в шапке)', defaultValue: true }),
        ...tr('statusText', 'Текст статуса', { defaultValue: 'Открыта к full-time и контрактной работе' }),
        heroPhoto2: siteImage('Фото на главной'),
        email: fields.text({ label: 'E-mail' }),
        telegram: fields.text({ label: 'Telegram', description: 'Без @' }),
        resumeFile: fields.file({
          label: 'Резюме (PDF)',
          directory: 'public/files',
          publicPath: '/files/',
        }),
        resumeUrl: fields.url({
          label: 'Ссылка на резюме',
          description: 'Если PDF не загружен — используется эта ссылка',
        }),
        resumeFileEn: fields.file({
          label: 'Резюме на английском (PDF)',
          description: 'Необязательно. Если нет — в английской версии будет русское резюме',
          directory: 'public/files',
          publicPath: '/files/',
        }),
        resumeUrlEn: fields.url({ label: 'Ссылка на резюме на английском' }),
        socials: fields.array(
          fields.object({
            ...tr('label', 'Название'),
            url: fields.url({ label: 'Ссылка' }),
          }),
          { label: 'Соцсети', itemLabel: (props) => props.fields.label.value }
        ),
      },
    }),

    about: singleton({
      label: 'Обо мне',
      path: 'src/content/about',
      format: { data: 'yaml' },
      schema: {
        ...tr('headline', 'Заголовок', { multiline: true }),
        ...tr('text', 'Текст', { multiline: true, description: textHint }),
        ...tr('hobbies', 'Помимо дизайна', { multiline: true }),
        ...tr('languages', 'Языки', { description: 'Например: Английский — B2. Видно на главной в блоке «Стек»' }),
        photos: fields.array(siteImage('Фото'), { label: 'Фотографии', description: 'Показываются первые 2, вертикальные (4:5). Ч/б, цветные при наведении' }),
        experience: fields.array(
          fields.object({
            ...tr('period', 'Период', { description: 'Например: 2024 — сейчас' }),
            ...tr('company', 'Компания'),
            ...tr('role', 'Должность'),
            ...tr('text', 'Что делала', { multiline: true }),
          }),
          {
            label: 'Опыт работы',
            itemLabel: (props) => `${props.fields.period.value} · ${props.fields.company.value}`,
          }
        ),
        skills: fields.array(
          fields.object({
            ...tr('title', 'Группа'),
            ...tr('items', 'Навыки', { multiline: true, description: 'Каждый с новой строки' }),
          }),
          { label: 'Навыки', itemLabel: (props) => props.fields.title.value }
        ),
        softSkills: fields.array(
          fields.object({
            ...tr('title', 'Название', { description: 'Например: Коммуникация' }),
            ...tr('text', 'Описание', { multiline: true }),
          }),
          { label: 'Soft-скиллы', itemLabel: (props) => props.fields.title.value }
        ),
        tools: fields.array(
          fields.object({
            ...tr('name', 'Инструмент'),
            ...tr('details', 'Что умею'),
          }),
          { label: 'Инструменты', itemLabel: (props) => props.fields.name.value }
        ),
      },
    }),

    privacy: singleton({
      label: 'Политика конфиденциальности',
      path: 'src/content/privacy',
      format: { data: 'yaml' },
      schema: {
        ...tr('title', 'Заголовок'),
        ...tr('text', 'Текст', {
          multiline: true,
          description: 'Строка, которая начинается с «## », станет подзаголовком. ' + textHint,
        }),
      },
    }),
  },
});
