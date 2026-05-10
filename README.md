# Team Task Manager

A comprehensive full-stack team task management application built with React, Node.js, Express, and MongoDB. Features role-based access control, project management, task tracking, and real-time collaboration.

## 🚀 Features

### Core Features
- **User Authentication**: Secure signup/login with JWT tokens
- **Role-Based Access Control**: Admin and Member roles with different permissions
- **Project Management**: Create, edit, and manage projects with team members
- **Task Management**: Create, assign, and track tasks with statuses and priorities
- **Team Collaboration**: Add/remove team members, assign tasks, and comment on tasks
- **Dashboard**: Real-time statistics and overview of projects and tasks
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

### Advanced Features
- **Task Status Tracking**: Todo, In Progress, Review, Completed, Cancelled
- **Priority Levels**: Low, Medium, High, Urgent
- **Due Date Management**: Track overdue tasks and deadlines
- **Project Member Management**: Admin/Member roles within projects
- **Search and Filtering**: Advanced search and filter capabilities
- **Real-time Updates**: Live dashboard statistics
- **User Profiles**: Manage account settings and information

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **React Query**: Server state management and caching
- **React Hook Form**: Form handling and validation
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Axios**: HTTP client for API calls

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **Helmet**: Security middleware
- **express-rate-limit**: Rate limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd team-task-manager
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies at once
npm run install-deps
```

### 3. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

#### Frontend Environment
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the application

#### Development Mode (Recommended)
```bash
npm run dev
```
This will start both frontend and backend concurrently.

#### Manual Setup
```bash
# Start backend
cd backend && npm run dev

# Start frontend (in another terminal)
cd frontend && npm start
```

## 🌐 Deployment

### Railway Deployment

#### Prerequisites
- Railway account
- Railway CLI installed

#### Steps

1. **Login to Railway**
```bash
railway login
```

2. **Initialize Railway project**
```bash
railway init
```

3. **Deploy Backend**
```bash
cd backend
railway up
```

4. **Set Environment Variables**
In Railway dashboard, set these variables for the backend service:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `NODE_ENV`: `production`

5. **Deploy Frontend**
```bash
cd frontend
railway up
```

6. **Configure Frontend**
Set `REACT_APP_API_URL` to your backend Railway URL.

#### Alternative: Using Railway Dashboard
1. Connect your GitHub repository to Railway
2. Set up two services: one for backend, one for frontend
3. Configure environment variables
4. Deploy automatically on push to main branch

### Environment Variables for Production

#### Backend
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-manager
JWT_SECRET=your-production-jwt-secret-key
NODE_ENV=production
```

#### Frontend
```env
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

## 📊 Database Schema

### Users Collection
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['admin', 'member'], default: 'member'),
  avatar: String,
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Projects Collection
```javascript
{
  name: String (required),
  description: String,
  owner: ObjectId (ref: 'User', required),
  members: [{
    user: ObjectId (ref: 'User'),
    role: String (enum: ['admin', 'member'], default: 'member'),
    joinedAt: Date (default: Date.now)
  }],
  status: String (enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  startDate: Date,
  endDate: Date,
  tags: [String],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection
```javascript
{
  title: String (required),
  description: String,
  project: ObjectId (ref: 'Project', required),
  assignedTo: ObjectId (ref: 'User'),
  createdBy: ObjectId (ref: 'User', required),
  status: String (enum: ['todo', 'in-progress', 'review', 'completed', 'cancelled'], default: 'todo'),
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  dueDate: Date,
  completedAt: Date,
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  comments: [{
    user: ObjectId (ref: 'User'),
    text: String (required),
    createdAt: Date (default: Date.now)
  }],
  dependencies: [ObjectId (ref: 'Task')],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/stats` - Get user statistics (admin only)

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member to project
- `DELETE /api/projects/:id/members/:userId` - Remove member from project
- `GET /api/projects/:id/tasks` - Get project tasks

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task
- `PUT /api/tasks/:id/status` - Update task status
- `GET /api/tasks/dashboard/stats` - Get dashboard statistics
- `GET /api/tasks/dashboard/recent` - Get recent tasks

## 🎯 Role-Based Access Control

### Admin Role
- Manage all users (create, update, delete)
- Access all projects and tasks
- Manage project members
- View system statistics

### Member Role
- Create and manage own projects
- Participate in assigned projects
- Create and manage tasks within projects
- Update own profile

### Project-Specific Roles
- **Project Owner**: Full control over project
- **Project Admin**: Can manage members and tasks
- **Project Member**: Can view and create tasks

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 Scripts

### Root Scripts
- `npm run dev` - Start both frontend and backend in development
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run install-deps` - Install all dependencies

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🎨 UI Components

### Reusable Components
- `Navbar` - Navigation header with user menu
- `Sidebar` - Main navigation sidebar
- `StatCard` - Dashboard statistics cards
- `TaskItem` - Task display component
- `ProjectCard` - Project display component
- `Modal` - Reusable modal component

### Custom Styles
- Tailwind CSS utility classes
- Custom component classes in `index.css`
- Responsive design patterns
- Dark mode support (planned)

## 🔧 Configuration

### Backend Configuration
- Express middleware setup
- Database connection configuration
- JWT token configuration
- Security headers configuration
- Rate limiting configuration

### Frontend Configuration
- React Query configuration
- Axios interceptors for auth
- Route protection
- Form validation setup

## 🚀 Performance Optimizations

### Backend
- Database indexing for queries
- Input validation and sanitization
- Rate limiting for API endpoints
- Efficient aggregation pipelines

### Frontend
- React Query caching and background refetching
- Component lazy loading (planned)
- Image optimization (planned)
- Bundle size optimization

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers with Helmet
- Role-based access control

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

#### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env` file
- Verify network connectivity

#### JWT Token Issues
- Clear browser localStorage
- Check JWT_SECRET environment variable
- Verify token expiration

#### CORS Issues
- Check frontend API URL configuration
- Verify backend CORS settings

#### Build Errors
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify environment variables

### Getting Help

- Check the [Issues](../../issues) page
- Create a new issue with detailed information
- Join our Discord community (link coming soon)

## 📞 Contact

- Project Link: [GitHub Repository](../../)
- Live Demo: [Deployed Application](https://your-app-url.railway.app)
- Author: [Your Name](mailto:your.email@example.com)

---

**Built with ❤️ for efficient team collaboration**
