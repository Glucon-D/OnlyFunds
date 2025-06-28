/**
 * Appwrite Configuration
 *
 * This file contains the Appwrite client configuration and initialization.
 * Handles connection to Appwrite backend services including authentication,
 * database, and storage. Exports configured client instances for use throughout the app.
 */

import { Client, Account, Databases, Storage } from "appwrite";

// Environment variables validation
const requiredEnvVars = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
};

// Check if environment variables are configured
const isConfigured =
  requiredEnvVars.endpoint &&
  requiredEnvVars.projectId &&
  requiredEnvVars.projectId !== "your_project_id_here";

if (!isConfigured) {
  console.warn(
    "⚠️ Appwrite not configured. Please update your .env file with valid project credentials."
  );
}

// Initialize Appwrite client with fallback values to prevent errors
const client = new Client()
  .setEndpoint(requiredEnvVars.endpoint || "https://cloud.appwrite.io/v1")
  .setProject(requiredEnvVars.projectId || "demo-project");

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export client for advanced usage
export { client };

// Export configuration status
export { isConfigured };

// Configuration constants
export const appwriteConfig = {
  endpoint: requiredEnvVars.endpoint || "https://cloud.appwrite.io/v1",
  projectId: requiredEnvVars.projectId || "demo-project",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "main",
  userCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID || "users",
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || "files",
};

// OAuth URLs - simplified
export const oauthConfig = {
  successUrl: `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/dashboard`,
  failureUrl: `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/login`,
};
