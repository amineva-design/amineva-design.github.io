import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';
import { loadEnv } from 'vite';

// Админка (/keystatic) нужна локально всегда, а на сайте — только когда подключён GitHub.
const isDev = process.argv.includes('dev');
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const githubRepo = process.env.PUBLIC_KEYSTATIC_GITHUB_REPO || env.PUBLIC_KEYSTATIC_GITHUB_REPO;
const withAdmin = isDev || Boolean(githubRepo);

export default defineConfig({
  site: 'https://amineva.ru',
  integrations: [react(), ...(withAdmin ? [keystatic()] : [])],
  // На Vercel — их адаптер; на любом другом хостинге (Timeweb и т. п.) — обычный Node-сервер.
  // Сайт при этом остаётся статичным, сервер нужен только админке.
  adapter: withAdmin ? (process.env.VERCEL ? vercel() : node({ mode: 'standalone' })) : undefined,
  output: 'static',
});
