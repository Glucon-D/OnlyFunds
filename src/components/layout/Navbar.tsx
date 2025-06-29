/**
 * Navigation Bar Component
 *
 * A responsive navigation component that adapts based on authentication state.
 * Features a clean design with logo, theme toggle, and user dropdown menu.
 * The dropdown contains navigation links and user actions for authenticated users.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/zustand";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuthStore();
  const { theme, toggleTheme } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    // Set loading state for visual feedback
    setIsLoggingOut(true);

    // Close dropdowns immediately for better UX
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);

    try {
      // Call logout function
      await logout();

      // Add a small delay for smooth transition, then redirect
      setTimeout(() => {
        router.push("/");
        setIsLoggingOut(false);
      }, 500);
    } catch (error) {
      // Even if logout fails, redirect to home
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      router.push("/");
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on ESC key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isDropdownOpen]);

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z"
          />
        </svg>
      ),
    },
    {
      href: "/transactions",
      label: "Transactions",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      href: "/budgets",
      label: "Budgets",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  // Get user's first letter
  const getUserInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl mx-auto px-4">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="px-6 sm:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and brand */}
            <div className="flex items-center">
              <Link
                href={isLoggedIn ? "/dashboard" : "/"}
                className="flex items-center space-x-3 group"
                onClick={closeMobileMenu}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <span className="text-white font-bold text-xl">$</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  OnlyFunds
                </span>
              </Link>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />

              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  {/* User Dropdown Button */}
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 transition-all duration-300 hover:shadow-lg group"
                    aria-expanded={isDropdownOpen}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm">
                          {getUserInitial()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {user?.username}
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 py-2 animate-scale-in">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-semibold">
                              {getUserInitial()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {user?.username}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Personal Account
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="py-2">
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeDropdown}
                            className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                              isActivePath(link.href)
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-2 border-emerald-500"
                                : "text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                            }`}
                          >
                            <div
                              className={`${
                                isActivePath(link.href)
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {link.icon}
                            </div>
                            <span>{link.label}</span>
                            {isActivePath(link.href) && (
                              <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"></div>
                            )}
                          </Link>
                        ))}
                      </div>

                      {/* Separator */}
                      <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? (
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        )}
                        <span>
                          {isLoggingOut ? "Signing Out..." : "Sign Out"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/login")}
                    className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push("/signup")}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />

              {isLoggedIn ? (
                <button
                  onClick={toggleMobileMenu}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-sm">
                      {getUserInitial()}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 animate-fade-in">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
            {isLoggedIn ? (
              <>
                {/* Mobile User Info */}
                <div className="px-4 py-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold">
                        {getUserInitial()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {user?.username}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Personal Account
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="py-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActivePath(link.href)
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-4 border-emerald-500"
                          : "text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
                      }`}
                    >
                      <div
                        className={`${
                          isActivePath(link.href)
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {link.icon}
                      </div>
                      <span>{link.label}</span>
                      {isActivePath(link.href) && (
                        <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"></div>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Mobile Logout */}
                <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    )}
                    <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-4 space-y-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push("/login");
                    closeMobileMenu();
                  }}
                  className="w-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    router.push("/signup");
                    closeMobileMenu();
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
