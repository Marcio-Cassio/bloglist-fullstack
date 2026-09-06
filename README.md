# Bloglist Fullstack

A fullstack blog application built as part of the Full Stack Open course.
The backend lives at the repository root; the frontend is in `frontend/`.
Express serves the built frontend, so the whole app runs as a single service.

## Live app

https://bloglist-fullstack-b697.onrender.com/

## Stack

- **Backend:** Node, Express, Mongoose, MongoDB Atlas
- **Frontend:** React, Vite, React Query, React Router, Tailwind
- **Testing:** node:test + supertest (backend), Vitest + Testing Library (frontend), Playwright (e2e)
- **CI/CD:** GitHub Actions, deployed to Render

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the backend in watch mode |
| `npm start` | Start the backend in production mode |
| `npm test` | Run backend tests |
| `npm run lint` | Lint the backend |
| `npm run build:frontend` | Install frontend deps and build to `frontend/dist` |
| `npm run test:frontend` | Run frontend component tests |
| `npm run lint:frontend` | Lint the frontend |
| `npm run test:e2e` | Run Playwright end-to-end tests |

## Pipeline

Every pull request runs lint, tests, and end-to-end tests for both the
backend and the frontend. Merging to `main` additionally deploys to Render,
bumps the version tag, and posts a notification to Discord. Adding `#skip`
to a commit message skips the deployment.

## Environment variables

The backend expects `MONGODB_URI`, `TEST_MONGODB_URI`, `SECRET`, and `PORT`.