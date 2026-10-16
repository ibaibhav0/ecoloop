# EcoLoop WhatsApp Bot ♻️⚡

> **Mission-Driven Campus E-Waste Collection & Compliance Platform on WhatsApp**  
> Built with **Node.js, Express, WhatsApp Cloud API (Meta), MongoDB Atlas, Jimp + jsQR, and PDFKit**.

---

## 🛰️ System Architecture

EcoLoop transforms the campus circular economy into a frictionless WhatsApp conversation. It connects **Students**, **Campus Collection Teams**, **University Sustainability Administrators**, and **Authorised CPCB Recyclers** through an end-to-end cryptographic QR code lifecycle.

```
[ Student / Lab ]          [ Campus Collector ]          [ Sustainability Admin ]       [ CPCB Recycler ]
       │                            │                               │                          │
       ├── "Register" ──────────────┼───────────────────────────────┼──────────────────────────┤
       │   (Type + Weight)          │                               │                          │
       │   ◄── QR Passport Image ───┤                               │                          │
       │                            │                               │                          │
       ├── "Schedule" Slot ────────►│ (Push Notification)           │                          │
       │                            ├── "Scan" (Photo of QR)        │                          │
       │                            ├── Digital Scale Input (Kg)    │                          │
       │   ◄── "Collected" Alert ───┴── "Collected" Status ───────►│ (Handover Queue)         │
       │                                                            ├── "Handover" Recycler ──►│ (In-Transit Alert)
       │                                                            │   (M/s WB E-Waste)       ├── "Verify" QR Photo
       │   ◄── Digital EPR Certificate (PDF) ───────────────────────┴──────────────────────────┴── "Verified Recycled"
       │   ◄── +Reward Points (10 pts/kg) + CO2e Offset
```

---

## 🔒 Critical Compliance & Data Rule

* **Pure Real User Data**: Every metric, count, leaderboard standing, and dashboard stat is derived strictly from real transactions entered by users.
* **Zero Fake Placeholders**: When no real items exist in the database, all counts and weights default strictly to **0**.
* **Statutory CPCB Reference Data**: The database seed script seeds only official reference data (e.g. CPCB authorized recycler capacity and regulatory benchmarks), never synthetic user submissions.

---

## 📱 User Roles & WhatsApp Commands

### 1. Student Contributor
| Command | Action |
| :--- | :--- |
| **`Hi`** | Start onboarding / view personal mission console |
| **`Register`** | Log new hardware item (Laptop, Phone, Charger, Battery, PCB, Monitor, Lab rig) |
| **`Schedule`** | Book collection slot by replying with date, time, and hostel location |
| **`Status`** | View live status of all registered hardware items |
| **`Points`** | Personal Impact Card (points balance, kg recovered, CO2e avoided) |
| **`Leaderboard`** | View real hostel circular rankings (defaults to 0 if no verified recycling) |
| **`Feedback`** | Submit 1–5 star rating and comments after pickup |
| **`Help`** | View command syntax manual |

### 2. Campus Collection Team
| Command | Action |
| :--- | :--- |
| **`Pending`** | View all scheduled pickups across campus hostels |
| **`Scan`** | Scan QR code (send photo from camera or reply with tracking code) |
| *Scale Reading* | Enter actual calibrated weight in kg to mark item as `collected` |

### 3. Sustainability Admin
| Command | Action |
| :--- | :--- |
| **`Dashboard`** | View aggregate campus metrics (registered items, collected weight, CO2 offset) |
| **`Handover`** | Route collected hardware in holding facility to an authorized CPCB recycler |
| **`Report`** | Generate and receive official **NAAC Criterion 7.1.3 Institutional PDF Audit Report** |
| **`Alerts`** | Check CPCB 30-day statutory holding limit breaches and overdue pickups |

### 4. Authorised CPCB Recycler
| Command | Action |
| :--- | :--- |
| **`Verify`** | Scan received QR code (photo or tracking code) to confirm receipt |
| *Destruction* | Marks item as `verified_recycled`, issues **Digital EPR Certificate PDF**, credits student reward points |
| **`History`** | View all certified destruction manifests processed by the facility |

> 💡 **Role Switching in Testing**: You can switch roles at any time by sending `ROLE STUDENT`, `ROLE COLLECTION`, `ROLE ADMIN`, or `ROLE RECYCLER`.

---

## 🛠️ Technology Stack

