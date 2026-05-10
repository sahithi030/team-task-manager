import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  CheckSquare, 
  Calendar,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
 
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// Task Item Component
const TaskItem = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [showMenu, setShowMenu] = useState(false);

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
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <CheckSquare className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <Link 
              to={`/tasks/${task._id}`}
              className="font-medium text-gray-900 hover:text-primary-600"
            >
              {task.title}
            </Link>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {task.description || 'No description'}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`status-badge ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`status-badge ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              {task.project && (
                <Link 
                  to={`/projects/${task.project._id}`}
                  className="text-xs text-gray-500 hover:text-primary-600 bg-gray-100 px-2 py-1 rounded"
                >
                  {task.project.name}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <Link
                to={`/tasks/${task._id}`}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </Link>
              <button
                onClick={() => {
                  onEdit(task);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <select
                onChange={(e) => {
                  onStatusChange(task._id, e.target.value);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-sm text-gray-700 border-0 focus:ring-0"
                defaultValue=""
              >
                <option value="" disabled>Change Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => {
                  onDelete(task);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {task.assignedTo && (
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-1" />
              {task.assignedTo.firstName} {task.assignedTo.lastName}
            </div>
          )}
          {task.dueDate && (
            <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
              <Calendar className="w-4 h-4 mr-1" />
              {format(new Date(task.dueDate), 'MMM dd, yyyy')}
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
          View Details
        </Link>
      </div>
    </div>
  );
};

// Create/Edit Task Modal
const TaskModal = ({ task, isOpen, onClose, onSave }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: task || {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      estimatedHours: ''
    }
  });

  // Fetch projects for dropdown
  const { data: projectsData } = useQuery('projects-dropdown', async () => {
    const response = await api.get('/projects?limit=100');
    return response.data.projects;
  });

  // Fetch users for assignment
  const { data: usersData } = useQuery('users-dropdown', async () => {
    const response = await api.get('/users/search?q=');
    return response.data.users;
  });

  const onSubmit = (data) => {
    onSave(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Task Title *</label>
            <input
              {...register('title', { required: 'Task title is required' })}
              className="form-input"
              placeholder="Enter task title"
            />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              {...register('description')}
              className="form-input"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="form-label">Project *</label>
            <select
              {...register('project', { required: 'Project is required' })}
              className="form-input"
            >
              <option value="">Select a project</option>
              {projectsData?.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.project && <p className="form-error">{errors.project.message}</p>}
          </div>

          <div>
            <label className="form-label">Assign To</label>
            <select {...register('assignedTo')} className="form-input">
              <option value="">Unassigned</option>
              {usersData?.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Priority</label>
              <select {...register('priority')} className="form-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="form-label">Due Date</label>
              <input
                {...register('dueDate')}
                type="date"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Estimated Hours</label>
            <input
              {...register('estimatedHours')}
              type="number"
              step="0.5"
              min="0"
              className="form-input"
              placeholder="e.g., 2.5"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {task ? 'Update' : 'Create'} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Tasks = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  // Fetch tasks
  const { data, isLoading, error } = useQuery(
    ['tasks', { search, status, priority, assignedTo, page }],
    async () => {
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(search && { search }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo && { assignedTo })
      });
      
      const response = await api.get(`/tasks?${params}`);
      return response.data;
    }
  );

  // Create task mutation
  const createTaskMutation = useMutation(
    (taskData) => api.post('/tasks', taskData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        setShowModal(false);
        toast.success('Task created successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create task');
      }
    }
  );

  // Update task mutation
  const updateTaskMutation = useMutation(
    ({ id, ...taskData }) => api.put(`/tasks/${id}`, taskData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        setShowModal(false);
        setEditingTask(null);
        toast.success('Task updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update task');
      }
    }
  );

  // Update status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }) => api.put(`/tasks/${id}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        toast.success('Task status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    }
  );

  // Delete task mutation
  const deleteTaskMutation = useMutation(
    (taskId) => api.delete(`/tasks/${taskId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        toast.success('Task deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete task');
      }
    }
  );

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask._id, ...taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const handleDeleteTask = (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTaskMutation.mutate(task._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and track your team's tasks</p>
        </div>
        <button onClick={handleCreateTask} className="btn btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-input"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="form-input"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="form-input"
          >
            <option value="">All Assignees</option>
            <option value="">Unassigned</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setStatus('');
              setPriority('');
              setAssignedTo('');
            }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      {data?.tasks?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">
            {search || status || priority || assignedTo 
              ? 'Try adjusting your filters or search terms' 
              : 'Get started by creating your first task'}
          </p>
          {!search && !status && !priority && !assignedTo && (
            <button onClick={handleCreateTask} className="btn btn-primary">
              Create Your First Task
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} tasks
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={data.pagination.page === 1}
              className="btn btn-secondary btn-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={data.pagination.page === data.pagination.pages}
              className="btn btn-secondary btn-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        task={editingTask}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default Tasks;
