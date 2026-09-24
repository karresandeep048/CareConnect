# CareConnect - AI-Powered Home Services Marketplace

> **Stack:** MongoDB · Express · React 18 · Node.js · Tailwind CSS · Chart.js · JWT · Docker

CareConnect is a full-stack marketplace for booking home services (appliance repair, plumbing, electrical, HVAC, cleaning, handyman). It uses AI to understand the customer's problem, matches the best verified professionals, locks a conflict-free time slot, and keeps everyone accountable with proof-of-work tracking, invoices and dispute handling.

## Highlights

| Area | What it does |
|---|---|
| **5 roles (RBAC)** | Customer, Service Provider, Platform Admin, Operations Manager, Support Agent - each with its own dashboard |
| **AI request classifier** | Free text → category, urgency, skills, duration and cost range |
| **Provider matching engine** | 0-99 score: skills 35% · service area 25% · verification + rating 25% · price 15% |
| **Scheduling engine** | Prevents double-booking a provider's slot |
| **Emergency SOS** *(new)* | Classifies the emergency, adds a 25% priority premium, alerts the 3 best-matched verified pros |
| **Coupon engine** *(new)* | Percent discounts with cap, minimum order, expiry and usage limits, validated server-side |
| **CareBot assistant** *(new)* | Intent-based chat: pricing, booking status, coupons, refunds, emergencies, provider suggestions |
| **Cost Estimator** *(new)* | Public page `/estimate` - estimate + top matches + coupon preview |
| **Project Showcase** *(new)* | `/showcase` - judge's walkthrough with one-click role logins, architecture, resume bullets |
| **Proof-of-work** | Verification code, before/after photos, customer sign-off, invoices, reviews, disputes, audit logs |
| **Security & quality** | JWT + bcrypt, rate limiting, request logging, unit tests, Docker Compose, GitHub Actions CI |

## Quick start

```bash
# 1. Backend (http://localhost:5001)
cd backend
npm install
npm run dev          # seeds demo data automatically when the database is empty

# 2. Frontend (http://localhost:3000)
cd ../frontend
npm install
npm run dev
```

The backend connects to `MONGODB_URI` (local MongoDB or Atlas) and falls back to an embedded in-memory MongoDB if none is available. Copy `backend/.env.example` to `backend/.env` to configure it.

**Docker:** `docker compose up --build` then open http://localhost:3000

**Tests:** `cd backend && npm test`

## Demo accounts (password `Password123!`)

| Role | Email |
|---|---|
| Customer | customer@careconnect.com |
| Service Provider | provider@careconnect.com |
| Platform Admin | admin@careconnect.com |
| Operations Manager | ops@careconnect.com |
| Support Agent | support@careconnect.com |

The login page and `/showcase` also offer one-click demo access for every role.
Demo coupons: `WELCOME10`, `CARE20`, `FIXIT15`.

## Suggested demo flow (5 minutes)

1. **Customer:** describe a problem in the AI classifier, or press **Emergency SOS**.
2. **Provider:** open the requests feed and submit a quote.
3. **Customer:** compare quotes, apply `WELCOME10`, accept and book - the invoice shows the discount.
4. **Ops Manager / Admin / Support:** dispatch board, analytics, verification queue, dispute resolution.
5. Ask **CareBot** (bottom-right) "any discount coupons?" or "my sink is leaking".

## Architecture

```
React SPA (Vite, Tailwind, Chart.js, Context auth, CareBot)
        │  /api (proxy)
Express REST API - JWT auth · RBAC · rate limiting · request logging
        │
Domain services - aiClassification · providerMatching · availabilityEngine
                  couponService · assistantEngine · notificationService
        │
MongoDB (Mongoose) - 12 models
```

## New API endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/requests/sos` | Emergency dispatch (customer only) |
| GET | `/api/coupons` | List active coupons |
| POST | `/api/coupons/validate` | `{ code, amount }` → discount preview |
| POST | `/api/bookings` | Now accepts optional `couponCode` |
| POST | `/api/assistant/chat` | CareBot message → reply, cards, suggestions |
| POST | `/api/assistant/estimate` | `{ description }` → AI estimate + top providers |
| GET | `/api/public/stats` | Public platform statistics |

## Resume bullets

- Built CareConnect, a full-stack MERN home-services marketplace with 5 role-based dashboards (JWT RBAC), 40+ REST endpoints and 12 Mongoose models.
- Designed an AI request classifier and a weighted provider-matching engine (skills 35%, area 25%, rating/verification 25%, price 15%).
- Implemented conflict-free scheduling, proof-of-work job tracking, invoicing, dispute resolution and audit logging.
- Added emergency SOS dispatch, a server-validated coupon engine and CareBot, a rule-based conversational assistant with intent detection.
- Hardened the API with rate limiting, logging and unit tests; containerised with Docker Compose and a GitHub Actions CI pipeline.
