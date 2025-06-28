/**
 * Settings Page Component
 *
 * A comprehensive settings page for user account management. Features user
 * profile information, account security options, and various user actions.
 * Includes route protection and responsive design with professional UI.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/zustand";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  User,
  Mail,
  Lock,
  Edit3,
  LogOut,
  Shield,
  Calendar,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Save,
  X,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, logout } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
              Loading settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleProfileUpdate = () => {
    // TODO: Implement profile update logic
    console.log("Updating profile:", profileData);
    setIsEditingProfile(false);
    // Add success notification here
  };

  const handlePasswordChange = () => {
    // TODO: Implement password change logic
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    console.log("Changing password");
    setShowChangePassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    // Add success notification here
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password logic
    console.log("Sending password reset email to:", user?.email);
    alert("Password reset email sent to your registered email address");
  };

  const getUserInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getJoinDate = () => {
    // Mock join date - replace with actual user creation date
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl mb-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl mb-6">
              <SettingsIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
              Account Settings
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Manage your account information and security preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">
                    {getUserInitial()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {user?.username}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {user?.email}
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {getJoinDate()}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Profile Information
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Update your personal details
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center space-x-2"
                >
                  {isEditingProfile ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                  <span>{isEditingProfile ? "Cancel" : "Edit"}</span>
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    disabled={!isEditingProfile}
                    className={
                      !isEditingProfile
                        ? "bg-slate-50 dark:bg-slate-700/50"
                        : ""
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={!isEditingProfile}
                    className={
                      !isEditingProfile
                        ? "bg-slate-50 dark:bg-slate-700/50"
                        : ""
                    }
                  />
                </div>
                {isEditingProfile && (
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleProfileUpdate}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Security Settings
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your account security
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {!showChangePassword ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowChangePassword(true)}
                      className="flex items-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Change Password</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleForgotPassword}
                      className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Reset Password</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        Change Password
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowChangePassword(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handlePasswordChange}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Update Password
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Account Actions
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your account session
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-300 mb-1">
                        Sign Out
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Sign out of your account on this device
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
