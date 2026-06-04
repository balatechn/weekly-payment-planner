import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        loading: false 
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },

  fetchUser: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data });
    } catch (error) {
      console.error('Fetch user error:', error);
      set({ user: null, isAuthenticated: false });
    }
  },
}));
