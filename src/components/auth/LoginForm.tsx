/**
 * Login Form Component
 *
 * A form component for user authentication with email and password fields.
 * Includes client-side validation using Zod schemas, error handling, and
 * loading states. Integrates with the auth store for login functionality
 * and redirects to dashboard on successful authentication.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/zustand";
import { loginSchema, type LoginFormData } from "@/lib/utils/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { FcGoogle } from "react-icons/fc";
import { Dialog } from "@/components/ui/Dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleLinkMessage, setGoogleLinkMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

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

  const validateForgotEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!validateForgotEmail(forgotEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    try {
      // TODO: Integrate with your auth system's forgot password endpoint
      // Example: await forgotPassword(forgotEmail);
      setForgotSuccess("If this email is registered, a reset link has been sent.");
      setForgotEmail("");
    } catch (error) {
      setForgotError("Failed to send reset email. Please try again.");
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

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      const successResult = await login(formData);

      if (successResult) {
        setSuccess(true); // Show success state
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200); // Show success for 1.2s before redirect
      } else {
        setSubmitError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setSubmitError("An error occurred during login. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Welcome Back</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            name="email"
            label="Email *"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            disabled={isLoading}
            autoComplete="email"
          />

          <Input
            type="password"
            name="password"
            label="Password *"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            disabled={isLoading}
            autoComplete="current-password"
          />

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              onClick={() => setForgotOpen(true)}
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              disabled={isLoading}
            />
            <label
              htmlFor="rememberMe"
              className="text-sm text-gray-700 dark:text-gray-300 select-none"
            >
              Remember me
            </label>
          </div>

          {/* Success State */}
          {success && (
            <div className="text-sm text-green-600 dark:text-green-400 text-center">
              Login successful! Redirecting...
            </div>
          )}

          {submitError && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center">
              {submitError}
            </div>
          )}

          {/* Google Sign-In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition"
            disabled={isLoading || googleLoading}
            onClick={() => {
              setGoogleLoading(true);
              setGoogleError(null);
              setGoogleLinkMessage(null);
              window.location.href = "/api/auth/google";
            }}
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : (
              <FcGoogle className="text-xl" />
            )}
            <span className="font-medium">
              {googleLoading ? "Signing in with Google..." : "Sign in with Google"}
            </span>
          </Button>

          {/* Google OAuth Error Handling */}
          {googleError && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center mt-2">
              {googleError}
            </div>
          )}
          {/* Account Linking Message */}
          {googleLinkMessage && (
            <div className="text-sm text-yellow-600 dark:text-yellow-400 text-center mt-2">
              {googleLinkMessage}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              disabled={isLoading}
            >
              Sign up
            </button>
          </div>
        </form>
      </CardContent>

      {/* Forgot Password Modal */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <div className="p-6 bg-white dark:bg-gray-900 rounded shadow max-w-sm w-full mx-auto">
          <h2 className="text-lg font-semibold mb-2 text-center">Reset Password</h2>
          <form onSubmit={handleForgotSubmit} className="space-y-3">
            <Input
              type="email"
              name="forgotEmail"
              label="Email"
              placeholder="Enter your registered email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
            {forgotError && (
              <div className="text-sm text-red-600 dark:text-red-400">{forgotError}</div>
            )}
            {forgotSuccess && (
              <div className="text-sm text-green-600 dark:text-green-400">{forgotSuccess}</div>
            )}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                className="text-gray-600 dark:text-gray-300"
                onClick={() => setForgotOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="font-medium"
                disabled={isLoading}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Enter your email and we’ll send you a password reset link.
          </div>
        </div>
      </Dialog>
    </Card>
  );
};