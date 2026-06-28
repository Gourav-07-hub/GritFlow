# 🌟 GritFlow — Self Improvement App

A full-stack production-ready Self Improvement Dashboard
built with React, Node.js, Express, MongoDB and Socket.io.

## ✨ Features
- ✅ Habit Tracker with streaks
- 🎯 Goal Setting with milestones
- 📓 Reflection Journal with mood tracking
- ⏱️ Focus Timer (Pomodoro)
- 🙏 Gratitude Journal
- 📊 Statistics Dashboard
- 🏆 Achievements System
- 👥 Friends & Social System
- 💬 Real-time Chat with Socket.io
- 🌙 Dark / Light Mode
- 🔔 Real-time Notifications

## 🛠️ Tech Stack
**Frontend:** React 18, Vite, React Router v6
**Backend:** Node.js, Express.js
**Database:** MongoDB, Mongoose
**Real-time:** Socket.io
**Auth:** JWT + bcrypt
**Storage:** Cloudinary

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- Cloudinary account

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/life-dashboard.git
cd life-dashboard
\`\`\`

2. Setup server:
\`\`\`bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
\`\`\`

3. Setup client:
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

### Environment Variables

Create `server/.env` with:
\`\`\`
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

## 📁 Project Structure
\`\`\`
life-dashboard/
├── client/          → React frontend
└── server/          → Express backend
\`\`\`

## 👨‍💻 Developer
Built with ❤️ as a self improvement productivity app
\`\`\`

---
