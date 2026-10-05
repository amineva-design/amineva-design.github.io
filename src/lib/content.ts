import { getCollection, getEntry } from 'astro:content';

export async function getSettings() {
  const entry = await getEntry('pages', 'settings');
  if (!entry) throw new Error('Нет файла src/content/settings.yaml');
  return entry.data;
}

export async function getPrivacy() {
  const entry = await getEntry('pages', 'privacy');
  if (!entry) throw new Error('Нет файла src/content/privacy.yaml');
  return entry.data;
}

export async function getAbout() {
  const entry = await getEntry('pages', 'about');
  if (!entry) throw new Error('Нет файла src/content/about.yaml');
  return entry.data;
}

export async function getCases() {
  const all = await getCollection('cases', ({ data }) => data.published);
  return all.sort((a, b) => a.data.order - b.data.order || b.data.year.localeCompare(a.data.year));
}

export function resumeHref(
  s: { resumeFile: string; resumeUrl: string; resumeFileEn: string; resumeUrlEn: string },
  lang: 'ru' | 'en' = 'ru'
) {
  const ru = s.resumeFile || s.resumeUrl || '';
  return lang === 'en' ? s.resumeFileEn || s.resumeUrlEn || ru : ru;
}

export function telegramHref(handle: string) {
  return handle ? `https://t.me/${handle.replace(/^@/, '')}` : '';
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Hand-drawn зигзаг для ~~зачёркивания~~ — рисуется при появлении (motion.ts)
const STRIKE =
  '<svg class="line line--strike" viewBox="0 0 76.43 10.81" preserveAspectRatio="none" aria-hidden="true">' +
  '<path d="M0.9009 2.8328C0.9009 2.8328 76.3881 -1.5078 75.52 2.8328C74.6519 7.1735 -3.7604 5.3693 11.02 7.04C34.0955 9.6483 55.0822 9.9097 55.0822 9.9097" ' +
  'fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';

// Мини-разметка для текстов из админки: **жирный**, ~~зачёркнутый~~.
export function inline(s: string) {
  return escape(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/~~(.+?)~~/g, `<s>$1${STRIKE}</s>`);
}

// Пустая строка — новый абзац, строки с «- » — список.
export function richText(src: string) {
  return src
    .trim()
    .split(/\n\s*\n/)
    .map((chunk) => {
      const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
      const out: string[] = [];
      let list: string[] = [];
      const flush = () => {
        if (list.length) out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`);
        list = [];
      };
      let para: string[] = [];
      const flushPara = () => {
        if (para.length) out.push(`<p>${para.map(inline).join('<br>')}</p>`);
        para = [];
      };
      for (const line of lines) {
        const h = line.match(/^##\s+(.*)$/);
        if (h) {
          flushPara();
          flush();
          out.push(`<h2>${inline(h[1])}</h2>`);
          continue;
        }
        const m = line.match(/^[-•–]\s+(.*)$/);
        if (m) {
          flushPara();
          list.push(m[1]);
        } else {
          flush();
          para.push(line);
        }
      }
      flushPara();
      flush();
      return out.join('');
    })
    .join('');
}
