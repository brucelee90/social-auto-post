# Verwende einen Node-basierten Basis-Image
FROM node:20-alpine

# Arbeitsverzeichnis setzen
WORKDIR /app

# Kopiere die package.json und die package-lock.json (falls vorhanden)
COPY package*.json ./

# Kopiere Prisma-Dateien
COPY prisma ./prisma

COPY .env .env

RUN ls -la ./prisma

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den Rest der Anwendung
COPY . .

# Build den Remix App
RUN npm run build

# Setze den Port für die App
EXPOSE 3000

# Definiere den Startbefehl
CMD ["npm", "run", "start"]
