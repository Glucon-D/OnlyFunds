/**
 * Class Name Utility
 *
 * This file provides a utility function for merging and conditionally applying
 * CSS class names using the clsx library. Used throughout the application
 * for dynamic styling and conditional class application in components.
 */

import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
