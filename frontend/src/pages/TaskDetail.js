import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Calendar,
  User,
  Clock,
  CheckSquare
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');

  const queryClient = useQueryClient();

  // Fetch task details
  const { data: taskData, isLoading } = useQuery(
    ['task', id],
    async () => {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    }
  );

  // Update task mutation
  const updateTaskMutation = useMutation(
    (taskData) => api.put(`/tasks/${id}`, taskData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task', id]);
        setIsEditing(false);
        toast.success('Task updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update task');
      }
    }
  );

  // Add comment mutation
  const addCommentMutation = useMutation(
    (text) => api.post(`/tasks/${id}/comments`, { text }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task', id]);
        setNewComment('');
        toast.success('Comment added successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add comment');
      }
    }
  );

  // Delete task mutation
  const deleteTaskMutation = useMutation(
    () => api.delete(`/tasks/${id}`),
    {
      onSuccess: () => {
        toast.success('Task deleted successfully');
        window.location.href = '/tasks';
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete task');
      }
    }
  );

  const handleUpdateTask = (taskData) => {
    updateTaskMutation.mutate(taskData);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  const handleDeleteTask = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const task = taskData?.task;

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Task not found</p>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/tasks"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-600">
              Created {task.createdAt && format(new Date(task.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={handleDeleteTask}
            className="btn btn-danger flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h2>
            
            {isEditing ? (
              <TaskEditForm
                task={task}
                onSave={handleUpdateTask}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                  <p className="text-gray-900">
                    {task.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
                    <span className={`status-badge ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Priority</h3>
                    <span className={`status-badge ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Assigned To</h3>
                    {task.assignedTo ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {task.assignedTo.firstName?.[0]}{task.assignedTo.lastName?.[0]}
                          </span>
                        </div>
                        <span className="text-gray-900">
                          {task.assignedTo.firstName} {task.assignedTo.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Created By</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {task.createdBy.firstName?.[0]}{task.createdBy.lastName?.[0]}
                        </span>
                      </div>
                      <span className="text-gray-900">
                        {task.createdBy.firstName} {task.createdBy.lastName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Due Date</h3>
                    {task.dueDate ? (
                      <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        {isOverdue && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                            Overdue
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">No due date</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Project</h3>
                    {task.project && (
                      <Link
                        to={`/projects/${task.project._id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {task.project.name}
                      </Link>
                    )}
                  </div>
                </div>

                {(task.estimatedHours || task.actualHours) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Estimated Hours</h3>
                      <span className="text-gray-900">{task.estimatedHours || 'N/A'}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Actual Hours</h3>
                      <span className="text-gray-900">{task.actualHours || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Comments ({task.comments?.length || 0})
            </h2>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="form-input mb-3"
                rows={3}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || addCommentMutation.isLoading}
                className="btn btn-primary"
              >
                {addCommentMutation.isLoading ? 'Adding...' : 'Add Comment'}
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {task.comments?.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {comment.user?.firstName?.[0]}{comment.user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt && format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-900">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full btn btn-secondary text-left"
              >
                <Edit className="w-4 h-4 mr-2 inline" />
                Edit Task
              </button>
              <Link
                to={`/projects/${task.project?._id}`}
                className="w-full btn btn-secondary text-left flex items-center"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                View Project
              </Link>
            </div>
          </div>

          {/* Task Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Created:</span>
                <span className="ml-auto text-gray-900">
                  {task.createdAt && format(new Date(task.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              {task.completedAt && (
                <div className="flex items-center text-sm">
                  <CheckSquare className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Completed:</span>
                  <span className="ml-auto text-gray-900">
                    {format(new Date(task.completedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {task.updatedAt && (
                <div className="flex items-center text-sm">
                  <Edit className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Updated:</span>
                  <span className="ml-auto text-gray-900">
                    {format(new Date(task.updatedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Task Edit Form Component
const TaskEditForm = ({ task, onSave, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours
    }
  });

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Title</label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="form-input"
        />
        {errors.title && <p className="form-error">{errors.title.message}</p>}
      </div>

      <div>
        <label className="form-label">Description</label>
        <textarea
          {...register('description')}
          className="form-input"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Status</label>
          <select {...register('status')} className="form-input">
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="form-label">Priority</label>
          <select {...register('priority')} className="form-input">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Due Date</label>
        <input
          {...register('dueDate')}
          type="date"
          className="form-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Estimated Hours</label>
          <input
            {...register('estimatedHours')}
            type="number"
            step="0.5"
            min="0"
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Actual Hours</label>
          <input
            {...register('actualHours')}
            type="number"
            step="0.5"
            min="0"
            className="form-input"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default TaskDetail;
