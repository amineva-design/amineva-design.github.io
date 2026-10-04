import { config, collection, singleton, fields } from '@keystatic/core';

// Локально админка пишет файлы прямо в проект.
// На сайте — сохраняет изменения в GitHub, после чего Vercel пересобирает сайт.
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

export default config({
  storage: githubRepo ? { kind: 'github', repo: githubRepo } : { kind: 'local' },
  locale: 'ru-RU',
  ui: {
    brand: { name: 'Портфолио' },
    navigation: {
      'Контент': ['cases'],
      'Страницы': ['settings', 'about'],
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
        direction: fields.text({ label: 'Направление', description: 'Например: B2C, недвижимость' }),
        summary: fields.text({
          label: 'Короткое описание для карточки',
          description: '1–2 предложения, видно на главной',
          multiline: true,
        }),
        lead: fields.text({
          label: 'Главная мысль кейса',
          description: 'Крупный текст в начале страницы кейса',
          multiline: true,
        }),
        role: fields.text({ label: 'Роль', description: 'Например: продуктовый дизайнер' }),
        duration: fields.text({ label: 'Срок', description: 'Например: 3 месяца' }),
        team: fields.text({ label: 'Команда', multiline: true }),
        metrics: fields.array(
          fields.object({
            value: fields.text({ label: 'Цифра', description: 'Например: +40%' }),
            label: fields.text({ label: 'Что это', description: 'Например: CTR рекламы' }),
          }),
          {
            label: 'Результаты в цифрах',
            description: 'Видны на карточке и в начале кейса. Лучше 2–3 штуки',
            itemLabel: (props) => `${props.fields.value.value} — ${props.fields.label.value}`,
          }
        ),
        cardImage: caseImage('Картинка карточки 1', 'Квадратная, показывается на главной'),
        cardImage2: caseImage('Картинка карточки 2', 'Необязательно. На телефоне не показывается'),
        cardVideo: fields.url({
          label: 'Видео вместо картинки 2',
          description: 'Ссылка на Kinescope (embed). Если заполнено — показывается вместо картинки 2',
        }),
        heroImage: caseImage('Обложка кейса', 'Большая картинка в начале страницы кейса'),
        blocks: fields.blocks(
          {
            section: {
              label: 'Текст с заголовком',
              itemLabel: (props) => props.fields.heading.value || 'Текст',
              schema: fields.object({
                heading: fields.text({ label: 'Заголовок', description: 'Например: Исследование' }),
                text: fields.text({ label: 'Текст', multiline: true, description: textHint }),
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
                alt: fields.text({ label: 'Что на картинке', description: 'Для поисковиков и незрячих' }),
                caption: fields.text({ label: 'Подпись под картинкой' }),
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
                caption: fields.text({ label: 'Подпись' }),
              }),
            },
            video: {
              label: 'Видео',
              schema: fields.object({
                url: fields.url({ label: 'Ссылка на видео (Kinescope / YouTube embed)' }),
                caption: fields.text({ label: 'Подпись' }),
              }),
            },
            quote: {
              label: 'Цитата / инсайт',
              schema: fields.object({
                text: fields.text({ label: 'Текст', multiline: true }),
                author: fields.text({ label: 'Кто сказал', description: 'Необязательно' }),
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
        name: fields.text({ label: 'Имя и фамилия' }),
        role: fields.text({ label: 'Роль', description: 'Например: Продуктовый дизайнер' }),
        greeting: fields.text({ label: 'Приветствие', defaultValue: 'Привет!' }),
        intro: fields.text({ label: 'О себе в двух строках', multiline: true }),
        location: fields.text({ label: 'Где живу' }),
        openToWork: fields.checkbox({ label: 'Ищу работу (зелёная точка в шапке)', defaultValue: true }),
        statusText: fields.text({ label: 'Текст статуса', defaultValue: 'Открыта к full-time и контрактной работе' }),
        heroPhoto: siteImage('Фото на главной (маленькое)'),
        heroPhoto2: siteImage('Фото на главной (большое)'),
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
        socials: fields.array(
          fields.object({
            label: fields.text({ label: 'Название' }),
            url: fields.url({ label: 'Ссылка' }),
          }),
          { label: 'Соцсети', itemLabel: (props) => props.fields.label.value }
        ),
        footerImage: siteImage('Картинка в подвале'),
      },
    }),

    about: singleton({
      label: 'Обо мне',
      path: 'src/content/about',
      format: { data: 'yaml' },
      schema: {
        headline: fields.text({ label: 'Заголовок', multiline: true }),
        text: fields.text({ label: 'Текст', multiline: true, description: textHint }),
        hobbies: fields.text({ label: 'Помимо дизайна', multiline: true }),
        photos: fields.array(siteImage('Фото'), { label: 'Фотографии', description: 'Лучше 3 штуки' }),
        experience: fields.array(
          fields.object({
            period: fields.text({ label: 'Период', description: 'Например: 2024 — сейчас' }),
            company: fields.text({ label: 'Компания' }),
            role: fields.text({ label: 'Должность' }),
            text: fields.text({ label: 'Что делала', multiline: true }),
          }),
          {
            label: 'Опыт работы',
            itemLabel: (props) => `${props.fields.period.value} · ${props.fields.company.value}`,
          }
        ),
        skills: fields.array(
          fields.object({
            title: fields.text({ label: 'Группа' }),
            items: fields.text({ label: 'Навыки', multiline: true, description: 'Каждый с новой строки' }),
          }),
          { label: 'Навыки', itemLabel: (props) => props.fields.title.value }
        ),
        tools: fields.array(
          fields.object({
            name: fields.text({ label: 'Инструмент' }),
            details: fields.text({ label: 'Что умею' }),
          }),
          { label: 'Инструменты', itemLabel: (props) => props.fields.name.value }
        ),
      },
    }),
  },
});
