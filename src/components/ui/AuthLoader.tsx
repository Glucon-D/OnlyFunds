/**
 * Professional Authentication Loader Component
 *
 * A smooth, professional loading component specifically designed for authentication flows.
 * Features a modern spinner with gradient effects and smooth transitions to prevent UI flickering.
 */

"use client";

import React from "react";

interface AuthLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AuthLoader: React.FC<AuthLoaderProps> = ({
  message = "Loading...",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 dark:border-gray-700`}
        ></div>
        
        {/* Spinning gradient ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-transparent absolute top-0 left-0 animate-spin`}
          style={{
            borderTopColor: "rgb(34, 197, 94)", // green-500
            borderRightColor: "rgb(34, 197, 94)",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
          }}
        ></div>
        
        {/* Inner dot */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"
        ></div>
      </div>
      
      {message && (
        <p
          className={`mt-3 font-medium text-gray-600 dark:text-gray-400 ${textSizeClasses[size]} animate-pulse`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

/**
 * Full-screen authentication loader for page transitions
 */
export const AuthPageLoader: React.FC<{ message?: string }> = ({
  message = "Authenticating...",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <AuthLoader size="lg" message={message} />
      </div>
    </div>
  );
};

/**
 * Inline authentication loader for forms
 */
export const AuthFormLoader: React.FC<{ message?: string }> = ({
  message = "Processing...",
}) => {
  return (
    <div className="flex items-center justify-center py-4">
      <AuthLoader size="sm" message={message} />
    </div>
  );
};
