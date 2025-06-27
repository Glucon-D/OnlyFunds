/**
 * Authentication Zustand Store
 *
 * This file contains the Zustand store for managing authentication state and actions.
 * Handles user login, signup, logout, and authentication status checking.
 * Integrates with bcrypt for password hashing and localStorage for session persistence.
 * Central store for all authentication-related state management.
 */

import { create } from 'zustand';
import bcrypt from 'bcryptjs';
import { AuthStore, User, LoginCredentials, SignupCredentials } from '../types';
import { 
  saveUser, 
  getUser, 
  removeUser, 
  saveUserToDatabase, 
  getUserFromDatabase, 
  checkUserExists 
} from '../utils/localDb';
import { generateId } from '../utils/helpers';

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  user: null,
  isLoggedIn: false,
  isLoading: false,

  // Actions
  login: async (credentials: LoginCredentials): Promise<boolean> => {
    set({ isLoading: true });
    
    try {
      // Get user from local database
      const userData = getUserFromDatabase(credentials.email);
      
      if (!userData) {
        set({ isLoading: false });
        return false;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, userData.hashedPassword);
      
      if (!isPasswordValid) {
        set({ isLoading: false });
        return false;
      }

      // Save user session
      saveUser(userData.user);
      
      set({
        user: userData.user,
        isLoggedIn: true,
        isLoading: false
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  signup: async (credentials: SignupCredentials): Promise<boolean> => {
    set({ isLoading: true });
    
    try {
      // Check if user already exists
      if (checkUserExists(credentials.email)) {
        set({ isLoading: false });
        return false;
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(credentials.password, saltRounds);

      // Create new user
      const newUser: User = {
        id: generateId(),
        username: credentials.username,
        email: credentials.email,
        createdAt: new Date()
      };

      // Save user to database
      saveUserToDatabase(newUser, hashedPassword);
      
      // Save user session
      saveUser(newUser);
      
      set({
        user: newUser,
        isLoggedIn: true,
        isLoading: false
      });

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    removeUser();
    set({
      user: null,
      isLoggedIn: false,
      isLoading: false
    });
  },

  checkAuthStatus: () => {
    set({ isLoading: true });
    
    try {
      const user = getUser();
      
      if (user) {
        set({
          user,
          isLoggedIn: true,
          isLoading: false
        });
      } else {
        set({
          user: null,
          isLoggedIn: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({
        user: null,
        isLoggedIn: false,
        isLoading: false
      });
    }
  }
}));
