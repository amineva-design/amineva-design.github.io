// Анимации сайта: плавный скролл, появление текста и фото, «рисующиеся» hand-drawn линии,
// коллаж из фотографий. Всё отключается, если в системе включено «уменьшить движение».
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;
let splits: SplitText[] = [];

function initLenis() {
  if (reduced || lenis) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Якорные ссылки через Lenis, чтобы прокрутка тоже была плавной
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
  if (!a || !lenis) return;
  const url = new URL(a.href, location.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const target = url.hash === '#main' ? 0 : document.querySelector<HTMLElement>(url.hash);
  if (target === null) return;
  e.preventDefault();
  lenis.scrollTo(target, { offset: -24, duration: 1.2 });
});

// У линий штрих не масштабируется (vector-effect), поэтому пунктир считается в экранных пикселях —
// длину пути измеряем на экране, а не в координатах SVG
function screenLength(path: SVGPathElement) {
  const m = path.getScreenCTM();
  const total = path.getTotalLength();
  if (!m || !total) return 1000;
  let len = 0;
  let prev: DOMPoint | null = null;
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const p = path.getPointAtLength((total * i) / steps).matrixTransform(m);
    if (prev) len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return len;
}

// Единое скругление сайта (--radius) — маска появления фото тоже скруглённая
const radius = () => getComputedStyle(root).getPropertyValue('--radius').trim() || '20px';

function reveal() {
  // Заголовки и крупный текст: строки выезжают из-под маски
  gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    splits.push(split);
    gsap.set(el, { autoAlpha: 1 });
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Мелкие блоки: мягкое появление снизу
  gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      }
    );
  });

  // Фото: проявляются снизу вверх, внутри картинка чуть «отъезжает»
  gsap.utils.toArray<HTMLElement>('[data-reveal="img"]').forEach((el) => {
    const img = el.querySelector('img');
    gsap.set(el, { autoAlpha: 1 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    tl.fromTo(
      el,
      { clipPath: `inset(100% 0% 0% 0% round ${radius()})` },
      // после появления снимаем маску, иначе она обрезает тень у фото в коллаже
      { clipPath: `inset(0% 0% 0% 0% round ${radius()})`, duration: 1.2, ease: 'power3.inOut', clearProps: 'clipPath' }
    );
    if (img) tl.fromTo(img, { scale: 1.15 }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0);
  });

  // Hand-drawn линии рисуются сами, когда появляются на экране
  gsap.utils.toArray<SVGPathElement>('.line path').forEach((path) => {
    const svg = path.closest('svg')!;
    const len = screenLength(path) + 2;
    gsap.fromTo(
      path,
      { strokeDasharray: len, strokeDashoffset: len },
      {
        strokeDashoffset: 0,
        duration: svg.classList.contains('line--strike') ? 0.8 : 1.6,
        delay: Number(svg.dataset.delay || 0),
        ease: 'power2.inOut',
        scrollTrigger: { trigger: svg, start: 'top 92%', once: true },
      }
    );
  });
}

// Каракули вокруг головы: группы рисуются и стираются по очереди
function scribbles() {
  document.querySelectorAll<SVGSVGElement>('[data-scribbles]').forEach((svg) => {
    const groups = [...svg.querySelectorAll<SVGGElement>('g')];
    const tl = gsap.timeline({ repeat: -1, delay: 1.2 });
    groups.forEach((g) => {
      const paths = g.querySelectorAll('path');
      tl.set(groups, { autoAlpha: 0 })
        .set(g, { autoAlpha: 1 })
        .fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out', stagger: 0.07 })
        .to({}, { duration: 1.6 })
        .to(paths, { strokeDashoffset: -1, duration: 0.5, ease: 'power2.in', stagger: 0.04 });
    });
  });
}

// Коллаж: фото можно потаскать мышкой, при отпускании они остаются на новом месте
function collage() {
  if (!finePointer) return;
  gsap.utils.toArray<HTMLElement>('[data-drag]').forEach((el) => {
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    let z = 1;
    el.addEventListener('pointerdown', (e) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      sx = e.clientX;
      sy = e.clientY;
      ox = Number(gsap.getProperty(el, 'x'));
      oy = Number(gsap.getProperty(el, 'y'));
      el.classList.add('is-dragging');
      el.style.zIndex = String(10 + z++);
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      gsap.to(el, { x: ox + e.clientX - sx, y: oy + e.clientY - sy, duration: 0.25, ease: 'power3.out' });
    });
    const end = () => {
      dragging = false;
      el.classList.remove('is-dragging');
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('dragstart', (e) => e.preventDefault());
  });
}

function init() {
  initLenis();
  if (reduced) {
    root.classList.remove('motion');
    return;
  }
  ctx = gsap.context(() => {
    reveal();
    scribbles();
    collage();
  });
  // Пересчитать позиции, когда догрузятся шрифты и картинки
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

function cleanup() {
  splits.forEach((s) => s.revert());
  splits = [];
  ctx?.revert();
  ctx = null;
}

// Работает и при обычной загрузке, и при переходах между страницами без перезагрузки
document.addEventListener('astro:page-load', () => {
  init();
  if (lenis) {
    lenis.start();
    lenis.resize();
    const target = location.hash ? document.querySelector<HTMLElement>(location.hash) : null;
    if (target) lenis.scrollTo(target, { offset: -24, immediate: true, force: true });
    else lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  }
  (window as any).__motionReady = true;
});
document.addEventListener('astro:before-preparation', () => lenis?.stop());
document.addEventListener('astro:before-swap', (e) => {
  cleanup();
  // новая страница приходит без классов на <html> — переносим их
  const next = (e as any).newDocument.documentElement as HTMLElement;
  if (!reduced) next.classList.add('motion');
  if (root.classList.contains('has-cursor')) next.classList.add('has-cursor');
});
