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

// Мини-разметка для текстов из админки: **жирный**, ~~зачёркнутый~~, _акцентный шрифт_.
export function inline(s: string) {
  return escape(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/(^|[\s\u00a0(«"—])_([^_\n]+?)_(?=$|[\s\u00a0.,!?:;»")—])/g, '$1<em class="accent">$2</em>');
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
