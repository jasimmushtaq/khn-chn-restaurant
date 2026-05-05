#  Full-Stack Restaurant Website

A complete full-stack restaurant website with admin panel built with the MERN stack.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| Image Upload | Multer |
| Styling | Custom gold & dark theme + Glassmorphism |

---

## 📁 Project Structure

```
restaurant-app/
├── client/                   # React frontend
│   └── src/
│       ├── components/       # Navbar, Footer, DishCard, ProtectedRoute
│       ├── context/          # AuthContext (JWT session)
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── MenuPage.jsx
│       │   ├── PromotionsPage.jsx
│       │   ├── ContactPage.jsx
│       │   └── admin/
│       │       ├── AdminLogin.jsx
│       │       ├── AdminRegister.jsx
│       │       ├── AdminLayout.jsx
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminDishes.jsx
│       │       └── AdminPosters.jsx
│       └── services/
│           └── api.js        # Axios API service
│
└── server/                   # Express backend
    ├── controllers/          # authController, dishController, posterController
    ├── middleware/           # authMiddleware (JWT), uploadMiddleware (Multer)
    ├── models/               # Admin, Dish, Poster schemas
    ├── routes/               # authRoutes, dishRoutes, posterRoutes
    ├── uploads/              # Stored image files
    └── server.js             # Entry point
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone / Navigate to project
```bash
cd "restaurant-app"
```

### 2. Setup Backend
```bash
cd server
npm install
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/restaurant_db
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

The app runs at **http://localhost:3000**

---

## 🌐 Public Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with hero, stats, poster slider, featured dishes & about |
| `/menu` | Full menu with search, category filter, and sort |
| `/promotions` | Promotional banners from admin |
| `/contact` | Contact form, map, and restaurant info |

---

## 🔐 Admin Panel

| Route | Description |
|-------|-------------|
| `/admin/register` | Register first admin account |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Overview: dish/poster counts, recent dishes |
| `/admin/dishes` | Add / Edit / Delete dishes with image upload |
| `/admin/posters` | Add / Edit / Delete / Toggle promotional posters |

### First Time Setup
1. Go to `http://localhost:3000/admin/register`
2. Create your admin account with email + password
3. You'll be redirected to the dashboard automatically

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register    # Register admin
POST /api/auth/login       # Login admin (returns JWT)
GET  /api/auth/profile     # Get admin profile (protected)
```

### Dishes
```
GET    /api/dishes           # Get all dishes (public)
GET    /api/dishes/:id       # Get single dish
POST   /api/dishes           # Add dish (admin, multipart/form-data)
PUT    /api/dishes/:id       # Update dish (admin)
DELETE /api/dishes/:id       # Delete dish (admin)
```

### Posters
```
GET    /api/posters          # Get active posters (public)
GET    /api/posters/admin/all  # Get all posters (admin)
POST   /api/posters          # Add poster (admin)
PUT    /api/posters/:id      # Update poster (admin)
DELETE /api/posters/:id      # Delete poster (admin)
```

---

## ✨ Features

### Frontend
- 🎨 Premium dark theme with gold (#c8963e) palette
- 🔠 Playfair Display & Inter fonts
- 💎 Glassmorphism UI components
- ✨ Smooth hover animations & transitions
- 📱 Fully mobile responsive
- 🎠 Auto-advancing hero slider & poster carousel
- 🔍 Search + category filter + sort on menu
- 🔔 Toast notifications (react-hot-toast)
- ⏳ Skeleton loading states
- 🖼️ Image preview before upload

### Backend
- 🔐 JWT authentication with bcryptjs password hashing
- 📁 Multer image upload (10MB limit, image-only filter)
- 🗑️ Automatic image cleanup on dish/poster deletion
- 🌐 CORS configured for localhost:3000 & localhost:5173
- ⚠️ Global error handling middleware
