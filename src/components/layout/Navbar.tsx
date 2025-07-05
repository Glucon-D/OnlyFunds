/**
 * Navigation Bar Component
 *
 * A responsive navigation component that adapts based on authentication state.
 * Features a clean design with logo, theme toggle, and user dropdown menu.
 * The dropdown contains navigation links and user actions for authenticated users.
 * Enhanced with Framer Motion animations for smooth interactions.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, easeInOut, easeOut } from "framer-motion";
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
  const [themeToggleAnim, setThemeToggleAnim] = useState(false);

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

  // Animation variants
  const navbarVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: easeOut,
        staggerChildren: 0.1
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: easeOut
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: easeInOut
      }
    }
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      filter: "blur(10px)"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.3,
        ease: easeOut,
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      filter: "blur(10px)",
      transition: {
        duration: 0.2,
        ease: easeOut
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      filter: "blur(10px)"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.4,
        ease: easeOut,
        staggerChildren: 0.08
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      filter: "blur(10px)",
      transition: {
        duration: 0.3,
        ease: easeOut
      }
    }
  };

  const navItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: easeOut
      }
    },
    hover: {
      x: 5,
      transition: {
        duration: 0.2,
        ease: easeInOut
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: easeInOut
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: easeInOut
      }
    }
  };

  const handleThemeToggle = () => {
    setThemeToggleAnim(true);
    toggleTheme();
    setTimeout(() => setThemeToggleAnim(false), 400);
  };

  return (
    <motion.nav
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl mx-auto px-2 sm:px-4"
      style={{ minWidth: 0 }}
    >
      <motion.div 
        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
        whileHover={{ 
          boxShadow: theme === 'dark' 
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" 
            : "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
        }}
      >
        <div className="px-2 sm:px-4">
          <div className="flex justify-between items-center h-16 flex-nowrap">
            {/* Logo and brand */}
            <motion.div 
              className="flex items-center"
              variants={logoVariants}
            >
              <Link
                href={isLoggedIn ? "/dashboard" : "/"}
                className="flex items-center space-x-3 group"
                onClick={closeMobileMenu}
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                  variants={logoVariants}
                  whileHover="hover"
                >
                  <span className="text-white font-bold text-xl">$</span>
                </motion.div>
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent"
                  variants={logoVariants}
                >
                  OnlyFunds
                </motion.span>
              </Link>
            </motion.div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle with rotation animation */}
              <motion.div
                animate={themeToggleAnim ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
              </motion.div>

              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  {/* User Dropdown Button */}
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={toggleDropdown}
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 transition-all duration-300 hover:shadow-lg group"
                    aria-expanded={isDropdownOpen}
                  >
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {getUserInitial()}
                        </span>
                      </motion.div>
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
                    <motion.svg
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/login")}
                      className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Login
                    </Button>
                  </motion.div>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push("/signup")}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Theme Toggle with rotation animation */}
              <motion.div
                animate={themeToggleAnim ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
              </motion.div>

              {isLoggedIn ? (
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={toggleMobileMenu}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800"
                >
                  <motion.div 
                    className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-white font-semibold text-sm">
                      {getUserInitial()}
                    </span>
                  </motion.div>
                  <motion.svg
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </motion.svg>
                </motion.button>
              ) : (
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </motion.svg>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden mt-3"
          >
            <motion.div 
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden"
              whileHover={{ 
                boxShadow: theme === 'dark' 
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" 
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
              }}
            >
              {isLoggedIn ? (
                <>
                  {/* Mobile User Info */}
                  <motion.div 
                    className="px-4 py-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-b border-slate-200 dark:border-slate-700"
                    variants={navItemVariants}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-white font-semibold">
                          {getUserInitial()}
                        </span>
                      </motion.div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user?.username}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Personal Account
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Mobile Navigation Links */}
                  <div className="py-2">
                    {navLinks.map((link) => (
                      <motion.div
                        key={link.href}
                        variants={navItemVariants}
                        whileHover="hover"
                      >
                        <Link
                          href={link.href}
                          onClick={closeMobileMenu}
                          className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                            isActivePath(link.href)
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-4 border-emerald-500"
                              : "text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
                          }`}
                        >
                          <motion.div
                            className={`${
                              isActivePath(link.href)
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                            whileHover={{ rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            {link.icon}
                          </motion.div>
                          <span>{link.label}</span>
                          {isActivePath(link.href) && (
                            <motion.div 
                              className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            ></motion.div>
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile Logout */}
                  <motion.div 
                    className="border-t border-slate-200 dark:border-slate-700 p-4"
                    variants={navItemVariants}
                  >
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <motion.svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
                        </motion.svg>
                      ) : (
                        <motion.svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </motion.svg>
                      )}
                      <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                    </Button>
                  </motion.div>
                </>
              ) : (
                <motion.div 
                  className="p-4 space-y-3"
                  variants={navItemVariants}
                >
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
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
                  </motion.div>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
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
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Dropdown Menu - moved outside overflow-hidden container */}
      <AnimatePresence>
        {isDropdownOpen && isLoggedIn && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-8 top-16 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 py-2 z-[1000]"
            style={{ pointerEvents: 'auto' }}
          >
            {/* User Info Header */}
            <motion.div 
              className="px-4 py-3 border-b border-slate-200 dark:border-slate-700"
              variants={navItemVariants}
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-white font-semibold">
                    {getUserInitial()}
                  </span>
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Personal Account
                  </p>
                </div>
              </div>
            </motion.div>
            {/* Navigation Links */}
            <div className="py-2">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  variants={navItemVariants}
                  whileHover="hover"
                >
                  <Link
                    href={link.href}
                    onClick={closeDropdown}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                      isActivePath(link.href)
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-2 border-emerald-500"
                        : "text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                    }`}
                  >
                    <motion.div
                      className={`${
                        isActivePath(link.href)
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.icon}
                    </motion.div>
                    <span>{link.label}</span>
                    {isActivePath(link.href) && (
                      <motion.div 
                        className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      ></motion.div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
            {/* Separator */}
            <motion.div 
              className="border-t border-slate-200 dark:border-slate-700 my-2"
              variants={navItemVariants}
            ></motion.div>
            {/* Logout Button */}
            <motion.button
              variants={navItemVariants}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
                </motion.svg>
              ) : (
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </motion.svg>
              )}
              <span>
                {isLoggingOut ? "Signing Out..." : "Sign Out"}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
