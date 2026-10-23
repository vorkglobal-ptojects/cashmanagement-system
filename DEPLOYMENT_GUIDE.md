# Cash Management System (CMS) — Production Deployment Guide

## 1. Prerequisites

- **Runtime**: Node.js v18.17+ or v20+ / v22+
- **Database**: PostgreSQL 14+ (or SQLite for local zero-dependency development/testing)
- **Memory**: Minimum 1GB RAM (2GB recommended for high-volume transactions)
- **Operating System**: Linux (Ubuntu 22.04+ / Debian 12+), macOS, or Windows Server

---

## 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Connection URL (PostgreSQL for Production)
DATABASE_URL="postgresql://cms_user:your_secure_password@localhost:5432/cash_management?schema=public"

# Cryptographically Secure Session Secret (Minimum 32 random characters)
SESSION_SECRET="e9b21a8f094c34a21e4854b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7"

# Environment
NODE_ENV="production"
PORT=3000
```

---

## 3. Database Migration & Initialization

### Switching to PostgreSQL in Production

In `prisma/schema.prisma`, update the datasource provider:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run:

```bash
# Generate the Prisma Client
npx prisma generate

# Apply migrations to PostgreSQL
npx prisma db push

# (Optional) Seed standard Sri Lankan branch and master data
node prisma/seed.js
```

---

## 4. Docker Deployment

### Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    container_name: cms_postgres
    restart: always
    environment:
      POSTGRES_USER: cms_user
      POSTGRES_PASSWORD: cms_production_password
      POSTGRES_DB: cash_management
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    container_name: cms_app
    restart: always
    environment:
      DATABASE_URL: "postgresql://cms_user:cms_production_password@postgres:5432/cash_management?schema=public"
      SESSION_SECRET: "e9b21a8f094c34a21e4854b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7"
      NODE_ENV: "production"
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  pgdata:
```

---

## 5. Automated Testing & Verification

Run the automated test suite before deployment:

```bash
npm test
```

The test runner verifies:
1. Denomination tally calculations for Sri Lankan currency notes and coins.
2. Balanced double-entry General Ledger equality invariants ($\sum \text{Debit} = \sum \text{Credit}$).
3. Separation of duties (SoD) preventing self-approval and self-receipt.
4. Liquidity holdings and branch account data structures.

---

## 6. Security Hardening Checklist

- [x] **Zero Client Identity Trust**: User roles, branches, and user IDs are strictly derived from the verified session cookie on the server.
- [x] **HTTP-Only Cookies**: Prevents client-side script token theft (`XSS`).
- [x] **Timing-Safe HMAC Signatures**: Mitigates timing attacks during session token verification.
- [x] **Atomic Transactions**: Multi-table updates execute within `prisma.$transaction`.
- [x] **Immutable Audit Logs**: Deletion of audit logs and posted GL vouchers is prohibited.
