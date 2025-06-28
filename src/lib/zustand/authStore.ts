/**
 * Optimized Authentication Zustand Store
 *
 * This file contains the optimized Zustand store for managing authentication state and actions.
 * Features instant session restoration, minimal API calls, and professional loading states.
 * Integrates with Appwrite authentication services and react-hot-toast for notifications.
 * Central store for all authentication-related state management with performance optimizations.
 * Now includes automatic data synchronization on login.
 */

import { create } from "zustand";
import { OAuthProvider } from "appwrite";
import toast from "react-hot-toast";
import { AuthStore, User, SignupCredentials, LoginCredentials } from "../types";
import { account, oauthConfig, isConfigured } from "../config/appwrite";
import { syncService } from "../utils/appwriteDb";

// Session cache keys
const SESSION_CACHE_KEY = "onlyfunds_session";
const USER_CACHE_KEY = "onlyfunds_user";

// Session cache utilities
const saveSessionToCache = (user: User) => {
  // Check for browser environment
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    window.localStorage.setItem(SESSION_CACHE_KEY, "true");
  } catch (error) {
    console.warn("Failed to save session to cache:", error);
  }
};

const getSessionFromCache = (): User | null => {
  // Check for browser environment
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const hasSession = window.localStorage.getItem(SESSION_CACHE_KEY);
    const userStr = window.localStorage.getItem(USER_CACHE_KEY);

    if (hasSession === "true" && userStr) {
      const user = JSON.parse(userStr);
      // Validate user object structure
      if (user.id && user.email && user.username) {
        return {
          ...user,
          createdAt: new Date(user.createdAt),
        };
      }
    }
  } catch (error) {
    console.warn("Failed to get session from cache:", error);
  }
  return null;
};

const clearSessionCache = () => {
  // Check for browser environment
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(SESSION_CACHE_KEY);
    window.localStorage.removeItem(USER_CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear session cache:", error);
  }
};

