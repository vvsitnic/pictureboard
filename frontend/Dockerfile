FROM node:24 AS build-phase
ARG VITE_BACKEND_BASE_URL
WORKDIR /app
COPY . .
RUN npm install && \
    npm run build

FROM node:24
WORKDIR /app
COPY --from=build-phase /app/dist /app/dist
RUN npm install -g serve
USER node
EXPOSE 5000
ENTRYPOINT [ "serve", "-s", "-l", "5000", "dist" ]