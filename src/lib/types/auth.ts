/**
 * Authentication Type Definitions
 *
 * This file contains all TypeScript interfaces and types related to user authentication,
 * including user data structure, authentication state, credentials, and store actions.
 * Used throughout the application for type safety in authentication flows.
 */

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => void;
}

export type AuthStore = AuthState & AuthActions;
