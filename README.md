
---

## 📄 `travel` (Backend – NestJS) `README.md`

```markdown
# 🚀 Travel Package Management System – Backend

The backend API for the Travel Platform built using **NestJS**, **MongoDB**, and **Socket.IO**. Handles authentication, agency/user/admin logic, payments, booking, chat, notifications, and more.

## 🛠️ Tech Stack
- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (via Cookies)
- **Real-time**: Socket.IO
- **Payment**: Razorpay Integration
- **Architecture**: Modular, Scalable Structure (MVC/Repository Pattern)
- **Deployment**: AWS EC2, Nginx

## 📌 Core Features
- User, Admin, and Agency auth using JWT (stored in cookies)
- Agency registration with document verification & status flags
- Travel package CRUD (with category, destination, images, etc.)
- Booking management with cancellation and refund handling
- Wallet system with refund tracking
- Real-time notifications and chat system using WebSocket
- Admin analytics and reports
- OTP system for verification

## 🌐 API Base URL
http://localhost:3000/api


## 📦 Installation

```bash
git clone https://github.com/shibil885/Travel-be.git
cd Travel-be
npm install
npm run start:dev

⚠️ Requires .env file with Razorpay key, DB connection, JWT secrets

MONGODB_URI=your_mongo_uri
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
