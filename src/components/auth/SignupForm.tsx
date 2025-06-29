/**
 * Signup Form Component - Modern Enhanced Design
 *
 * Redesigned with modern UI/UX, proper animations, and enhanced visual appeal.
 * Features gradient backgrounds, smooth transitions, and interactive elements.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState, useAuthActions } from "@/lib/hooks/useAuth";
import { signupSchema, type SignupFormData } from "@/lib/utils/validation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export const SignupForm: React.FC = () => {
  const router = useRouter();
  const { isLoading } = useAuthState();
  const { signup, loginWithGoogle } = useAuthActions();

  const [formData, setFormData] = useState<SignupFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [termsError, setTermsError] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  // Google OAuth states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleLinkMessage, setGoogleLinkMessage] = useState<string | null>(
    null
  );

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(e.target.checked);
    if (termsError) setTermsError("");
  };

  const validateForm = (): boolean => {
    let valid = true;
    try {
      signupSchema.parse(formData);
      setErrors({});
    } catch (error: unknown) {
      const fieldErrors: Partial<SignupFormData> = {};

      if (error && typeof error === "object" && "errors" in error) {
        (
          error as { errors: Array<{ path?: string[]; message: string }> }
        ).errors.forEach((err) => {
          if (err.path && err.path[0]) {
            fieldErrors[err.path[0] as keyof SignupFormData] = err.message;
          }
        });
      }
      setErrors(fieldErrors);
      valid = false;
    }

    if (!acceptedTerms) {
      setTermsError("You must accept the terms and conditions.");
      valid = false;
    } else {
      setTermsError("");
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      const signupSuccess = await signup(formData);

      if (signupSuccess) {
        setSuccess(true);
        router.push("/dashboard");
      } else {
        setSubmitError(
          "An account with this email already exists. Please try logging in instead."
        );
      }
    } catch {
      setSubmitError("An error occurred during signup. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Main Card */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
        {/* Header */}
        <div className="text-center py-8 px-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 dark:from-green-400 dark:via-green-500 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
            Sign Up
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Create your OnlyFunds account to get started!
          </p>
        </div>

        {/* Form */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200 group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                <User className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 pl-12 border rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-700 ${
                    errors.username
                      ? "border-red-300 dark:border-red-600"
                      : "border-slate-200 dark:border-slate-600"
                  }`}
                  autoComplete="username"
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors duration-200 group-focus-within:text-green-500" />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full transition-colors duration-200 group-focus-within:bg-green-500"></div>
                </div>
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                  {errors.username}
                </p>
              )}
            </div>

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
                  autoComplete="new-password"
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
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Must contain at least one uppercase letter, one lowercase
                letter, and one number
              </p>
            </div>

            {/* Confirm Password Input */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200 group-focus-within:text-green-600 dark:group-focus-within:text-green-400">
                <Lock className="w-4 h-4 inline mr-2" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-700 ${
                    errors.confirmPassword
                      ? "border-red-300 dark:border-red-600"
                      : "border-slate-200 dark:border-slate-600"
                  }`}
                  autoComplete="new-password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors duration-200 group-focus-within:text-green-500" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-green-500 dark:hover:text-green-400 transition-colors duration-200 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={handleTermsChange}
                  disabled={isLoading}
                  className="w-4 h-4 text-green-600 bg-white border-slate-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 transition-colors duration-200"
                />
              </div>
              <div className="text-sm">
                <label
                  htmlFor="terms"
                  className="text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors duration-200 hover:underline"
                  >
                    Terms and Conditions
                  </a>
                </label>
                {termsError && (
                  <p className="mt-1 text-red-600 dark:text-red-400 text-xs animate-fade-in">
                    {termsError}
                  </p>
                )}
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center animate-fade-in">
                ✓ Account created! Redirecting...
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

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 group"
            >
              <span className="flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
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

            {/* Google Sign Up Button */}
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
                  setGoogleError("Failed to sign up with Google");
                  setGoogleLoading(false);
                }
              }}
              className="w-full py-3 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              <span className="flex items-center justify-center space-x-3">
                {googleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing up with Google...</span>
                  </>
                ) : (
                  <>
                    <FcGoogle className="w-5 h-5" />
                    <span>Sign up with Google</span>
                  </>
                )}
              </span>
            </button>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  disabled={isLoading}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold transition-colors duration-200 focus:outline-none hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
