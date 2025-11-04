# BloodStream - Blood Donation Management Platform

A comprehensive blood donation management system with role-based dashboards for donors, recipients, delivery personnel, and administrators.

## 🚀 Features

- **Digital Blood Cards** with QR codes
- **Real-time tracking** of blood deliveries
- **Role-based dashboards** (Donor, Recipient, Delivery, Admin)
- **Live notifications** using Socket.IO
- **Interactive maps** for finding nearby donors/blood banks
- **Leaderboard** for top donors
- **Dark/Light mode** toggle
- **Mobile responsive** design

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- React Query
- Zustand
- Socket.IO Client
- React Leaflet
- Framer Motion

### Backend
- Node.js & Express
- MongoDB with Mongoose
- Socket.IO
- JWT Authentication
- Bcrypt for password hashing

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Git

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/bloodstream.git
cd bloodstream
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NODE_ENV=production
CLIENT_URL=https://your-frontend.onrender.com
```

### 3. Setup Frontend
```bash
cd ../client
npm install
```

Create `.env` file:
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

### 4. Seed Database (Optional)
```bash
cd server
npm run seed
```

## 🚀 Running Locally

### Start Backend
```bash
cd server
npm run dev
```

### Start Frontend
```bash
cd client
npm run dev
```
