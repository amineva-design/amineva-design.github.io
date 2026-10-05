import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Схемы повторяют keystatic.config.ts: админка пишет YAML, Astro его читает.
const text = z.string().nullish().transform((v) => v ?? '');

// Поле + его английская пара (key, keyEn)
const tx = <K extends string>(...keys: K[]) =>
  Object.fromEntries(keys.flatMap((k) => [[k, text], [`${k}En`, text]])) as Record<K | `${K}En`, typeof text>;

const cases = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/cases' }),
  schema: ({ image }) => {
    const img = image().nullish();
    return z.object({
      title: z.string(),
      titleEn: text,
      published: z.boolean().default(true),
      order: z.number().nullish().transform((v) => v ?? 10),
      year: text,
      ...tx('direction', 'summary', 'lead', 'role', 'duration', 'team'),
      metrics: z.array(z.object({ value: text, ...tx('label') })).default([]),
      cardImage: img,
      cardImage2: img,
      cardVideo: text,
      heroImage: img,
      blocks: z
        .array(
          z.discriminatedUnion('discriminant', [
            z.object({
              discriminant: z.literal('section'),
              value: z.object({ ...tx('heading', 'text'), inNav: z.boolean().default(true) }),
            }),
            z.object({
              discriminant: z.literal('image'),
              value: z.object({ image: img, ...tx('alt', 'caption'), wide: z.boolean().default(false) }),
            }),
            z.object({
              discriminant: z.literal('pair'),
              value: z.object({ left: img, right: img, ...tx('caption') }),
            }),
            z.object({
              discriminant: z.literal('marquee'),
              value: z.object({
                images: z.array(img).default([]),
                frame: z.enum(['none', 'phone']).default('none'),
                reverse: z.boolean().default(false),
                ...tx('caption'),
              }),
            }),
            z.object({
              discriminant: z.literal('video'),
              value: z.object({ url: text, ...tx('caption') }),
            }),
            z.object({
              discriminant: z.literal('quote'),
              value: z.object({ ...tx('text', 'author') }),
            }),
          ])
        )
        .default([]),
    });
  },
});

const pages = defineCollection({
  loader: glob({ pattern: '{settings,about,privacy}.yaml', base: './src/content' }),
  schema: ({ image }) => {
    const img = image().nullish();
    return z.object({
      // settings
      ...tx('name', 'role', 'greeting', 'intro', 'location', 'statusText'),
      openToWork: z.boolean().default(true),
      heroPhoto2: img,
      email: text,
      telegram: text,
      resumeFile: text,
      resumeUrl: text,
      resumeFileEn: text,
      resumeUrlEn: text,
      socials: z.array(z.object({ ...tx('label'), url: text })).default([]),
      // about
      ...tx('headline', 'text', 'hobbies', 'languages'),
      // privacy
      ...tx('title'),
      photos: z.array(img).default([]),
      experience: z.array(z.object({ ...tx('period', 'company', 'role', 'text') })).default([]),
      skills: z.array(z.object({ ...tx('title', 'items') })).default([]),
      tools: z.array(z.object({ ...tx('name', 'details') })).default([]),
      softSkills: z.array(z.object({ ...tx('title', 'text') })).default([]),
    });
  },
});

export const collections = { cases, pages };
