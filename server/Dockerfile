# ─────────────────────────────────────────────
#  MeetUp Backend — Multi-stage Dockerfile
# ─────────────────────────────────────────────

# ── שלב בסיס משותף ──
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ── פיתוח: כולל devDependencies (nodemon) + hot reload ──
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# ── ייצור: התקנה רזה ודטרמיניסטית (npm ci) בלי devDependencies ──
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
