/**
 * Signup Page Component
 *
 * The user registration page that renders the SignupForm component.
 * Redirects authenticated users to the dashboard and provides a
 * centered layout for the signup form with proper spacing and styling.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/hooks/useAuth";
import { SignupForm } from "@/components/auth/SignupForm";
import { AuthPageLoader } from "@/components/ui/AuthLoader";

export default function SignupPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuthState();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  if (isLoading) {
    return <AuthPageLoader message="Checking authentication..." />;
  }

  if (isLoggedIn) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <SignupForm />
    </div>
  );
}