// Helper function to sync user data after successful authentication
const syncUserData = async (userId: string) => {
  try {
    // Sync transactions and budgets from Appwrite to localStorage
    await Promise.all([
      syncService.syncTransactionsToLocal(userId),
      syncService.syncBudgetsToLocal(userId),
    ]);
  } catch (error) {
    console.error("Error syncing user data:", error);
    // Don't show error to user as this is background sync
  }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state - try to restore from cache immediately
  user: getSessionFromCache(),
  isLoggedIn: !!getSessionFromCache(),
  isLoading: false,

  // Actions
  login: async (credentials: LoginCredentials): Promise<boolean> => {
    set({ isLoading: true });

    const loadingToast = toast.loading("Signing in...");

    try {
      // Check if Appwrite is properly configured
      if (!isConfigured) {
        toast.error(
          "Authentication not configured. Please check your project settings.",
          { id: loadingToast }
        );
        set({ isLoading: false });
        return false;
      }

      // Create session with provided credentials
      await account.createEmailPasswordSession(
        credentials.email,
        credentials.password
      );

      // Get user details
      const userAccount = await account.get();

      const user: User = {
        id: userAccount.$id,
        username: userAccount.name || userAccount.email.split("@")[0],
        email: userAccount.email,
        createdAt: new Date(userAccount.$createdAt),
      };

      // Save to cache for instant restoration
      saveSessionToCache(user);

      set({
        user,
        isLoggedIn: true,
        isLoading: false,
      });

      toast.success("Successfully signed in!", { id: loadingToast });

      // Sync user data in background after successful login
      syncUserData(user.id);

      return true;
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign in";
      toast.error(errorMessage, { id: loadingToast });
      set({ isLoading: false });
      return false;
    }
  },

  signup: async (credentials: SignupCredentials): Promise<boolean> => {
    set({ isLoading: true });

    const loadingToast = toast.loading("Creating account...");

    try {
      // Check if Appwrite is properly configured
      if (!isConfigured) {
        toast.error(
          "Authentication not configured. Please check your project settings.",
          { id: loadingToast }
        );
        set({ isLoading: false });
        return false;
      }

      // First create the user account
      await account.create(
        "unique()", // Let Appwrite generate a unique ID
        credentials.email,
        credentials.password,
        credentials.username
      );

      // Then login the user after successful signup
      await account.createEmailPasswordSession(
        credentials.email,
        credentials.password
      );

      // Get updated user details
      const updatedUserAccount = await account.get();

      const user: User = {
        id: updatedUserAccount.$id,
        username: updatedUserAccount.name || credentials.username,
        email: updatedUserAccount.email,
        createdAt: new Date(updatedUserAccount.$createdAt),
      };

      // Save to cache for instant restoration
      saveSessionToCache(user);

      set({
        user,
        isLoggedIn: true,
        isLoading: false,
      });

      toast.success("Account created successfully!", { id: loadingToast });

      // Sync user data in background after successful signup
      // (Usually no data for new users, but good to establish the pattern)
      syncUserData(user.id);

      return true;
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account";
      toast.error(errorMessage, {
        id: loadingToast,
      });
      set({ isLoading: false });
      return false;
    }
  },

  loginWithGoogle: async (): Promise<boolean> => {
    set({ isLoading: true });

    const loadingToast = toast.loading("Redirecting to Google...");

    try {
      // Check if Appwrite is properly configured
      if (!isConfigured) {
        toast.error(
          "Authentication not configured. Please check your project settings.",
          { id: loadingToast }
        );
        set({ isLoading: false });
        return false;
      }
      // Create OAuth2 session with Google
      account.createOAuth2Session(
        OAuthProvider.Google,
        oauthConfig.successUrl,
        oauthConfig.failureUrl
      );

      toast.success("Redirecting to Google...", { id: loadingToast });
      return true;
    } catch (error: unknown) {
      console.error("Google OAuth error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to login with Google";
      toast.error(errorMessage, {
        id: loadingToast,
      });
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    // Set loading state for smooth UI feedback
    set({ isLoading: true });

    const loadingToast = toast.loading("Signing out...");

    try {
      // Optimistic update - clear local state first for instant feedback
      clearSessionCache();

      // Update state optimistically
      set({
        user: null,
        isLoggedIn: false,
        isLoading: false,
      });

      // Then attempt server logout (don't block UI on this)
      await account.deleteSession("current");

      toast.success("Successfully signed out!", { id: loadingToast });
    } catch (error: unknown) {
      console.error("Logout error:", error);

      // Even if server logout fails, we've already logged out locally
      // This prevents being stuck in a half-logged-out state
      toast.success("Successfully signed out!", { id: loadingToast });

      // Ensure local state is cleared regardless of server response
      clearSessionCache();
      set({
        user: null,
        isLoggedIn: false,
        isLoading: false,
      });
    }
  },

  checkAuthStatus: async () => {
    const currentState = get();

    // If we already have a cached session, don't make API call unless forced
    if (currentState.isLoggedIn && currentState.user) {
      return;
    }

    // Don't show loading for auth checks to avoid UI flicker
    set({ isLoading: false });

    try {
      // Check if Appwrite is properly configured
      if (!isConfigured) {
        clearSessionCache();
        set({
          user: null,
          isLoggedIn: false,
          isLoading: false,
        });
        return;
      }

      // Check if user is authenticated with Appwrite
      const userAccount = await account.get();

      const user: User = {
        id: userAccount.$id,
        username: userAccount.name || userAccount.email.split("@")[0],
        email: userAccount.email,
        createdAt: new Date(userAccount.$createdAt),
      };

      // Update cache with fresh data
      saveSessionToCache(user);

      set({
        user,
        isLoggedIn: true,
        isLoading: false,
      });

      // Sync user data in background if session is restored
      syncUserData(user.id);
    } catch (error: unknown) {
      // Clear invalid cache
      clearSessionCache();

      // Silently handle auth check errors - don't show toasts for background checks
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === 401) {
          // User not authenticated - this is normal, no need to log
        } else if (
          error.code === 404 ||
          (error instanceof Error &&
            error.message?.includes(
              "Project with the requested ID could not be found"
            ))
        ) {
          // Project not found - only log, don't show toast for background checks
          console.error(
            "Appwrite project not found. Please check your project ID in .env file."
          );
        } else {
          // Other errors - only log for debugging
          console.error("Auth check error:", error);
        }
      } else {
        // Other errors - only log for debugging
        console.error("Auth check error:", error);
      }

      set({
        user: null,
        isLoggedIn: false,
        isLoading: false,
      });
    }
  },

  // Force refresh auth status (bypasses cache)
  forceCheckAuthStatus: async () => {
    set({ isLoading: true });

    try {
      if (!isConfigured) {
        clearSessionCache();
        set({
          user: null,
          isLoggedIn: false,
          isLoading: false,
        });
        return;
      }

      const userAccount = await account.get();
      const user: User = {
        id: userAccount.$id,
        username: userAccount.name || userAccount.email.split("@")[0],
        email: userAccount.email,
        createdAt: new Date(userAccount.$createdAt),
      };

      saveSessionToCache(user);
      set({
        user,
        isLoggedIn: true,
        isLoading: false,
      });

      // Sync user data after force check
      syncUserData(user.id);
    } catch (error: unknown) {
      clearSessionCache();
      console.error("Auth check error:", error);
      set({
        user: null,
        isLoggedIn: false,
        isLoading: false,
      });
    }
  },
}));
