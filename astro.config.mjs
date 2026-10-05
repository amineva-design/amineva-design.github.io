import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';
import { loadEnv } from 'vite';

// Админка (/keystatic) нужна локально всегда, а на сайте — только когда подключён GitHub.
const isDev = process.argv.includes('dev');
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const githubRepo = process.env.PUBLIC_KEYSTATIC_GITHUB_REPO || env.PUBLIC_KEYSTATIC_GITHUB_REPO;
const withAdmin = isDev || Boolean(githubRepo);

export default defineConfig({
  // На GitHub Pages без своего домена сайт живёт в подпапке (/amineva-portfolio/) — её задаёт сборка.
  site: process.env.SITE_URL || 'https://amineva.ru',
  base: process.env.SITE_BASE || '/',
  integrations: [react(), ...(withAdmin ? [keystatic()] : [])],
  adapter: withAdmin ? vercel() : undefined,
  output: 'static',
});
