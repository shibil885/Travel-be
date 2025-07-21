
---

## 📄 `travel` (Backend – NestJS)

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
```
⚠️ Requires .env file with Razorpay key, DB connection, JWT secrets
```env
# ============================
# 🌐 Database Configuration
# ============================
DATABASE_HOST=mongodb+srv://username:password@cluster0.mongodb.net/database_name

# ============================
# 📧 Email Configuration
# ============================
EMAIL=your-email@example.com
PASSWORD=your-email-password-or-app-password  # For Gmail, use App Password if 2FA is enabled

# ============================
# 🔐 JWT Configuration
# ============================
JWT_SECRET=your_super_secret_key_here
ACCESS_TOKEN_EXPIRY=15m           # e.g., 15m, 1h, 7d
REFRESH_TOKEN_EXPIRY=7d           # e.g., 1d, 7d

# ============================
# ☁️ Cloudinary Configuration
# ============================
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ============================
# 💳 Razorpay Configuration
# ============================
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ============================
# 💸 Application Settings
# ============================
SERVICE_CHARGE=5                  # percentage or fixed value depending on your logic

# ============================
# 🌐 Frontend Configuration
# ============================
FRONTEND_URL=https://your-frontend-domain.com

# ============================
# 👤 Default Assets
# ============================
DEFAULT_PROFILE=https://res.cloudinary.com/your_cloud/image/upload/v123456789/default_profile.png

# ============================
# 🔁 Password Reset Settings
# ============================
RESET_PASSWORD=https://your-frontend-domain.com/reset-password
RESET_TOKEN_EXPIRATION=15m        # Reset token expiry duration

```