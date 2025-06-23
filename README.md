
# AI Business Strategy & Content Platform

This project is a full-stack AI-powered SaaS platform designed to act as a "Strategic AI Partner" for businesses. It analyzes business profiles, generates strategic insights (SWOT, competitors, audience personas), creates data-driven marketing plans, and produces high-quality marketing content.

## Project Structure

This is a monorepo containing two main packages:

-   `backend/`: Node.js, Express.js, TypeScript, PostgreSQL, Redis, Prisma ORM.
-   `frontend/`: Next.js (App Router), TypeScript, Tailwind CSS, Zustand.

Refer to the README files within each package directory for specific instructions on running and developing those parts of the application.

## Prerequisites

-   Node.js (latest LTS version recommended)
-   Docker and Docker Compose
-   npm or yarn

## Getting Started (High-Level)

1.  **Clone the repository.**
2.  **Backend Setup:**
    *   Navigate to the `backend/` directory.
    *   Create a `.env` file based on `.env.example` (if provided, or follow instructions in `backend/README.md`).
    *   Install dependencies: `npm install`
    *   Run database migrations: `npx prisma migrate dev`
    *   Start the backend services: `docker-compose up -d` (or `npm run dev` for development server).
3.  **Frontend Setup:**
    *   Navigate to the `frontend/` directory.
    *   Create a `.env.local` file based on `.env.local.example` (if provided, or follow instructions in `frontend/README.md`).
    *   Install dependencies: `npm install`
    *   Start the frontend development server: `npm run dev`.

Ensure API keys for Gemini and OpenAI are correctly set in the backend's `.env` file.
The frontend typically connects to the backend at `http://localhost:5000/api`.
