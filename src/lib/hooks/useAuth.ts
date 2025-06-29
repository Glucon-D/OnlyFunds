/**
 * Optimized Auth Hook
 *
 * This hook provides optimized access to authentication state and actions.
 * Uses shallow comparison to prevent unnecessary re-renders when auth state changes.
 */

import { useAuthStore } from "@/lib/zustand/authStore";

/**
 * Hook to get auth state (user, isLoggedIn, isLoading)
 * Optimized to prevent unnecessary re-renders
 */
export const useAuthState = () => {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isLoading = useAuthStore((state) => state.isLoading);

  return { user, isLoggedIn, isLoading };
};

/**
 * Hook to get auth actions (login, signup, logout, etc.)
 * Separated from state to prevent re-renders when state changes
 */
export const useAuthActions = () => {
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const logout = useAuthStore((state) => state.logout);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const forceCheckAuthStatus = useAuthStore(
    (state) => state.forceCheckAuthStatus
  );

  return {
    login,
    signup,
    loginWithGoogle,
    logout,
    checkAuthStatus,
    forceCheckAuthStatus,
  };
};

/**
 * Combined hook for components that need both state and actions
 * Use sparingly - prefer separate hooks for better performance
 */
export const useAuth = () => {
  const state = useAuthState();
  const actions = useAuthActions();

  return {
    ...state,
    ...actions,
  };
};
