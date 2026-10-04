import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// Админка (/keystatic) нужна локально всегда, а на сайте — только когда подключён GitHub.
const isDev = process.argv.includes('dev');
const githubRepo = process.env.PUBLIC_KEYSTATIC_GITHUB_REPO;
const withAdmin = isDev || Boolean(githubRepo);

export default defineConfig({
  site: 'https://amineva.ru',
  integrations: [react(), ...(withAdmin ? [keystatic()] : [])],
  adapter: withAdmin ? vercel() : undefined,
  output: 'static',
});
