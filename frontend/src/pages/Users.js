import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  Users as UsersIcon, 
  MoreHorizontal,
  Edit,
  Trash2,
  Shield
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// User Card Component
const UserCard = ({ user, onEdit, onDelete, onToggleStatus }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-medium">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-gray-600">@{user.username}</p>
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
              <button
                onClick={() => {
                  onEdit(user);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  onToggleStatus(user);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Shield className="w-4 h-4" />
                <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
              </button>
              <button
                onClick={() => {
                  onDelete(user);
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

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <UsersIcon className="w-4 h-4 mr-2" />
          {user.email}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`status-badge ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
            <span className={`status-badge ${getStatusColor(user.isActive)}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Joined {user.createdAt && new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create/Edit User Modal
const UserModal = ({ user, isOpen, onClose, onSave }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: user || {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      role: 'member',
      isActive: true
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
          {user ? 'Edit User' : 'Create New User'}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">First Name</label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                type="text"
                className="form-input"
                placeholder="First name"
              />
              {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="form-label">Last Name</label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                type="text"
                className="form-input"
                placeholder="Last name"
              />
              {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Username</label>
            <input
              {...register('username', { 
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' }
              })}
              type="text"
              className="form-input"
              placeholder="Username"
            />
            {errors.username && <p className="form-error">{errors.username.message}</p>}
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="form-input"
              placeholder="Email address"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="form-label">Role</label>
            <select {...register('role')} className="form-input">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {user && (
            <div className="flex items-center">
              <input
                {...register('isActive')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active User
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {user ? 'Update' : 'Create'} User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Users = () => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  // Fetch users
  const { data, isLoading, error } = useQuery(
    ['users', { search, role, page }],
    async () => {
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(search && { search }),
        ...(role && { role })
      });
      
      const response = await api.get(`/users?${params}`);
      return response.data;
    }
  );

  // Create user mutation
  const createUserMutation = useMutation(
    (userData) => api.post('/auth/register', userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setShowModal(false);
        toast.success('User created successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create user');
      }
    }
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    ({ id, ...userData }) => api.put(`/users/${id}`, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setShowModal(false);
        setEditingUser(null);
        toast.success('User updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user');
      }
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (userId) => api.delete(`/users/${userId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  );

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser._id, ...userData });
    } else {
      // For new users, we need to add a default password
      createUserMutation.mutate({
        ...userData,
        password: 'changeme123' // Default password for new users
      });
    }
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"?`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  const handleToggleStatus = (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} "${user.firstName} ${user.lastName}"?`)) {
      updateUserMutation.mutate({ 
        id: user._id, 
        isActive: !user.isActive 
      });
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
        <p className="text-red-600">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <button onClick={handleCreateUser} className="btn btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New User
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="form-input"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setRole('');
            }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {data?.users?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600 mb-4">
            {search || role 
              ? 'Try adjusting your filters or search terms' 
              : 'Get started by creating your first user'}
          </p>
          {!search && !role && (
            <button onClick={handleCreateUser} className="btn btn-primary">
              Create Your First User
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
            {data.pagination.total} users
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

      {/* User Modal */}
      <UserModal
        user={editingUser}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default Users;
