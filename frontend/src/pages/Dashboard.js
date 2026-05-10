import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CheckSquare, 
  FolderOpen, 
  Users, 
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
  <div className="card hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        {change && (
          <div className={`flex items-center mt-2 text-sm ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// Task Item Component
const TaskItem = ({ task }) => {
  const getStatusColor = (status) => {
    const colors = {
      'todo': 'status-todo',
      'in-progress': 'status-in-progress',
      'review': 'status-review',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return colors[status] || 'status-todo';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high',
      'urgent': 'priority-urgent'
    };
    return colors[priority] || 'priority-medium';
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3">
        <CheckSquare className="w-5 h-5 text-gray-400" />
        <div>
          <Link to={`/tasks/${task._id}`} className="font-medium text-gray-900 hover:text-primary-600">
            {task.title}
          </Link>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`status-badge ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <span className={`status-badge ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.project && (
              <Link 
                to={`/projects/${task.project._id}`}
                className="text-xs text-gray-500 hover:text-primary-600"
              >
                {task.project.name}
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        {task.dueDate && (
          <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
            {format(new Date(task.dueDate), 'MMM dd')}
            {isOverdue && (
              <div className="flex items-center text-xs mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                Overdue
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    async () => {
      const response = await api.get('/tasks/dashboard/stats');
      return response.data;
    },
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  // Fetch recent tasks
  const { data: recentTasks, isLoading: tasksLoading } = useQuery(
    'recent-tasks',
    async () => {
      const response = await api.get('/tasks/dashboard/recent?limit=5');
      return response.data.tasks;
    },
    { refetchInterval: 30000 }
  );

  // Fetch recent projects
  const { data: recentProjects, isLoading: projectsLoading } = useQuery(
    'recent-projects',
    async () => {
      const response = await api.get('/projects?limit=5');
      return response.data.projects;
    },
    { refetchInterval: 30000 }
  );

  if (statsLoading || tasksLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const overallStats = stats?.overall || {};
  const myTasksStats = stats?.myTasks || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName}! Here's what's happening with your projects.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/tasks/new" className="btn btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Link>
          <Link to="/projects/new" className="btn btn-secondary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={overallStats.total || 0}
          icon={CheckSquare}
          color="bg-blue-500"
          change={`${myTasksStats.in_progress || 0} in progress`}
          changeType="positive"
        />
        <StatCard
          title="My Tasks"
          value={myTasksStats.total || 0}
          icon={Clock}
          color="bg-green-500"
          change={`${myTasksStats.completed || 0} completed`}
          changeType="positive"
        />
        <StatCard
          title="Projects"
          value={recentProjects?.length || 0}
          icon={FolderOpen}
          color="bg-purple-500"
        />
        <StatCard
          title="Overdue Tasks"
          value={myTasksStats.overdue || 0}
          icon={AlertCircle}
          color="bg-red-500"
          changeType="negative"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
              <Link 
                to="/tasks" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentTasks?.length > 0 ? (
                recentTasks.map((task) => (
                  <TaskItem key={task._id} task={task} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No tasks yet</p>
                  <Link 
                    to="/tasks/new" 
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
                  >
                    Create your first task
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <Link 
                to="/projects" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentProjects?.length > 0 ? (
                recentProjects.map((project) => (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="block p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {project.members?.length || 0} members
                        </p>
                      </div>
                      <FolderOpen className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No projects yet</p>
                  <Link 
                    to="/projects/new" 
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
                  >
                    Create your first project
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/tasks/new" 
            className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900">Create Task</h3>
              <p className="text-sm text-blue-700">Add a new task to your project</p>
            </div>
          </Link>
          <Link 
            to="/projects/new" 
            className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FolderOpen className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <h3 className="font-medium text-purple-900">New Project</h3>
              <p className="text-sm text-purple-700">Start a new project</p>
            </div>
          </Link>
          <Link 
            to="/users" 
            className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-green-900">Manage Team</h3>
              <p className="text-sm text-green-700">Add or remove team members</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
