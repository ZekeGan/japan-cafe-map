# ☕ Japan Cafe Map

> A crowdsourced map application for discovering **engineer-friendly cafes** across Japan — with real-time Google Maps data and community-driven amenity ratings.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Google Maps API](https://img.shields.io/badge/Google%20Maps%20API-4285F4?style=flat&logo=googlemaps&logoColor=white)

---

## Overview

Japan Cafe Map solves a real problem for remote workers and developers in Japan: **finding cafes where you can actually work**. While Google Maps tells you where a cafe is, it doesn't tell you whether it has outlets, Wi-Fi, or a noise level you can tolerate for a 3-hour deep work session.

This app bridges that gap by pulling cafe data directly from Google Maps and layering it with **community-submitted, engineer-focused ratings** — so you can find the perfect spot before you leave home.

---

## Features

- 🗺️ **Google Maps Integration** — Fetches real cafe listings using the Google Places API, including name, address
- ⭐ **Community Ratings** — Users can rate cafes on attributes that matter to developers:
  - 🔌 Power outlets availability
  - 📶 Wi-Fi quality
  - 🔇 Noise level
  - 🪑 Seating comfort
  - ⏱️ Time limit policy
- 🔍 **Filter & Discover** — Browse and filter cafes by amenity scores to find spots that match your working style
- 📍 **Location-aware** — Centers the map on your current location for quick nearby searches

---

## Tech Stack

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| Frontend   | Next.js, TypeScript, React             |
| Styling    | shadcn / Tailwind CSS                  |
| Maps       | Google Maps JavaScript API, Places API |
| Backend    | Next.js API Routes                     |
| Database   | MongoDB                                |
| ORM        | Prisma                                 |
| Deployment | Vercel                                 |

---

## Architecture Highlights

- **Server-side data fetching** from Google Places API to avoid exposing API keys on the client
- **Optimistic UI updates** for rating submissions to keep interactions snappy
- **Aggregated scoring system** — individual ratings are averaged and displayed as composite amenity scores per cafe

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Cloud](https://console.cloud.google.com/) project with the **Maps JavaScript API** and **Places API** enabled

### Installation

```bash
git clone https://github.com/ZekeGan/japan-cafe-map.git
cd japan-cafe-map
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
- DATABASE_URL=
- JWT_SECRET=
```

### Run Locally

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Author

**Zeke Gan** — [GitHub](https://github.com/ZekeGan)
