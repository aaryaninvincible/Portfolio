# Aryan Raikwar Portfolio

Personal portfolio for Aryan Raikwar, built to present AI/ML, Python, web, and research-oriented projects in one place.

## Overview

This is a React + TypeScript portfolio application powered by Vite. It includes project showcases, certificates, resume access, contact workflows, GitHub project listings, and interactive demo pages for selected work.

Live portfolio: [aaryaninvincible-portfolio.vercel.app](https://aaryaninvincible-portfolio.vercel.app/)

## Features

- Project catalog with AI/ML, computer vision, cybersecurity, web, and mobile projects.
- Dedicated pages for resume, certifications, updates, contact, and all work.
- Firebase-backed contact/admin data paths.
- Responsive UI built with Tailwind CSS, React Router, Framer Motion, and Lucide icons.
- Static demos for projects such as GestureX, Optical Fibre Daylighting, and Research Paper Management.
- Vercel-ready production build.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, React Router
- **Styling:** Tailwind CSS, Framer Motion
- **Backend services:** Firebase
- **Tooling:** ESLint, PostCSS, Vercel, Firebase Hosting config

## Project Structure

```text
Portfolio/
├── public/                 # Images, certificates, PDFs, demos, thumbnails
├── src/
│   ├── components/         # Shared UI components
│   ├── data/               # Portfolio project and certificate data
│   ├── lib/                # Firebase, GitHub, audio, realtime helpers
│   ├── pages/              # Route-level pages
│   ├── App.tsx             # App shell and routing
│   └── main.tsx            # React entry point
├── firebase.json           # Firebase hosting config
├── vercel.json             # Vercel routing config
└── package.json
```

## Installation

```bash
npm install
```

## Usage

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Notes

- Firebase rules are included in `database.rules.json` and `storage.rules`.
- Large visual assets and certificates live under `public/`.
- Project metadata is maintained in `src/data/mainProjects.ts` and `src/data/githubPagesProjects.ts`.

## Author

Aryan Raikwar  
GitHub: [aaryaninvincible](https://github.com/aaryaninvincible)
