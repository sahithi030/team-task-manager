# How to Run the Team Task Manager Project

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies at once (recommended)
npm run install-deps
```

### Step 2: Environment Setup

#### Backend Environment (.env file)
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

#### Frontend Environment (.env file)
Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your backend `.env` file

### Step 4: Run the Application

**Option A: Development Mode (Recommended)**
```bash
npm run dev
```
This will start both frontend and backend concurrently.

**Option B: Manual Setup**
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm start
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

## 📱 Demo Accounts

After starting the application, you can use these demo accounts:

### Admin Account
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Admin (full access)

### Member Account
- **Email**: member@example.com
- **Password**: member123
- **Role**: Member (limited access)

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Error
**Problem**: `MongoDB connection error`
**Solution**:
- Ensure MongoDB is running locally
- Check your connection string in `.env`
- Verify network connectivity

#### 2. Port Already in Use
**Problem**: `Port 3000 or 5000 already in use`
**Solution**:
```bash
# Kill processes on ports
npx kill-port 3000
npx kill-port 5000
```

#### 3. Module Not Found Errors
**Problem**: `Cannot find module` errors
**Solution**:
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run install-deps
```

#### 4. JWT Secret Missing
**Problem**: Authentication not working
**Solution**: Ensure `JWT_SECRET` is set in backend `.env` file

#### 5. CORS Issues
**Problem**: Frontend can't connect to backend
**Solution**: Check `REACT_APP_API_URL` in frontend `.env` file

## 🐛 Development Tips

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start   # Hot reload enabled
```

### Database Operations
```bash
# Connect to MongoDB shell
mongo task-manager

# View collections
show collections

# Query users
db.users.find().pretty()
```

## 📊 Project Structure

```
team-task-manager/
├── backend/                 # Node.js/Express API
│   ├── models/              # MongoDB schemas (User, Project, Task)
│   ├── routes/              # API endpoints
│   ├── middleware/          # Authentication and validation
│   ├── .env.example         # Environment template
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── contexts/       # React contexts (Auth)
│   │   └── services/       # API services
│   └── .env.example        # Environment template
├── package.json            # Root package.json with scripts
└── README.md              # Full documentation
```

## 🎯 Quick Test Workflow

1. **Start the application**: `npm run dev`
2. **Open browser**: Navigate to http://localhost:3000
3. **Register a new user** or use demo accounts
4. **Create a project**: Click "New Project"
5. **Add tasks**: Create and assign tasks to team members
6. **Test collaboration**: Add comments, update statuses

## 🚀 Production Deployment

For deployment to Railway:

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Railway**:
- Connect GitHub repository to Railway
- Set up backend and frontend services
- Configure environment variables
- Deploy automatically

## 📞 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure MongoDB is accessible
4. Check console logs for specific errors

---

**Happy coding! 🎉**
