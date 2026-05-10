# 🚀 Railway Deployment Guide

## Step 1: Prepare Your Project

### 1.1 Create GitHub Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Team Task Manager"

# Create repository on GitHub and connect
git remote add origin https://github.com/yourusername/team-task-manager.git
git push -u origin main
```

### 1.2 Update Environment Variables for Production

**Backend Environment Variables Needed:**
- `PORT=5000`
- `MONGODB_URI=mongodb+srv://chowdarynithin2003_db_user:vOgOb1gKxIiBBObD@cluster0.tnc2chn.mongodb.net/task-manager?retryWrites=true&w=majority`
- `JWT_SECRET=your-production-jwt-secret-key`
- `NODE_ENV=production`

**Frontend Environment Variables Needed:**
- `REACT_APP_API_URL=https://your-backend-url.railway.app/api`

## Step 2: Deploy to Railway

### 2.1 Login to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### 2.2 Initialize Railway Project
```bash
# In your project root
railway init
```

### 2.3 Deploy Backend Service
```bash
# Deploy backend
cd backend
railway up
```

### 2.4 Set Backend Environment Variables
In Railway dashboard for your backend service:
1. Go to Settings → Variables
2. Add these variables:
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://chowdarynithin2003_db_user:vOgOb1gKxIiBBObD@cluster0.tnc2chn.mongodb.net/task-manager?retryWrites=true&w=majority`
   - `JWT_SECRET=your-production-jwt-secret-key-change-this`
   - `NODE_ENV=production`

### 2.5 Deploy Frontend Service
```bash
# Deploy frontend
cd frontend
railway up
```

### 2.6 Set Frontend Environment Variables
In Railway dashboard for your frontend service:
1. Go to Settings → Variables
2. Add: `REACT_APP_API_URL=https://your-backend-url.railway.app/api`

## Step 3: Configure Railway Services

### 3.1 Backend Service Configuration
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: 5000
- **Health Check Path**: `/api/health`

### 3.2 Frontend Service Configuration
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: 3000

## Step 4: Test Your Deployment

### 4.1 Get Your URLs
After deployment, Railway will provide:
- Backend URL: `https://your-backend-url.railway.app`
- Frontend URL: `https://your-frontend-url.railway.app`

### 4.2 Test API Endpoints
```bash
# Test backend health
curl https://your-backend-url.railway.app/api/health

# Test user registration
curl -X POST https://your-backend-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","username":"johndoe","email":"john@example.com","password":"123456","role":"member"}'
```

### 4.3 Access Your Application
Open your frontend URL in the browser and test:
- User registration
- User login
- Create projects
- Create tasks
- Team collaboration

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. In Railway dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
- Verify MongoDB Atlas connection string
- Ensure IP whitelist includes Railway's IP ranges
- Check database user permissions

#### 2. CORS Issues
- Ensure frontend API URL is correct
- Check backend CORS configuration

#### 3. Build Failures
- Check package.json scripts
- Verify all dependencies are installed
- Check for syntax errors

#### 4. Environment Variables
- Ensure all required variables are set
- Check for typos in variable names
- Verify sensitive data is correctly escaped

### Railway CLI Commands
```bash
# View logs
railway logs

# View service status
railway status

# Redeploy service
railway up

# Open service in browser
railway open
```

## Production Checklist

- [ ] MongoDB Atlas IP whitelist configured
- [ ] Environment variables set for both services
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active (automatic with Railway)
- [ ] Error monitoring set up
- [ ] Performance monitoring configured
- [ ] Backup strategy for database

## Support

- Railway Documentation: https://docs.railway.app/
- MongoDB Atlas Documentation: https://docs.mongodb.com/atlas/
- GitHub Issues: Create issue in your repository

---

**Your Team Task Manager will be live and fully functional after following these steps!** 🚀
