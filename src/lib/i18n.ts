export type Lang = 'ru' | 'en';
export const langs: Lang[] = ['ru', 'en'];

// Короткие слова, которые не должны висеть в конце строки
const SHORT = /(^|[\s(«"„—–-])(в|во|с|со|к|ко|и|а|о|об|у|на|по|за|из|от|до|не|ни|но|же|для|без|при|про|над|под|или|что|как|это|я|мы) +/giu;

// Неразрывный пробел после предлогов и перед тире
export function typo(s: string) {
  if (!s) return s;
  return numbers(s.replace(SHORT, '$1$2\u00a0').replace(SHORT, '$1$2\u00a0').replace(/ (—|–) /g, '\u00a0$1 '));
}

// Число и единица не разрываются: «1200 ₽», «3 месяца» → без переноса
const numbers = (s: string) => s.replace(/(\d) (₽|%|руб|мес|лет|год)/g, '$1\u00a0$2');

// Берёт английскую версию поля (keyEn), если она заполнена, иначе русскую.
export function loc<T extends Record<string, any>>(obj: T, key: string, lang: Lang): string {
  if (lang === 'en') {
    const en = obj[`${key}En`];
    if (typeof en === 'string' && en.trim()) return numbers(en);
  }
  return typo((obj[key] as string) ?? '');
}

// Ссылка внутри сайта с учётом языка: href('en', '/about') → '/en/about'
export function href(lang: Lang, path: string) {
  if (lang === 'ru') return path;
  if (path === '/') return '/en/';
  if (path.startsWith('/#')) return `/en/${path.slice(1)}`;
  return `/en${path}`;
}

// Тот же адрес на другом языке
export function switchPath(pathname: string, to: Lang) {
  const bare = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return href(to, bare);
}

export const ui = {
  ru: {
    nav: { cases: 'Кейсы', about: 'Обо мне', contacts: 'Контакты' },
    openToWork: 'Ищу работу',
    resume: 'Резюме',
    menu: 'Меню',
    skip: 'К содержимому',
    mainNav: 'Основная навигация',
    langSwitch: 'Язык сайта',
    heroNote: ['Давай знакомиться!', 'Меня зовут,'],
    photoPlay: 'Поиграй со шрифтами',
    photoFrames: ['Может, ты уже выйдешь за рамки?', 'Которые создал сам'],
    seeCases: 'Смотреть кейсы',
    casesTitle: 'Кейсы',
    caseAria: (t: string) => `Кейс «${t}»`,
    direction: 'Направление',
    year: 'Год',
    videoTitle: (t: string) => `Видео: ${t}`,
    aboutLabel: 'Обо мне',
    aboutMore: 'Опыт, навыки и инструменты →',
    allCases: '← Все кейсы',
    role: 'Роль',
    duration: 'Срок',
    team: 'Команда',
    contents: 'Содержание',
    contentsAria: 'Содержание кейса',
    video: 'Видео',
    nextCase: 'Следующий кейс',
    experience: 'Опыт',
    fullResume: 'Полное резюме ↗',
    skills: 'Навыки',
    tools: 'Инструменты',
    stack: 'Стек',
    languages: 'Языки',
    footerTitle: 'Время <span class="nw">в<mark>job</mark>ывать</span>',
    writeTelegram: 'Написать в Telegram',
    writeEmail: 'Написать на почту',
    contactsLabel: 'Контакты',
    socialsLabel: 'Соцсети',
    siteLabel: 'Сайт',
    home: 'Главная',
    toTop: 'Наверх ↑',
    notFoundTitle: 'Страница не найдена',
    notFoundText: 'Такой страницы нет — возможно, кейс переехал.',
    toHome: 'На главную',
    aboutTitle: 'Обо мне',
    privacy: 'Политика конфиденциальности',
    cookiesAria: 'Уведомление о cookies',
    cookiesText: 'Сайт использует cookies, чтобы всё работало как\u00a0надо. Подробнее\u00a0— ',
    cookiesLink: 'в\u00a0политике конфиденциальности',
    cookiesOk: 'Хорошо',
  },
  en: {
    nav: { cases: 'Work', about: 'About', contacts: 'Contact' },
    openToWork: 'Open to work',
    resume: 'Resume',
    menu: 'Menu',
    skip: 'Skip to content',
    mainNav: 'Main navigation',
    langSwitch: 'Site language',
    heroNote: ['Nice to meet you!', 'My name is'],
    photoPlay: 'Play with the fonts',
    photoFrames: ['Maybe it’s time to step outside the frame?', 'The one you built yourself'],
    seeCases: 'See my work',
    casesTitle: 'Case studies',
    caseAria: (t: string) => `Case study: ${t}`,
    direction: 'Field',
    year: 'Year',
    videoTitle: (t: string) => `Video: ${t}`,
    aboutLabel: 'About me',
    aboutMore: 'Experience, skills and tools →',
    allCases: '← All case studies',
    role: 'Role',
    duration: 'Timeline',
    team: 'Team',
    contents: 'Contents',
    contentsAria: 'Case study contents',
    video: 'Video',
    nextCase: 'Next case study',
    experience: 'Experience',
    fullResume: 'Full resume ↗',
    skills: 'Skills',
    tools: 'Tools',
    stack: 'Stack',
    languages: 'Languages',
    footerTitle: 'Let’s get to <span class="nw"><mark>work</mark></span>',
    writeTelegram: 'Message on Telegram',
    writeEmail: 'Send an email',
    contactsLabel: 'Contact',
    socialsLabel: 'Social',
    siteLabel: 'Site',
    home: 'Home',
    toTop: 'Back to top ↑',
    notFoundTitle: 'Page not found',
    notFoundText: 'This page doesn’t exist — maybe the case study has moved.',
    toHome: 'Go home',
    aboutTitle: 'About',
    privacy: 'Privacy policy',
    cookiesAria: 'Cookie notice',
    cookiesText: 'This site uses cookies to work properly. Learn more in the ',
    cookiesLink: 'privacy policy',
    cookiesOk: 'Got it',
  },
} as const;

export const t = (lang: Lang) => ui[lang];
