# ☕ Japan Cafe Map

**English** | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

<p align="center">
  <img src="./public/preview1.png" height="500" alt="Map view" />
  <img src="./public/preview2.png" height="500" alt="Cafe details" />
</p>

> A crowdsourced map for finding **work-friendly cafes** across Japan — Google Maps data plus community-reported amenities.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Google Maps API](https://img.shields.io/badge/Google%20Maps%20API-4285F4?style=flat&logo=googlemaps&logoColor=white)

[🌐 Live Demo](https://japan-cafe-map.vercel.app/)

---

## Overview

Google Maps tells you where a cafe is, but not whether it has outlets, Wi-Fi, or a noise level you can tolerate for a three-hour work session. Japan Cafe Map pulls cafes from Google Maps and layers **community-submitted reports** on top, so remote workers and developers can pick a spot before leaving home.

Most map apps optimize for food and popularity, not productivity. This one was built by a remote developer in Japan who kept struggling to find cafes with reliable Wi-Fi, power outlets, and a comfortable place to work.

---

## Features

- 🗺️ **Google Maps integration** — nearby cafes found with the Places API (name, address, location)
- 📝 **Community reports** — signed-in users report the attributes that matter for working:
  - 🔌 Power outlets
  - 📶 Wi-Fi
  - 🔇 Noise level
  - 🪑 Seating
  - ⏱️ Time limit, minimum order, booking, smoking policy
- 🔍 **Filter and discover** — filter cafes by reported amenities (multiple filters match any selected condition)
- ❤️ **Favorites** — save cafes to your own list
- 📍 **Location-aware** — center the map on your current location and search the area
- 🌏 **Three languages** — English, 日本語, 繁體中文

---

## Roadmap

- Community comments
- AI cafe recommendations

---

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | Next.js (App Router), React, TypeScript |
| Styling    | Tailwind CSS, shadcn/ui (Radix)         |
| Maps       | Google Maps JavaScript API, Places API  |
| Backend    | Next.js Route Handlers                  |
| Database   | MongoDB with Prisma                     |
| Email      | Resend (password reset)                 |
| Deployment | Vercel                                  |

---

## Architecture Highlights

- **Browser-side Places search** — the Maps JavaScript API finds nearby cafes, then a Next.js API upserts them by Google Place ID. Existing records are not refreshed from Google automatically.
- **Authenticated contributions** — report and favorite APIs use the verified session identity, never a client-supplied user ID. A failed submission keeps the form input.
- **Community aggregation** — boolean fields use a strict majority, categories use the mode, and tobacco types use a frequency threshold. Unknown stays distinct from false; each user can report a cafe once.
- **Request-time database checks** — pages render dynamically, so a database outage during build is never baked into static output. Reload after recovery to retry.

---

## Getting Started

### Prerequisites

- Node.js 24 recommended (Next.js 16 requires at least 20.9)
- pnpm (version pinned in `package.json`)
- A [Google Cloud](https://console.cloud.google.com/) project with **Maps JavaScript API** and **Places API** enabled
- MongoDB with transaction support (replica set or MongoDB Atlas)
- A Resend account for password-reset emails

### Installation

```bash
git clone https://github.com/ZekeGan/japan-cafe-map.git
cd japan-cafe-map
pnpm install --frozen-lockfile
```

### Environment Variables

Create a `.env` file in the project root (ignored by Git; never commit credentials):

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_browser_maps_key
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_random_server_secret
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- Restrict the browser Maps key by website and API in Google Cloud.
- Keep `DATABASE_URL`, `JWT_SECRET`, and `RESEND_API_KEY` server-only.
- `NEXT_PUBLIC_APP_URL` is used in password-reset links; set it to the real origin. Restart the server after changing configuration.
- The sender is `onboarding@resend.dev` (`src/lib/mail.ts`), which can only email the address of your Resend account. To email other recipients, verify a domain in Resend and change the sender.

Generate the Prisma client before the first run (this does not change the database schema or indexes):

```bash
pnpm exec prisma generate
```

### Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command               | Purpose                                                      |
| --------------------- | ------------------------------------------------------------ |
| `pnpm dev`            | Development server                                           |
| `pnpm check`          | Lint, type check, and tests (no database or email needed)    |
| `pnpm build`          | Generate Prisma client and build; may need network for fonts |
| `pnpm start`          | Serve the production build                                   |
| `pnpm format <files>` | Format specific files with Prettier                          |

In production, set the environment variables in your hosting platform.

---

## Maintenance Docs

This is a small personal showcase maintained on demand. The docs below are written in Traditional Chinese:
[maintenance](docs/maintenance.md) · [architecture](docs/architecture.md) · [current issues](docs/project-status.md) · [changelog](CHANGELOG.md)

---

## Author

**Zeke Gan** — [GitHub](https://github.com/ZekeGan)
