# 🚀 Quick Start Guide - Team Task Manager

## Current Status
✅ Frontend and Backend code is complete  
✅ All dependencies installed  
⚠️ MongoDB needs to be installed and running  

## Option 1: Install MongoDB Locally (Recommended)

### Windows Installation
1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download and run the installer

2. **Install MongoDB**
   - Choose "Complete" installation
   - Install MongoDB Compass (optional GUI tool)
   - Complete the installation

3. **Start MongoDB Service**
   ```bash
   # Open Command Prompt as Administrator
   net start MongoDB
   ```

4. **Verify Installation**
   ```bash
   mongod --version
   mongo --version
   ```

### Alternative: Use Docker
```bash
# Pull and run MongoDB container
docker run --name mongodb -p 27017:27017 -d mongo:latest
```

## Option 2: Use MongoDB Atlas (Cloud Database)

1. **Create Free Account**
   - Go to: https://www.mongodb.com/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Create New Cluster"
   - Choose "M0 Sandbox" (free tier)
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Get Connection String**
   - Wait for cluster to be created
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Update Environment**
   - Edit `backend/.env`
   - Replace `MONGODB_URI` with your connection string

## Option 3: Quick Test Without Database (Temporary)

For immediate testing, I can create a simple mock setup. Let me know if you want this option.

## 🏃‍♂️ Once MongoDB is Ready

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 🎯 Demo Credentials

After starting the application:
- **Admin**: admin@example.com / admin123
- **Member**: member@example.com / member123

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
net start MongoDB

# If not installed, download from: https://www.mongodb.com/try/download/community
```

### Port Already in Use
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000
npx kill-port 5000
```

### Backend Errors
- Check MongoDB connection in `backend/.env`
- Verify MongoDB service is running
- Check console logs for specific errors

## 📞 Need Help?

If you encounter any issues:
1. Check MongoDB is installed and running
2. Verify environment variables are set correctly
3. Check that ports 3000 and 5000 are available

---

**Choose one of the MongoDB options above and let me know when you're ready to proceed!** 🚀
