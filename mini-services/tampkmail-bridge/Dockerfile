FROM mcr.microsoft.com/playwright:v1.61.1-jammy

WORKDIR /app

COPY mini-services/tampkmail-bridge/package.json mini-services/tampkmail-bridge/package-lock.json* ./
RUN npm install

COPY mini-services/tampkmail-bridge/ ./

EXPOSE 3000

CMD ["xvfb-run", "--auto-servernum", "node", "server.js"]
