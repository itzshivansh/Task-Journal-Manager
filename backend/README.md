# Task & Journal Manager API (Express + MongoDB)

## Setup
- `cp .env.example .env`
- Edit `MONGODB_URI`, `JWT_SECRET`
- `npm install`
- `npm run dev`

## Routes (base `/api`)
Auth:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Tasks:
- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/reorder`

Journal:
- `GET /journal/today`
- `PUT /journal/today`
- `GET /journal/history`
- `GET /journal/calendar?month=YYYY-MM`
- `GET /journal/:date`
- `DELETE /journal/:date`

Dashboard:
- `GET /dashboard`

