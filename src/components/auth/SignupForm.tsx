/**
 * Signup Form Component
 *
 * A form component for user registration with username, email, password, and
 * password confirmation fields. Includes client-side validation using Zod schemas,
 * error handling, and loading states. Integrates with the auth store for signup
 * functionality and redirects to dashboard on successful registration.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/zustand";
import { signupSchema, type SignupFormData } from "@/lib/utils/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { FcGoogle } from "react-icons/fc";

export const SignupForm: React.FC = () => {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();

  const [formData, setFormData] = useState<SignupFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [termsError, setTermsError] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  // Google OAuth states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleLinkMessage, setGoogleLinkMessage] = useState<string | null>(null);

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

  // Helper for required label (if you ever update Input to accept ReactNode)
  // const requiredLabel = (label: string) => (
  //   <span>
  //     {label} <span className="text-red-500">*</span>
  //   </span>
  // );

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
        setSuccess(true); // Show success state
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200); // Show success for 1.2s before redirect
      } else {
        setSubmitError(
          "An account with this email already exists. Please try logging in instead."
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      setSubmitError("An error occurred during signup. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            name="username"
            label="Username *"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleInputChange}
            error={errors.username}
            disabled={isLoading}
            autoComplete="username"
          />

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
            autoComplete="new-password"
            helperText="Must contain at least one uppercase letter, one lowercase letter, and one number"
          />

          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password *"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            disabled={isLoading}
            autoComplete="new-password"
          />

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onChange={handleTermsChange}
              disabled={isLoading}
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-700 dark:text-gray-300 select-none"
            >
              I agree to the&nbsp;
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Terms and Conditions
              </a>
            </label>
          </div>
          {termsError && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {termsError}
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="text-sm text-green-600 dark:text-green-400 text-center">
              Account created! Redirecting...
            </div>
          )}

          {submitError && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center">
              {submitError}
            </div>
          )}

          {/* Google Sign-Up Button */}
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
              {googleLoading ? "Signing up with Google..." : "Sign up with Google"}
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
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              disabled={isLoading}
            >
              Sign in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};