* **Messaging Engine**: Meta WhatsApp Cloud API (Graph API v21.0)
* **Backend Runtime**: Node.js 18+ (ES Modules) + Express 4.x
* **Database**: MongoDB Atlas (with in-memory resilience store failover)
* **QR Generation**: `qrcode` (high-contrast error-corrected PNGs)
* **QR Scanning from Images**: `jimp` (pure JS rasterization) + `jsqr` (pixel matrix decoder)
* **Vision Fallback**: OpenAI Vision API (`gpt-4o-mini`) for complex, distorted camera angles
* **Document Engine**: `pdfkit` (for NAAC audit reports and statutory EPR certificates)
* **Hosting**: Render (`render.yaml` one-click blueprint)

---

## 🚀 Setup & Deployment Guide

### 1. Meta WhatsApp Cloud API Setup
1. Go to the [Meta for Developers Console](https://developers.facebook.com/apps).
2. Create or select a **Business** app and add the **WhatsApp** product.
3. In **API Setup**:
   * Copy the **Phone Number ID**.
   * Generate a **Permanent Access Token** (or use the 24-hour test token).
4. In **Configuration -> Webhook**:
   * **Callback URL**: `https://<YOUR-RENDER-APP>.onrender.com/webhook`
   * **Verify Token**: Set a secure secret string (e.g. `ecoloop_mission_verify_token_2026`).
   * **Webhook Fields**: Subscribe to `messages`.

---

### 2. One-Click Render Deployment
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New -> Web Service** and connect this repository.
3. Set the **Root Directory** to `whatsapp-bot`.
4. Configure Environment Variables:
   ```env
   PORT=10000
   BASE_URL=https://<YOUR-RENDER-SERVICE-NAME>.onrender.com
   WHATSAPP_PHONE_NUMBER_ID=<YOUR_META_PHONE_NUMBER_ID>
   WHATSAPP_ACCESS_TOKEN=<YOUR_META_PERMANENT_ACCESS_TOKEN>
   WHATSAPP_VERIFY_TOKEN=ecoloop_mission_verify_token_2026
   MONGODB_URI=mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/ecoloop?retryWrites=true&w=majority
   CAMPUS_NAME="NMAM Institute of Technology, Nitte"
   ```
5. Click **Deploy Web Service**.

---

### 3. Local Development & Testing Simulator

You can test the entire bot locally without needing Meta API credentials:

```bash
cd whatsapp-bot
npm install

# Run the end-to-end multi-role test simulator
npm run simulate

# Start the local development server on port 5001
npm run dev
```

The simulator runs through all 4 roles in seconds:
* Student registers a laptop (~2.4 kg), receives QR image, and books a pickup.
* Collector scans the QR code, inputs calibrated weight (2.45 kg), and marks it collected.
* Admin views live dashboard, generates the NAAC PDF, and executes recycler handover.
* Recycler scans the QR, marks it recycled, generates the Digital EPR Certificate PDF, and credits student points (+25 PTS).
* Student checks updated points and hostel leaderboard!

---

## 🏛️ Official CPCB Recycler Directory (Seed Data)

The included seed script (`npm run seed`) populates reference recyclers from official CPCB-approved records:

| Recycler Facility | Location | Annual Capacity | CPCB Reg No. |
| :--- | :--- | :--- | :--- |
| **M/s WB E-Waste Control Management Pvt. Ltd.** | Howrah, West Bengal | 19,992 MT/year | `CPCB/EPR/2023/REC-0595` |
| **M/s J. S. Pigments Pvt. Ltd.** | Hooghly, West Bengal | 600 MT/year | `CPCB/EPR/2022/REC-0142` |
| **M/s Bhanu Metal Industries** | 24 Parganas (N), WB | 600 MT/year | `CPCB/EPR/2023/REC-0219` |
| **M/s Hindusthan Recycling** | Purulia, West Bengal | 6,960 MT/year | `CPCB/EPR/2023/REC-0481` |

* **CPCB Official EPR Portal**: [https://eprewastecpcb.in](https://eprewastecpcb.in)
* **Carbon Credit Factor**: 1 kg e-waste recycled = **1.44 kg CO2e avoided**.
* **Reward Structure**: **10 Points** per verified kg collected.

---

## 📄 License
MIT License • Engineered for the **HACK4SDG Innovation Challenge** • United Nations SDG 12 (Responsible Consumption & Production) and SDG 13 (Climate Action).
