import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Схемы повторяют keystatic.config.ts: админка пишет YAML, Astro его читает.
const text = z.string().nullish().transform((v) => v ?? '');

const cases = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/cases' }),
  schema: ({ image }) => {
    const img = image().nullish();
    return z.object({
      title: z.string(),
      published: z.boolean().default(true),
      order: z.number().nullish().transform((v) => v ?? 10),
      year: text,
      direction: text,
      summary: text,
      lead: text,
      role: text,
      duration: text,
      team: text,
      metrics: z.array(z.object({ value: text, label: text })).default([]),
      cardImage: img,
      cardImage2: img,
      cardVideo: text,
      heroImage: img,
      blocks: z
        .array(
          z.discriminatedUnion('discriminant', [
            z.object({
              discriminant: z.literal('section'),
              value: z.object({ heading: text, text: text, inNav: z.boolean().default(true) }),
            }),
            z.object({
              discriminant: z.literal('image'),
              value: z.object({ image: img, alt: text, caption: text, wide: z.boolean().default(false) }),
            }),
            z.object({
              discriminant: z.literal('pair'),
              value: z.object({ left: img, right: img, caption: text }),
            }),
            z.object({
              discriminant: z.literal('video'),
              value: z.object({ url: text, caption: text }),
            }),
            z.object({
              discriminant: z.literal('quote'),
              value: z.object({ text: text, author: text }),
            }),
          ])
        )
        .default([]),
    });
  },
});

const pages = defineCollection({
  loader: glob({ pattern: '{settings,about}.yaml', base: './src/content' }),
  schema: ({ image }) => {
    const img = image().nullish();
    return z.object({
      // settings
      name: text,
      role: text,
      greeting: text,
      intro: text,
      location: text,
      openToWork: z.boolean().default(true),
      statusText: text,
      heroPhoto: img,
      heroPhoto2: img,
      email: text,
      telegram: text,
      resumeFile: text,
      resumeUrl: text,
      socials: z.array(z.object({ label: text, url: text })).default([]),
      footerImage: img,
      // about
      headline: text,
      text: text,
      hobbies: text,
      photos: z.array(img).default([]),
      experience: z
        .array(z.object({ period: text, company: text, role: text, text: text }))
        .default([]),
      skills: z.array(z.object({ title: text, items: text })).default([]),
      tools: z.array(z.object({ name: text, details: text })).default([]),
    });
  },
});

export const collections = { cases, pages };
