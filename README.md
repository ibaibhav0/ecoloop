# EcoLoop 🔄
> **Campus E-Waste Collection & Lifecycle Tracking Platform**

[![Live App on Vercel](https://img.shields.io/badge/Vercel-Live%20Platform-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ecoloop-campus.vercel.app)
[![API Backend on Vercel](https://img.shields.io/badge/API-REST%20Backend-000000?style=for-the-badge&logo=node.js&logoColor=white)](https://ecoloop-api-campus.vercel.app/api/health)

- **Production Web Application**: [https://ecoloop-campus.vercel.app](https://ecoloop-campus.vercel.app)
- **Production REST API**: [https://ecoloop-api-campus.vercel.app/api](https://ecoloop-api-campus.vercel.app/api)
- **Interactive Swagger Docs**: [https://ecoloop-api-campus.vercel.app/docs](https://ecoloop-api-campus.vercel.app/docs)

EcoLoop is a full-stack campus e-waste collection and tracking platform connecting **Students**, **Campus Collection Teams**, **Admins**, and **Authorised Recyclers**. Every electronic item gets a digital passport and unique QR code tracking its entire lifecycle from registration to verified sustainable recycling. Designed with an austere, aerospace-grade SpaceX aesthetic.

---

## 🌟 Key Features

1. **Multi-Role Authentication & Perspectives**:
   - **Student**: Register e-waste items, generate QR tags, schedule room or hub pickups, track lifecycle status, view hostel leaderboard rankings, and earn 10 points per kg collected.
   - **Collection Team (EcoSquad)**: Live camera QR code scanner (`html5-qrcode`), calibrated weight recording, automated reward points attribution.
   - **Campus Admin**: Requests pipeline table, dispatch/handover to authorised recyclers, campus participation analytics.
   - **Authorised Recycler**: Scan QR code, certify green dismantling & rare-earth recovery, issuing verified recycling certificates.

2. **Core Lifecycle Flow (5 Verifiable Stages)**:
   ```
   [registered] ➔ [scheduled] ➔ [collected] ➔ [handed_over] ➔ [verified_recycled]
   ```
   Every handover step records timestamp, actor, role, location, and verification flag in a tamper-evident audit trail.

3. **Rewards & Leaderboards**:
   - **10 Reward Points** credited automatically per kg of verified collected e-waste.
   - **Hostel Leaderboard** rankings (Nilgiri, Himalaya, Kaveri, Ganga, Brahmaputra, etc.) with gold/silver/bronze podiums.
   - **Individual Student Honor Roll**.

4. **Environmental Impact Analytics**:
   - Total e-waste diverted in kg.
   - CO2 emissions offset calculator (~1.44 kg CO2e per kg recycled).
   - Toxic lead and heavy metals prevented from campus soil and groundwater.
   - Precious copper and gold reclaimed for circular economy.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React icons, `html5-qrcode`, `qrcode`, `canvas-confetti`
- **Backend**: Node.js, Express, Mongoose, JWT authentication, `bcryptjs`, `cors`, `dotenv`
- **Database**: MongoDB Atlas (with built-in zero-config memory/persistent store fallback)
- **Deployment Ready**: Vercel (Frontend) + Render / Railway (Backend)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Clone & Install
```bash
git clone <repo-url> ecoloop
cd ecoloop

# Install all workspace dependencies
npm run install:all
```

### 2. Configure Environment
Create `.env` in the `server` directory (or use `.env.example`):

**`server/.env`**:
```env
PORT=5000
NODE_ENV=development
# Optional: MongoDB Atlas connection string (if left blank, built-in instant local store is used)
MONGODB_URI=
JWT_SECRET=ecoloop_super_secret_campus_key_2026
CLIENT_URL=http://localhost:3000
```

**`client/.env.local`** (optional):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Both Frontend & Backend Concurrently
From the root `ecoloop` folder:
```bash
npm run dev
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 👥 Seed Accounts for Testing

Pre-seeded accounts are loaded automatically on initial startup:

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Student** | Baibhav Kumar | `baibhav@ecoloop.campus` (or `student@ecoloop.campus`) | `student123` | Hostel Nandani (140 pts) |
| **Student** | Ananya Iyer | `ananya@ecoloop.campus` | `student123` | Hostel Kaveri (90 pts) |
| **Collector** | Piyush Raj | `collector@ecoloop.campus` | `collector123` | Collection Team (Hostel Kumardhara) |
| **Admin** | Manan Sehgal | `admin@ecoloop.campus` | `admin123` | Campus Admin (Hostel Saupernikha) |
| **Recycler** | Janavi Bairoliya | `recycler@ecoloop.campus` | `recycler123` | Authorised Recycler (Hostel Netravati) |

### 🏢 Campus Hostels:
- `Nandani`
- `Kaveri`
- `Kumardhara`
- `Saupernikha`
- `Shambhavi`
- `Netravati`

> 💡 **Tip**: Use the **Top Perspective Switcher Banner** in the web app to switch between roles in **1 click** without typing credentials!

---

## 📦 Pre-Seeded Sample Items (Multi-Stage Lifecycle)

The seed script creates real items in every stage of the lifecycle:
1. `ECO-2026-NAN1` (`registered`): Defective Laptop (approx 2.4 kg, Baibhav Kumar, Hostel Nandani)
2. `ECO-2026-NAN2` (`scheduled`): Old Phones & Cables (approx 0.8 kg, Oct 18 slot, Baibhav Kumar, Hostel Nandani)
3. `ECO-2026-KAV3` (`collected`): Circuit Boards & PCBs (actual 3.8 kg, Ananya Iyer, Hostel Kaveri, +38 pts awarded by Piyush Raj)
4. `ECO-2026-KUM4` (`handed_over`): LED Display (actual 6.2 kg, Hostel Kumardhara, dispatched by Manan Sehgal to Janavi Bairoliya)
5. `ECO-2026-SHA5` (`verified_recycled`): Li-ion Batteries & Adapters (actual 2.1 kg, Hostel Shambhavi, verified by Janavi Bairoliya)

---

## 🌐 Cloud Deployment Guide

### Deploying Backend to Render
1. Push the repository to GitHub.
2. In Render Dashboard, click **New > Web Service**.
3. Select your repository and set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI (`mongodb+srv://...`)
   - `JWT_SECRET`: A secure random secret string
   - `NODE_ENV`: `production`

### Deploying Frontend to Vercel
1. In Vercel Dashboard, click **Add New > Project**.
2. Select your repository and configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Next.js
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g. `https://ecoloop-backend.onrender.com/api`)
4. Click **Deploy**.

---

## 📄 License
MIT License. Built for university campus sustainability and circular economy initiatives.
