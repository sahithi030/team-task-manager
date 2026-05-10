import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  Filter, 
  FolderOpen, 
  Users, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// Project Card Component
const ProjectCard = ({ project, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-gray-100 text-gray-800',
      'active': 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <Link 
              to={`/projects/${project._id}`}
              className="font-semibold text-gray-900 hover:text-primary-600"
            >
              {project.name}
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              by {project.owner?.firstName} {project.owner?.lastName}
            </p>
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
                to={`/projects/${project._id}`}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </Link>
              <button
                onClick={() => {
                  onEdit(project);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  onDelete(project);
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

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {project.description || 'No description provided'}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`status-badge ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <span className={`status-badge ${getPriorityColor(project.priority)}`}>
            {project.priority}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-1" />
          {project.members?.length || 0}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {project.createdAt && format(new Date(project.createdAt), 'MMM dd, yyyy')}
        </div>
        <Link
          to={`/projects/${project._id}`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

// Create/Edit Project Modal
const ProjectModal = ({ project, isOpen, onClose, onSave }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: project || {
      name: '',
      description: '',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      tags: []
    }
  });

  const onSubmit = (data) => {
    onSave(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {project ? 'Edit Project' : 'Create New Project'}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Project Name *</label>
            <input
              {...register('name', { required: 'Project name is required' })}
              className="form-input"
              placeholder="Enter project name"
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              {...register('description')}
              className="form-input"
              rows={3}
              placeholder="Enter project description"
            />
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
              <label className="form-label">Start Date</label>
              <input
                {...register('startDate')}
                type="date"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">End Date</label>
            <input
              {...register('endDate')}
              type="date"
              className="form-input"
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
              {project ? 'Update' : 'Create'} Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Projects = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  // Fetch projects
  const { data, isLoading, error } = useQuery(
    ['projects', { search, status, priority, page }],
    async () => {
      const params = new URLSearchParams({
        page,
        limit: 9,
        ...(search && { search }),
        ...(status && { status }),
        ...(priority && { priority })
      });
      
      const response = await api.get(`/projects?${params}`);
      return response.data;
    }
  );

  // Create project mutation
  const createProjectMutation = useMutation(
    (projectData) => api.post('/projects', projectData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        setShowModal(false);
        toast.success('Project created successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create project');
      }
    }
  );

  // Update project mutation
  const updateProjectMutation = useMutation(
    ({ id, ...projectData }) => api.put(`/projects/${id}`, projectData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        setShowModal(false);
        setEditingProject(null);
        toast.success('Project updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update project');
      }
    }
  );

  // Delete project mutation
  const deleteProjectMutation = useMutation(
    (projectId) => api.delete(`/projects/${projectId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        toast.success('Project deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete project');
      }
    }
  );

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleSaveProject = (projectData) => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject._id, ...projectData });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  const handleDeleteProject = (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      deleteProjectMutation.mutate(project._id);
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
        <p className="text-red-600">Failed to load projects</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and collaborate with your team</p>
        </div>
        <button onClick={handleCreateProject} className="btn btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
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
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
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

          <button
            onClick={() => {
              setSearch('');
              setStatus('');
              setPriority('');
            }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {data?.projects?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {search || status || priority 
              ? 'Try adjusting your filters or search terms' 
              : 'Get started by creating your first project'}
          </p>
          {!search && !status && !priority && (
            <button onClick={handleCreateProject} className="btn btn-primary">
              Create Your First Project
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
            {data.pagination.total} projects
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

      {/* Project Modal */}
      <ProjectModal
        project={editingProject}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
      />
    </div>
  );
};

export default Projects;
