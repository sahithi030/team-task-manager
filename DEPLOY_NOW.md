# 🚀 Deploy Team Task Manager to Railway

## Quick Deployment Steps

### 1. Create GitHub Repository
1. Go to GitHub.com and create new repository: `team-task-manager`
2. Push your code to GitHub:
```bash
git remote add origin https://github.com/yourusername/team-task-manager.git
git push -u origin main
```

### 2. Deploy to Railway

#### Option A: Railway CLI (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize Railway project
railway init

# Deploy backend
cd backend
railway up

# Deploy frontend
cd frontend
railway up
```

#### Option B: Railway Dashboard (Easier)
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Connect your GitHub repository
4. Select "Backend" service
5. Set environment variables:
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://chowdarynithin2003_db_user:vOgOb1gKxIiBBObD@cluster0.tnc2chn.mongodb.net/task-manager?retryWrites=true&w=majority`
   - `JWT_SECRET=your-production-jwt-secret-key`
   - `NODE_ENV=production`
6. Deploy backend service

7. Add "Frontend" service
8. Set environment variables:
   - `REACT_APP_API_URL=https://your-backend-url.railway.app/api`
9. Deploy frontend service

### 3. Configure Environment Variables

**Backend Variables:**
- PORT=5000
- MONGODB_URI=mongodb+srv://chowdarynithin2003_db_user:vOgOb1gKxIiBBObD@cluster0.tnc2chn.mongodb.net/task-manager?retryWrites=true&w=majority
- JWT_SECRET=your-production-jwt-secret-key
- NODE_ENV=production

**Frontend Variables:**
- REACT_APP_API_URL=https://your-backend-url.railway.app/api

### 4. Test Your Live Application

After deployment, your app will be available at:
- Backend: `https://your-backend-url.railway.app`
- Frontend: `https://your-frontend-url.railway.app`

### 5. Access Your Application

1. **Register new users** (no demo accounts)
2. **Create projects** and invite team members
3. **Add tasks** and assign to team members
4. **Track progress** with status updates
5. **Collaborate** with comments and real-time updates

---

**Your Team Task Manager will be live on Railway!** 🎯
