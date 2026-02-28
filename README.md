# 🍽️ Seal Chef's Questionable Recipes

A full-stack MVC web application for sharing, rating, and commenting on (questionable) recipes. Built with Node.js, Express, MongoDB, and Bootstrap 5.

## 🎯 Project Overview

This is a complete CRUD (Create, Read, Update, Delete) application demonstrating a full-stack data round trip from front-end to MongoDB database. Users can create recipes with images, like recipes, and leave comments.

## 🚀 Live Deployments

- **Development (Render):** [https://cis486cumbie-tempname-app.onrender.com/](https://cis486cumbie-tempname-app.onrender.com/)
- **Production (GCP):** https://possiblyediblefoods.barrycumbie.com/

## 💻 Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database (cloud-hosted)
- **dotenv** - Environment variable management

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Styling (charlie-style.css)
- **Bootstrap 5** - Responsive UI framework
- **normalize.css** - CSS reset
- **jQuery** - DOM manipulation and AJAX

### DevOps & Deployment
- **Git & GitHub** - Version control with proper .gitignore
- **GitHub Actions** - CI/CD pipeline (.yaml workflow)
- **Render** - Development deployment
- **Google Cloud Platform (GCP)** - Production deployment with static external IP

### Development Tools
- **nodemon** - Auto-restart server on file changes
- **npm** - Package management

## ✨ Features

### CRUD Operations
- ✅ **Create** - Add new recipes with title, ingredients, instructions, and optional images
- ✅ **Read** - View all recipes with ingredient/instruction details
- ✅ **Update** - Edit existing recipe information
- ✅ **Delete** - Remove recipes from the database

### Additional Features
- 📸 **Image Upload** - Upload recipe images (stored as base64 in MongoDB)
- ❤️ **Like System** - Heart button to like recipes with persistent counts
- 💬 **Comments** - Leave and delete comments on recipes
- 📱 **Mobile Responsive** - Works seamlessly on all device sizes
- 🎨 **Interactive UI** - Smooth animations and hover effects

## 📋 API Endpoints

### Recipes
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `POST /api/recipes/:id/like` - Like a recipe

### Comments
- `GET /api/recipes/:id/comments` - Get recipe comments
- `POST /api/recipes/:id/comments` - Add comment
- `DELETE /api/recipes/:id/comments/:commentId` - Delete comment

### Utilities
- `GET /api/health` - API health check and endpoint documentation

## 🏗️ Project Structure

```
.
├── app.mjs                 # Express server & API routes
├── package.json            # Dependencies & scripts
├── .env                    # Environment variables (git-ignored)
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── .github/
│   └── workflows/
│       └── deploy-main-to-gcp.yml  # CI/CD pipeline
└── public/
    ├── index.html          # Main SPA template
    ├── scripts/
    │   └── script.js       # Frontend logic & AJAX calls
    └── styles/
        └── charlie-style.css  # Custom styling
```

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)
- MongoDB Atlas account (free tier available)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kaden-Trousdale/cis486Cumbie-tempName-app.git
   cd cis486Cumbie-tempName-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory
   - Add your MongoDB connection string:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cis486?retryWrites=true&w=majority
   ```

4. **Start development server with auto-reload**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3000`

5. **Or start production server**
   ```bash
   npm start
   ```

## 📚 What is nodemon? (And Why We Use It)

**nodemon** is a development utility that automatically restarts your Node.js application whenever it detects file changes.

### Purpose & Benefits

1. **Eliminates Manual Restarts** - Without nodemon, you'd need to:
   - Stop the server (Ctrl+C)
   - Run `npm start` again
   - This happens dozens of times per development session

2. **Increases Productivity** - nodemon watches for changes and restarts automatically, allowing you to immediately test your changes

3. **Reduces Context Switching** - You stay focused on coding instead of constantly restarting

### How It Works

```
File Change Detected
        ↓
  Kill Current Process
        ↓
  Restart Server
        ↓
  Ready for Testing
```

### Development vs Production

- **Development** (`npm run dev`): Uses nodemon for auto-restart
- **Production** (`npm start`): Uses standard Node.js (nodemon not needed in production)

This is why we only use nodemon in the `dev` script, not in the `start` script.

## 🔐 Security

- Secrets stored in `.env` file (never committed)
- `.gitignore` prevents accidental secret exposure
- Environment variables securely injected at runtime
- No hardcoded credentials in source code

## 📝 Author

**Kaden Trousdale** - [GitHub Profile](https://github.com/Kaden-Trousdale)

## 📄 License

ISC

## 🎓 Course Information

- **Course:** CIS 486 - Full Stack DevOps
- **Semester:** Spring 2026
- **Project Type:** Full Stack MVC Deployment & Data Round Trip
