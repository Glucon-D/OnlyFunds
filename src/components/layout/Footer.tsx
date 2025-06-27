/**
 * Footer Component
 * 
 * A simple footer component that displays copyright information and branding.
 * Includes responsive design and proper theming support. Positioned at the
 * bottom of the application layout with consistent styling across all pages.
 */

import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Brand and copyright */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">$</span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                © {currentYear} OnlyFunds. All rights reserved.
              </span>
            </div>

            {/* Additional links or info */}
            <div className="flex items-center space-x-6">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Personal Finance Made Simple
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
