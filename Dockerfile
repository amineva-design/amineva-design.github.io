# Сборка и запуск сайта на любом хостинге с Docker (Timeweb Cloud Apps, Yandex Cloud и т. п.)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Переменные админки (PUBLIC_KEYSTATIC_GITHUB_REPO и др.) нужны уже при сборке
ARG PUBLIC_KEYSTATIC_GITHUB_REPO
ARG PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
ENV PUBLIC_KEYSTATIC_GITHUB_REPO=$PUBLIC_KEYSTATIC_GITHUB_REPO
ENV PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=$PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
