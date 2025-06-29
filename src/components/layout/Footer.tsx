/**
 * Footer Component
 *
 * A sleek and professional footer component with social links and utility buttons.
 * Features responsive design, hover effects, and consistent theming. Includes
 * brand information, social media links, and a report bug functionality.
 */

"use client";

import React from "react";
import { Github, Twitter, Mail, AlertTriangle } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleReportBug = () => {
    // You can customize this to open a modal, redirect to a form, or send an email
    window.open(
      "mailto:support@onlyfunds.com?subject=Bug Report&body=Please describe the bug you encountered:",
      "_blank"
    );
  };

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/onlyfunds",
      icon: Github,
    },
    {
      name: "Twitter",
      href: "https://twitter.com/onlyfunds",
      icon: Twitter,
    },
    {
      name: "Email",
      href: "mailto:hello@onlyfunds.com",
      icon: Mail,
    },
  ];

  return (
    <footer className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Left side - Brand and copyright */}
            <div className="flex items-center space-x-4 lg:space-x-5">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm lg:text-base">
                  $
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 lg:space-x-4">
                <span className="text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300">
                  OnlyFunds
                </span>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500 text-sm lg:text-base">
                  •
                </span>
                <span className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
                  © {currentYear} All rights reserved
                </span>
              </div>
            </div>

            {/* Right side - Social links and actions */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* Report Bug Button */}
              <button
                onClick={handleReportBug}
                className="flex items-center border border-red-500 bg-red-50/25 dark:bg-red-900/25 space-x-2 lg:space-x-2.5 px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/35 rounded-lg transition-all duration-200 group"
                aria-label="Report a bug"
              >
                <div className="transform group-hover:scale-110 transition-transform duration-200">
                  <AlertTriangle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </div>
                <span className="hidden sm:inline">Report Bug</span>
              </button>

              {/* Separator */}
              <div className="w-px h-5 lg:h-6 bg-slate-300 dark:bg-slate-600 mx-3 lg:mx-4"></div>

              {/* Social Links */}
              <div className="flex items-center space-x-1 lg:space-x-2 mr-4 lg:mr-6">
                {socialLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 lg:p-3 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 group"
                      aria-label={link.name}
                    >
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        <IconComponent className="w-4 h-4 lg:w-5 lg:h-5" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
