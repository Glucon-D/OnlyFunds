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
import { motion, AnimatePresence } from "framer-motion";

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

  // Use cubic-bezier for 'easeOut': [0.4, 0, 0.2, 1]
  const easeOut: [number, number, number, number] = [0.4, 0, 0.2, 1];
  const footerVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut, delay: 0.2, when: 'beforeChildren', staggerChildren: 0.1 } }
  };
  const brandVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: easeOut } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
    tap: { scale: 0.95 },
    hover: { scale: 1.05, y: -2, transition: { duration: 0.2 } }
  };

  return (
    <motion.footer
      className="relative z-30 bg-gradient-to-r from-emerald-100/80 via-white/90 to-emerald-200/80 dark:from-slate-900/90 dark:via-slate-800/95 dark:to-emerald-900/80 shadow-2xl border-t border-slate-200/70 dark:border-slate-700/70"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Left side - Brand and copyright */}
            <motion.div className="flex items-center space-x-4 lg:space-x-5" variants={brandVariants}>
              <motion.div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg" variants={itemVariants} whileTap="tap" whileHover="hover">
                <span className="text-white font-bold text-lg lg:text-2xl">$</span>
              </motion.div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 lg:space-x-4">
                <motion.span className="text-base lg:text-lg font-semibold text-slate-700 dark:text-slate-200" variants={itemVariants}>
                  OnlyFunds
                </motion.span>
                <motion.span className="hidden sm:inline text-slate-400 dark:text-slate-500 text-base lg:text-lg" variants={itemVariants}>
                  •
                </motion.span>
                <motion.span className="text-xs lg:text-base text-slate-500 dark:text-slate-400" variants={itemVariants}>
                  © {currentYear} All rights reserved
                </motion.span>
              </div>
            </motion.div>

            {/* Right side - Social links and actions */}
            <motion.div className="flex items-center space-x-3 lg:space-x-4">
              {/* Report Bug Button */}
              <motion.button
                onClick={handleReportBug}
                className="flex items-center border-2 border-red-500 bg-red-100/60 dark:bg-red-900/40 space-x-2 px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-xl text-sm lg:text-base font-semibold text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 hover:text-white dark:hover:text-white shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transform hover:scale-105 focus:scale-105"
                aria-label="Report a bug"
                variants={itemVariants}
                whileTap="tap"
                whileHover="hover"
              >
                <span className="flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6">
                  <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 group-hover:scale-125 group-focus:scale-125 transition-transform duration-200" />
                </span>
                <span className="hidden sm:inline">Report Bug</span>
              </motion.button>

              {/* Separator */}
              <motion.div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-3 lg:mx-4" variants={itemVariants} />

              {/* Social Links */}
              <motion.div className="flex items-center space-x-1.5 lg:space-x-3 mr-2 lg:mr-6">
                {socialLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 lg:p-3 rounded-xl text-slate-500 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 shadow transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transform hover:scale-110 focus:scale-110"
                      aria-label={link.name}
                      variants={itemVariants}
                      whileTap="tap"
                      whileHover="hover"
                    >
                      <span className="flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6">
                        <IconComponent className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-125 group-focus:scale-125 transition-transform duration-200" />
                      </span>
                    </motion.a>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
