import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Calendar,
  CheckSquare,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Settings
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// Member Item Component
const MemberItem = ({ member, isOwner, onRemove, onRoleChange }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {member.user?.firstName} {member.user?.lastName}
          </p>
          <p className="text-sm text-gray-600">{member.user?.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`status-badge ${
          member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {member.role}
        </span>
        {isOwner && member.role !== 'owner' && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <select
                  onChange={(e) => {
                    onRoleChange(member.user._id, e.target.value);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-700 border-0 focus:ring-0"
                  defaultValue={member.role}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => {
                    onRemove(member.user._id);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

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
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <Link 
          to={`/tasks/${task._id}`}
          className="font-medium text-gray-900 hover:text-primary-600"
        >
          {task.title}
        </Link>
        <div className="flex items-center space-x-2">
          <span className={`status-badge ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`status-badge ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {task.assignedTo && (
            <div className="flex items-center text-gray-600">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-medium">
                  {task.assignedTo.firstName?.[0]}{task.assignedTo.lastName?.[0]}
                </span>
              </div>
              {task.assignedTo.firstName} {task.assignedTo.lastName}
            </div>
          )}
          {task.dueDate && (
            <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
              <Calendar className="w-4 h-4 mr-1" />
              {format(new Date(task.dueDate), 'MMM dd')}
              {isOverdue && (
                <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                  Overdue
                </span>
              )}
            </div>
          )}
        </div>
        <Link
          to={`/tasks/${task._id}`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View →
        </Link>
      </div>
    </div>
  );
};

// Add Member Modal
const AddMemberModal = ({ isOpen, onClose, onAdd }) => {
  const { register, handleSubmit, reset } = useForm();

  const { data: usersData } = useQuery('search-users', async () => {
    const response = await api.get('/users/search?q=');
    return response.data.users;
  });

  const onSubmit = (data) => {
    onAdd(data.userId, data.role);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Team Member</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Select User</label>
            <select {...register('userId', { required: true })} className="form-input">
              <option value="">Choose a user</option>
              {usersData?.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Role</label>
            <select {...register('role')} className="form-input" defaultValue="member">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const [showAddMember, setShowAddMember] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const queryClient = useQueryClient();

  // Fetch project details
  const { data: projectData, isLoading: projectLoading } = useQuery(
    ['project', id],
    async () => {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    }
  );

  // Fetch project tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery(
    ['project-tasks', id],
    async () => {
      const response = await api.get(`/projects/${id}/tasks?limit=10`);
      return response.data;
    }
  );

  // Add member mutation
  const addMemberMutation = useMutation(
    ({ userId, role }) => api.post(`/projects/${id}/members`, { userId, role }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', id]);
        setShowAddMember(false);
        toast.success('Member added successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add member');
      }
    }
  );

  // Remove member mutation
  const removeMemberMutation = useMutation(
    (userId) => api.delete(`/projects/${id}/members/${userId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', id]);
        toast.success('Member removed successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove member');
      }
    }
  );

  // Update member role mutation
  const updateRoleMutation = useMutation(
    ({ userId, role }) => api.put(`/projects/${id}/members/${userId}`, { role }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', id]);
        toast.success('Member role updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update role');
      }
    }
  );

  const handleAddMember = (userId, role) => {
    addMemberMutation.mutate({ userId, role });
  };

  const handleRemoveMember = (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      removeMemberMutation.mutate(userId);
    }
  };

  const handleRoleChange = (userId, role) => {
    updateRoleMutation.mutate({ userId, role });
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const project = projectData?.project;
  const stats = projectData?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/projects"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
            <p className="text-gray-600">
              Created {project?.createdAt && format(new Date(project.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-secondary flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          <Link 
            to={`/tasks/new?project=${id}`}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Link>
        </div>
      </div>

      {/* Project Info */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">
              {project?.status?.replace('-', ' ')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Priority</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">
              {project?.priority}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Team Members</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {project?.members?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Tasks</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {stats.total || 0}
            </p>
          </div>
        </div>

        {project?.description && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
            <p className="text-gray-900">{project.description}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'tasks', 'members'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Statistics */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">To Do</span>
                  <span className="font-medium">{stats.todo || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium">{stats['in-progress'] || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Review</span>
                  <span className="font-medium">{stats.review || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{stats.completed || 0}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
              {tasksData?.tasks?.length > 0 ? (
                <div className="space-y-3">
                  {tasksData.tasks.slice(0, 5).map((task) => (
                    <div key={task._id} className="flex items-center space-x-3">
                      <CheckSquare className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <Link 
                          to={`/tasks/${task._id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600"
                        >
                          {task.title}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {task.createdAt && format(new Date(task.createdAt), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No tasks yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Tasks</h3>
              <Link 
                to={`/tasks?project=${id}`}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all tasks →
              </Link>
            </div>
            {tasksData?.tasks?.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tasksData.tasks.map((task) => (
                  <TaskItem key={task._id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first task</p>
                <Link 
                  to={`/tasks/new?project=${id}`}
                  className="btn btn-primary"
                >
                  Create First Task
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <button
                onClick={() => setShowAddMember(true)}
                className="btn btn-primary flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Project Owner */}
              {project?.owner && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {project.owner.firstName?.[0]}{project.owner.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {project.owner.firstName} {project.owner.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{project.owner.email}</p>
                      </div>
                    </div>
                    <span className="status-badge bg-purple-100 text-purple-800">
                      Owner
                    </span>
                  </div>
                </div>
              )}

              {/* Team Members */}
              {project?.members?.map((member) => (
                <MemberItem
                  key={member._id}
                  member={member}
                  isOwner={project?.owner?._id === projectData?.user?._id}
                  onRemove={handleRemoveMember}
                  onRoleChange={handleRoleChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdd={handleAddMember}
      />
    </div>
  );
};

export default ProjectDetail;
