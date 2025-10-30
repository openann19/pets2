FROM jrottenberg/ffmpeg:6.0-ubuntu
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src
COPY assets/fonts ./assets/fonts
RUN npm run build
CMD ["node","dist/index.js"]

