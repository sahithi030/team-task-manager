import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

// Action types
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAILURE = 'AUTH_FAILURE';
const LOGOUT = 'LOGOUT';
const SET_LOADING = 'SET_LOADING';
const UPDATE_USER = 'UPDATE_USER';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in headers
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const response = await api.get('/auth/me');
          dispatch({
            type: AUTH_SUCCESS,
            payload: {
              user: response.data.user,
              token: state.token,
            },
          });
        } catch (error) {
          console.error('Error loading user:', error);
          dispatch({ type: AUTH_FAILURE });
        }
      } else {
        dispatch({ type: SET_LOADING, payload: false });
      }
    };

    loadUser();
  }, [state.token]); // Only run on mount

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const response = await api.post('/auth/login', credentials);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });

      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      dispatch({ type: AUTH_FAILURE });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const response = await api.post('/auth/register', userData);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });

      toast.success('Registration successful!');
      return response.data;
    } catch (error) {
      dispatch({ type: AUTH_FAILURE });
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      dispatch({
        type: UPDATE_USER,
        payload: response.data.user,
      });
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    dispatch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
