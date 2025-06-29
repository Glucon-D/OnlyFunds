/**
 * Login Form Component - Modern Enhanced Design
 *
 * Redesigned with modern UI/UX, proper animations, and enhanced visual appeal.
 * Features gradient backgrounds, smooth transitions, and interactive elements.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthState, useAuthActions } from "@/lib/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/lib/utils/validation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { isLoading } = useAuthState();
  const { login, loginWithGoogle } = useAuthActions();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleLinkMessage, setGoogleLinkMessage] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [submitError, setSubmitError] = useState<string>("");

  // Reset form states
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Handle Google OAuth errors from redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("googleError");
      const link = params.get("googleLink");
      if (error) {
        setGoogleError(decodeURIComponent(error));
        setGoogleLoading(false);
      }
      if (link) {
        setGoogleLinkMessage(decodeURIComponent(link));
        setGoogleLoading(false);
      }
    }
  }, []);

  const validateResetEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);

    if (!validateResetEmail(resetEmail)) {
      setResetError("Please enter a valid email address.");
      setResetLoading(false);
      return;
    }

    try {
      // TODO: Integrate with your auth system's forgot password endpoint
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setResetSuccess(
        "If this email is registered, a reset link has been sent to your inbox."
      );
      setResetEmail("");
    } catch (error) {
      setResetError("Failed to send reset email. Please try again.");
      console.log("Reset password error:", error);
    } finally {
      setResetLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError("");
      setSuccess(false);

      const validateForm = (): boolean => {
        try {
          loginSchema.parse(formData);
          setErrors({});
          return true;
        } catch (error: unknown) {
          const fieldErrors: Partial<LoginFormData> = {};

          if (error && typeof error === "object" && "errors" in error) {
            (
              error as { errors: Array<{ path?: string[]; message: string }> }
            ).errors.forEach((err) => {
              if (err.path && err.path[0]) {
                fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
              }
            });
          }

          setErrors(fieldErrors);
          return false;
        }
      };

      if (!validateForm()) {
        return;
      }

      try {
        const successResult = await login(formData);

        if (successResult) {
          setSuccess(true);
          router.push("/dashboard");
        } else {
          setSubmitError("Invalid email or password. Please try again.");
        }
      } catch {
        setSubmitError("An error occurred during login. Please try again.");
      }
    },
    [formData, login, router]
  );

  const handleBackToLogin = () => {
    setIsResetMode(false);
    setResetEmail("");
    setResetError("");
    setResetSuccess("");
  };

  const handleShowResetForm = () => {
    setIsResetMode(true);
    // Clear any login form states
    setSubmitError("");
    setGoogleError(null);
    setGoogleLinkMessage(null);
  };

  return (
    <div className="min-h-screen flex justify-center py-10">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="text-center py-8 px-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 dark:from-green-400 dark:via-green-500 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
              {isResetMode ? "Reset Password" : "Login"}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              {isResetMode
                ? "Enter your email address and we'll send you a reset link"
                : "Welcome back to OnlyFunds! Please enter your details."}
            </p>
          </div>

          {/* Form Container */}
          <div className="px-8 pb-8">
            {!isResetMode ? (
              /* Login Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200 group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 pl-12 border rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-700 ${
                        errors.email
                          ? "border-red-300 dark:border-red-600"
                          : "border-slate-200 dark:border-slate-600"
                      }`}
                      autoComplete="email"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors duration-200 group-focus-within:text-green-500" />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full transition-colors duration-200 group-focus-within:bg-green-500"></div>
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200 group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-700 ${
                        errors.password
                          ? "border-red-300 dark:border-red-600"
                          : "border-slate-200 dark:border-slate-600"
                      }`}
                      autoComplete="current-password"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors duration-200 group-focus-within:text-green-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-green-500 dark:hover:text-green-400 transition-colors duration-200 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Success Message */}
                {success && (
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center animate-fade-in">
                    ✓ Login successful! Redirecting...
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center animate-fade-in">
                    {submitError}
                  </div>
                )}

                {/* Google Error/Link Messages */}
                {googleError && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center animate-fade-in">
                    {googleError}
                  </div>
                )}
                {googleLinkMessage && (
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center animate-fade-in">
                    {googleLinkMessage}
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 group"
                >
                  <span className="flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Login</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </span>
                </button>

                <div className="flex items-center justify-center">
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700"></div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 px-2">
                    OR
                  </span>
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700"></div>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  disabled={isLoading || googleLoading}
                  onClick={async () => {
                    setGoogleLoading(true);
                    setGoogleError(null);
                    setGoogleLinkMessage(null);

                    try {
                      await loginWithGoogle();
                    } catch {
                      setGoogleError("Failed to login with Google");
                      setGoogleLoading(false);
                    }
                  }}
                  className="w-full py-3 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                >
                  <span className="flex items-center justify-center space-x-3">
                    {googleLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Signing in with Google...</span>
                      </>
                    ) : (
                      <>
                        <FcGoogle className="w-5 h-5" />
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </span>
                </button>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleShowResetForm}
                    disabled={isLoading}
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors duration-200 focus:outline-none hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center ">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/signup")}
                      disabled={isLoading}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold transition-colors duration-200 focus:outline-none hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* Reset Password Form */
              <form onSubmit={handleResetSubmit} className="space-y-6">
                {/* Reset Email Input */}
                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200 group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      disabled={resetLoading}
                      className="w-full px-4 py-3 pl-12 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-700"
                      autoComplete="email"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors duration-200 group-focus-within:text-green-500" />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full transition-colors duration-200 group-focus-within:bg-green-500"></div>
                    </div>
                  </div>
                </div>

                {/* Reset Error Message */}
                {resetError && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center animate-fade-in">
                    {resetError}
                  </div>
                )}

                {/* Reset Success Message */}
                {resetSuccess && (
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center animate-fade-in">
                    ✓ {resetSuccess}
                  </div>
                )}

                {/* Reset Button */}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 group"
                >
                  <span className="flex items-center justify-center space-x-2">
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Reset Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </span>
                </button>

                {/* Back to Login Link */}
                <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    disabled={resetLoading}
                    className="inline-flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors duration-200 focus:outline-none hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
