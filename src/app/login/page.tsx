/**
 * Login Page Component
 *
 * The user authentication page that renders the LoginForm component.
 * Redirects authenticated users to the dashboard and provides a
 * centered layout for the login form with proper spacing and styling.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthPageLoader } from "@/components/ui/AuthLoader";

export default function LoginPage() {
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
    <div className="min-h-screen flex  justify-center p-4 bg-primary">
      <LoginForm />
    </div>
  );
}
