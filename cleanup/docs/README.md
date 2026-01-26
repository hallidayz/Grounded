# Grounded — Overview

Grounded is a mindful reflection tool designed to help users align daily moods and values.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
npm run dev
```

### 2. Build Commands
| Command | Description |
|----------|-------------|
| `npm run build` | Builds optimized production version |
| `npm run tauri dev` | Launches desktop preview |
| `npm run build-installers` | Builds both web and Tauri installers |

---

## ⚙️ Technical Overview
- **Frontend**: React + TypeScript + Vite
- **State**: Context + hooks (`useDashboard`, `useInstallationStatus`)
- **Database**: IndexedDB (Dexie)
- **Offline Support**: PWA (Service Worker)

---

## 📦 Deployment
- Configured for either **Vercel** or **Netlify**.
- Auto‑updates enabled for Tauri builds.

---

## 🧩 Development Notes
- Use `npm run lint` before commits.
- PRs require passing commit validation.
- Add documentation for new hooks and contexts inside `/docs`.

---

© 2026 — Grounded Development Team

