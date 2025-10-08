# Text Africa Arcade (TAA) - Full Stack Project

Two folders:
- frontend — React + Vite + Tailwind
- backend — Node/Express + MongoDB + Mongoose

## Prerequisites
- Node.js 18+ and npm
- MongoDB running locally or a MongoDB URI

## Backend setup
1. cd backend
2. cp .env.example .env and edit values
3. npm install
4. npm run dev  (or npm start)

Default backend server: http://localhost:5000

## Frontend setup
1. cd frontend
2. npm install
3. create a `.env` file (optional) with `VITE_API_URL=http://localhost:5000/api`
4. npm run dev

Frontend default: http://localhost:5173

## Notes
- Contact form posts to `POST /api/contact`
- Auth endpoints: `POST /api/auth/register` and `/api/auth/login`
- Replace JWT secret and MONGO_URI in backend .env for production.
