import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Calendar,
  TrendingUp,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      badge: null,
    },
    {
      path: '/projects',
      label: 'Projects',
      icon: FolderOpen,
      badge: null,
    },
    {
      path: '/tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: null,
    },
    {
      path: '/calendar',
      label: 'Calendar',
      icon: Calendar,
      badge: null,
      disabled: true,
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: TrendingUp,
      badge: null,
      disabled: true,
    },
  ];

  const adminMenuItems = [
    {
      path: '/users',
      label: 'Users',
      icon: Users,
      badge: null,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
      disabled: true,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">
              TaskManager
            </span>
          </div>
          
          <div className="mt-8 flex-1 flex flex-col">
            {/* Main Navigation */}
            <nav className="flex-1 px-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : active
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={(e) => item.disabled && e.preventDefault()}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        item.disabled
                          ? 'text-gray-400'
                          : active
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto inline-block py-0.5 px-3 text-xs rounded-full bg-primary-100 text-primary-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Admin Section */}
            {user?.role === 'admin' && (
              <div className="mt-8">
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </h3>
                </div>
                <nav className="flex-1 px-2 space-y-1">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          item.disabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : active
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={(e) => item.disabled && e.preventDefault()}
                      >
                        <Icon
                          className={`mr-3 flex-shrink-0 h-5 w-5 ${
                            item.disabled
                              ? 'text-gray-400'
                              : active
                              ? 'text-primary-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        {item.label}
                        {item.badge && (
                          <span className="ml-auto inline-block py-0.5 px-3 text-xs rounded-full bg-primary-100 text-primary-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* User Info */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
