# Wrath of God (WOG) Scrim Manager

A premium, full-stack management system for esports teams to track scrims, player turns, and team financials.

## 🚀 Tech Stack
- **Frontend**: React (Vite), CSS Modules, Framer Motion, Lucide React
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: JWT, bcryptjs
- **Icons**: Lucide React

## 📂 Project Structure
```text
WOG/
├── client/          # Vite + React Frontend
└── server/          # Node.js + Express Backend
```

## 🛠️ Local Setup

### 1. Prerequisite
- Node.js installed
- MongoDB (Local or Atlas)

### 2. Backend Setup
```bash
cd server
npm install
# Create .env based on .env.example
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
# Create .env based on .env.example
npm run dev
```

## 🌐 Deployment

### Backend (Render)
1. Push this repository to GitHub.
2. Connect the repository to **Render**.
3. Use the `server/render.yaml` blueprint or manual setup:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, etc.).

### Frontend (Vercel)
1. Connect the repository to **Vercel**.
2. Set the **Root Directory** as `client`.
3. Add Environment Variable `VITE_API_URL` pointing to your Render backend.
4. Deploy!

## 🔐 Role-Based Access
- **Admin**: Full control over players, match history, and profile updates.
- **Viewer**: Read-only access to dashboard and history.

---
Created with ❤️ for WOG Team.
