/**
 * Login Form Component
 *
 * A form component for user authentication with email and password fields.
 * Includes client-side validation using Zod schemas, error handling, and
 * loading states. Integrates with the auth store for login functionality
 * and redirects to dashboard on successful authentication.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/zustand";
import { loginSchema, type LoginFormData } from "@/lib/utils/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { FcGoogle } from "react-icons/fc";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [submitError, setSubmitError] = useState<string>("");

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

    if (!validateForm()) {
      return;
    }

    try {
      const success = await login(formData);

      if (success) {
        router.push("/dashboard");
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
            label="Email"
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
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            disabled={isLoading}
            autoComplete="current-password"
          />

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

          {submitError && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center">
              {submitError}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition"
            disabled={isLoading}
            onClick={() => {}}
          >
            <FcGoogle className="text-xl" />
            <span className="font-medium">Sign in with Google</span>
          </Button>
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
    </Card>
  );
};
