# OnlyFunds - Codebase Summary & Developer Guide

## 📋 Project Overview

**OnlyFunds** is a modern personal finance application built with Next.js 15, TypeScript, and Tailwind CSS v4. It helps users track expenses, manage budgets, and control their financial life with a clean, responsive interface supporting both light and dark themes.

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Validation**: Zod
- **Authentication**: Appwrite (cloud authentication)
- **Database**: Appwrite Cloud + localStorage (hybrid storage)
- **Storage**: localStorage (primary) + Appwrite (cloud sync)

---

## 🏗️ Project Structure

```
onlyfunds/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Reusable React components
│   └── lib/                    # Core utilities and logic
├── public/                     # Static assets
└── config files               # TypeScript, Next.js, Tailwind configs
```

---

## 📁 Detailed Directory Structure

### `/src/app/` - Next.js App Router Pages

| File/Directory          | Purpose                      | Key Features                                              |
| ----------------------- | ---------------------------- | --------------------------------------------------------- |
| `layout.tsx`            | Root layout component        | Sets up fonts, metadata, AuthProvider, Navbar, Footer     |
| `page.tsx`              | Landing/home page            | Hero section, features showcase, authentication redirects |
| `globals.css`           | Global styles & theme system | Centralized CSS variables for light/dark themes           |
| `login/page.tsx`        | Login page                   | User authentication form                                  |
| `signup/page.tsx`       | Registration page            | New user signup form                                      |
| `dashboard/page.tsx`    | Main dashboard               | Financial overview, monthly summaries                     |
| `transactions/page.tsx` | Transaction management       | View, add, filter transactions                            |
| `budgets/page.tsx`      | Budget management            | Create, monitor budget progress                           |
| `settings/page.tsx`     | Account settings             | Profile management, security settings, logout             |

### `/src/components/` - Reusable Components

#### `/src/components/auth/`

| File               | Purpose                         | Key Features                                |
| ------------------ | ------------------------------- | ------------------------------------------- |
| `AuthProvider.tsx` | Authentication context provider | Theme management, auth state initialization |
| `LoginForm.tsx`    | Login form component            | Form validation, error handling             |
| `SignupForm.tsx`   | Registration form component     | User creation, password confirmation        |

#### `/src/components/ui/` - Base UI Components

| File              | Purpose                   | Key Features                                           |
| ----------------- | ------------------------- | ------------------------------------------------------ |
| `Button.tsx`      | Reusable button component | Multiple variants, sizes, loading states               |
| `Card.tsx`        | Card container component  | Header, content, footer sections                       |
| `Input.tsx`       | Form input component      | Validation states, error messages                      |
| `Select.tsx`      | Dropdown select component | Custom styling, option handling                        |
| `Dropdown.tsx`    | Advanced dropdown menu    | Hover behavior, keyboard nav, accessibility            |
| `ThemeToggle.tsx` | Theme switcher component  | Light/dark mode toggle                                 |
| `AuthLoader.tsx`  | Authentication loader     | Spinner with gradient effects, size variants, SSR-safe |

#### `/src/components/layout/`

| File         | Purpose           | Key Features                                             |
| ------------ | ----------------- | -------------------------------------------------------- |
| `Navbar.tsx` | Navigation header | User dropdown menu, floating design, responsive layout   |
| `Footer.tsx` | Site footer       | Social links, report bug, Lucide icons, enhanced spacing |

#### `/src/components/expenses/`

| File                  | Purpose                       | Key Features                              |
| --------------------- | ----------------------------- | ----------------------------------------- |
| `ExpenseForm.tsx`     | Transaction creation form     | Income/expense toggle, category selection |
| `TransactionList.tsx` | Transaction display component | Filtering, sorting, pagination            |

#### `/src/components/budgets/`

| File             | Purpose                  | Key Features                       |
| ---------------- | ------------------------ | ---------------------------------- |
| `BudgetForm.tsx` | Budget creation form     | Category selection, amount setting |
| `BudgetList.tsx` | Budget display component | Progress bars, overspending alerts |

#### `/src/components/providers/`

| File                | Purpose                   | Key Features                                                 |
| ------------------- | ------------------------- | ------------------------------------------------------------ |
| `ToastProvider.tsx` | Global toast notification | React-hot-toast configuration, custom styling, themed colors |

### `/src/lib/` - Core Logic & Utilities

#### `/src/lib/types/` - TypeScript Definitions

| File         | Purpose              | Exports                                                       |
| ------------ | -------------------- | ------------------------------------------------------------- |
| `auth.ts`    | Authentication types | User, AuthState, LoginCredentials, SignupCredentials          |
| `expense.ts` | Transaction types    | Transaction, TransactionType, ExpenseCategory, IncomeCategory |
| `budget.ts`  | Budget types         | Budget, BudgetProgress, BudgetMap                             |
| `index.ts`   | Barrel export        | All types centralized                                         |

#### `/src/lib/zustand/` - State Management

| File              | Purpose              | Key Features                                 |
| ----------------- | -------------------- | -------------------------------------------- |
| `authStore.ts`    | Authentication state | Login, signup, logout, session management    |
| `expenseStore.ts` | Transaction state    | Add, fetch, delete transactions, filtering   |
| `budgetStore.ts`  | Budget state         | Create, update budgets, progress calculation |
| `index.ts`        | Store exports        | Centralized store access                     |

#### `/src/lib/utils/` - Utility Functions

| File            | Purpose                 | Key Features                                 |
| --------------- | ----------------------- | -------------------------------------------- |
| `localDb.ts`    | localStorage operations | User data, transactions, budgets persistence |
| `appwriteDb.ts` | Appwrite database ops   | Cloud CRUD operations, data synchronization  |
| `validation.ts` | Zod schemas             | Form validation, data sanitization           |
| `helpers.ts`    | Common utilities        | ID generation, date formatting, calculations |
| `cn.ts`         | Class name utility      | Tailwind class merging with clsx             |

#### `/src/lib/hooks/` - Custom React Hooks

| File           | Purpose                 | Key Features                                                |
| -------------- | ----------------------- | ----------------------------------------------------------- |
| `useStores.ts` | Store integration hooks | Auth-aware store access, data synchronization               |
| `useAuth.ts`   | Authentication hooks    | Optimized auth state/actions, performance-focused selectors |

#### `/src/lib/config/` - Configuration Files

| File          | Purpose                | Key Features                                               |
| ------------- | ---------------------- | ---------------------------------------------------------- |
| `appwrite.ts` | Appwrite configuration | Client setup, environment validation, OAuth URLs, SSR-safe |

---

## 🎨 Recent UI Enhancements

### Settings Page (`/settings/page.tsx`)

A comprehensive account management page featuring:

- **User Profile Card**: Avatar with user initial, personal information display
- **Profile Management**: Editable username/email with toggle edit mode
- **Security Settings**: Password change with visibility toggles, forgot password
- **Account Actions**: Secure logout with warning styling
- **Professional Design**: Glass morphism cards, responsive layout, Lucide icons
- **Form Validation**: Password confirmation, input validation states

### Enhanced Navigation (`Navbar.tsx`)

Professional dropdown-based navigation system:

- **User Dropdown Menu**: Avatar with first letter, username display
- **Navigation Links**: Dashboard, Transactions, Budgets, Settings with icons
- **Active State Indicators**: Visual feedback for current page
- **Accessibility Features**: ESC key support, click outside to close
- **Mobile Responsive**: Collapsible mobile menu with enhanced user info
- **Clean Layout**: Logo, theme toggle, and user dropdown only

### Enhanced Footer (`Footer.tsx`)

Professional footer with social integration:

- **Social Links**: GitHub, Twitter, Email with Lucide icons
- **Report Bug Button**: Email integration with pre-filled bug report
- **Enhanced Spacing**: Better typography and responsive sizing
- **Professional Design**: Backdrop blur, hover effects, icon scaling
- **Responsive Layout**: Adaptive design across screen sizes

### Advanced Dropdown Component (`Dropdown.tsx`)

Reusable dropdown with advanced features:

- **Hover Behavior**: Smooth hover enter/leave with delay prevention
- **Keyboard Navigation**: ESC key support, focus management
- **Accessibility**: ARIA labels, proper focus states
- **Flexible Positioning**: Multiple placement options (top/bottom, left/right)
- **Component Variants**: DropdownItem, DropdownSeparator sub-components
- **Animation System**: Smooth scale and opacity transitions

### Authentication Loader (`AuthLoader.tsx`)

Professional loading component for authentication flows:

- **Multiple Variants**: AuthLoader, AuthPageLoader, AuthFormLoader
- **Size Options**: Small, medium, large with responsive scaling
- **Gradient Effects**: Modern spinner with green gradient animation
- **Professional Design**: Outer ring, spinning gradient, inner pulsing dot
- **SSR Compatible**: Client-side only rendering with proper checks
- **Customizable**: Configurable messages and styling options

### Toast Provider (`ToastProvider.tsx`)

Global notification system using react-hot-toast:

- **Themed Styling**: Custom colors for success, error, loading states
- **Position Control**: Top-right positioning with configurable options
- **Duration Management**: Different timeout durations per notification type
- **Visual Feedback**: Color-coded notifications (green success, red error, blue loading)
- **Global Access**: Available throughout the app via provider pattern
- **Professional Design**: Dark themed with clean modern styling

### Appwrite Configuration (`appwrite.ts`)

Backend service configuration and client setup:

- **Environment Validation**: Checks for required Appwrite credentials
- **Service Initialization**: Account, Database, Storage service instances
- **OAuth Configuration**: Success/failure URL setup for Google authentication
- **SSR Safety**: Fallback values prevent server-side rendering errors
- **Configuration Export**: Centralized config values for database/storage IDs
- **Status Checking**: `isConfigured` flag for conditional feature enabling

### Optimized Auth Hooks (`useAuth.ts`)

Performance-focused authentication state management:

- **useAuthState()**: Optimized selector for user, isLoggedIn, isLoading
- **useAuthActions()**: Separated actions to prevent unnecessary re-renders
- **useAuth()**: Combined hook for components needing both state and actions
- **Shallow Comparison**: Prevents re-renders when unrelated state changes
- **Performance**: Action separation ensures components only re-render when needed
- **Zustand Integration**: Direct store access with optimized selectors

---

## 🎨 Theme System

The application uses a centralized theme system in `globals.css`:

### CSS Variables Structure

- **Light Theme**: Default theme with green accents
- **Dark Theme**: Dark backgrounds with adjusted green colors
- **Responsive**: Smooth transitions between themes
- **Centralized**: All colors managed via CSS custom properties

### Theme Management

- **Provider**: `AuthProvider.tsx` handles theme state
- **Storage**: Theme preference saved in localStorage
- **Toggle**: `ThemeToggle.tsx` component for switching
- **Classes**: Uses Tailwind's class-based dark mode

---

## 🔐 Authentication & Database System

### Architecture

The system is built with **Appwrite** as the backend service, providing:

- **Cloud Authentication**: Secure user management with Appwrite
- **Session Management**: Server-side session handling
- **OAuth Support**: Google OAuth integration
- **Database Integration**: Cloud storage for transactions and budgets
- **Hybrid Storage**: localStorage for speed + Appwrite for persistence

### Flow

1. **Registration**: Create Appwrite user account → Create session → Update local state → Sync data
2. **Login**: Authenticate with Appwrite → Create session → Cache user data → Sync from cloud
3. **Data Operations**: Update localStorage immediately → Sync to Appwrite in background
4. **Session Persistence**: localStorage caching with SSR-safe fallbacks
5. **Protection**: Route guards redirect unauthenticated users

### Security Features

- **Appwrite Security**: Server-side authentication and session management
- **Input Validation**: Zod schemas prevent malicious input
- **Session Caching**: Optimized localStorage with browser environment checks
- **OAuth Integration**: Secure Google authentication flow

### Key Components

- **AuthStore**: Zustand store with optimized session management
- **useAuth Hook**: Performance-optimized state/action separation
- **AuthLoader**: Professional loading states for auth flows
- **ToastProvider**: Global notification system for auth feedback

---

## 💰 Financial Features

### Transaction Management

- **Types**: Income and Expense tracking
- **Categories**: Predefined categories for both types
- **CRUD**: Create, read, delete operations
- **Filtering**: By type, category, date range

### Budget System

- **Monthly Budgets**: Set spending limits per category
- **Progress Tracking**: Visual progress bars
- **Alerts**: Overspending notifications
- **Calculations**: Real-time budget vs. actual spending

---

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Design Principles

- **Mobile-First**: Responsive design approach
- **Floating Navbar**: Modern navigation design
- **Green Theme**: Consistent color scheme
- **Accessibility**: Focus states, proper contrast

---

## 🚀 Development Workflow

### Scripts

```bash
pnpm dev     # Development server
pnpm build   # Production build
pnpm start   # Production server
pnpm lint    # ESLint checking
```

### File Conventions

- **Comments**: Descriptive headers in every file
- **TypeScript**: Strict typing throughout
- **Imports**: Absolute imports using `@/` alias
- **Exports**: Barrel exports for clean imports

---

## 📦 Dependencies

### Production

- `next`: React framework
- `react`: UI library
- `typescript`: Type safety
- `tailwindcss`: Styling
- `zustand`: State management
- `zod`: Validation
- `appwrite`: Backend-as-a-Service for authentication
- `react-hot-toast`: Toast notification system
- `clsx`: Class name utility
- `lucide-react`: Modern icon library

### Development

- `@types/*`: TypeScript definitions
- `eslint`: Code linting
- `@tailwindcss/postcss`: CSS processing

---

## 🔄 Data Flow

### State Management Pattern

1. **Zustand Stores**: Central state management
2. **Custom Hooks**: Auth-aware store access
3. **Local Storage**: Data persistence
4. **Component Updates**: Reactive UI updates

### Authentication Flow

1. User submits credentials
2. Store validates against localStorage
3. Session established if valid
4. Protected routes become accessible

---

## 🎯 Current Features & Enhancements

### Recent Additions

- **Appwrite Integration**: Cloud authentication with session management
- **Toast Notifications**: Professional feedback system with react-hot-toast
- **Loading States**: Enhanced auth loaders with gradient effects
- **Performance Optimization**: Separated auth hooks for better re-render control
- **SSR Support**: Server-side rendering compatibility for all components

### Current Features

- **Hybrid Storage**: localStorage for speed + Appwrite for cloud persistence
- **Automatic Sync**: Data syncs between local and cloud on login
- **Offline Support**: App works offline with localStorage
- **Real-time Updates**: Immediate UI updates with background cloud sync

### Current Limitations

- **Single User**: No multi-user support yet (per account)
- **Basic Categories**: Predefined categories only
- **No Exports**: No data export functionality
- **No Recurring**: No recurring transactions
- **Simple Conflict Resolution**: Last-write-wins approach

---

## 🔮 Future Enhancements

- **Data Features**: Export/import, recurring transactions, custom categories
- **Analytics**: Advanced reporting, spending insights, trend analysis
- **Multi-Currency**: Support for multiple currencies with exchange rates
- **Receipt Scanning**: OCR integration for receipt processing
- **Investment Tracking**: Portfolio management and performance tracking
- **Collaboration**: Shared budgets and family account management
- **Advanced Sync**: Conflict resolution, delta sync, real-time updates

---

## 🤝 Contributing Guidelines

1. **Read File Headers**: Understand component purpose
2. **Follow Conventions**: Maintain coding standards
3. **Update Documentation**: Keep this summary current
4. **Test Changes**: Verify functionality
5. **Type Safety**: Maintain TypeScript compliance

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd OnlyFunds
npm install
```

### 2. Configure Appwrite

1. Create an [Appwrite](https://cloud.appwrite.io/) project
2. Create database with `transactions` and `budgets` collections
3. Configure collection attributes as specified in `APPWRITE_INTEGRATION.md`
4. Set up proper permissions for user data isolation

### 3. Environment Setup

```bash
cp env.example .env.local
```

Edit `.env.local` with your Appwrite project details:

- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Your Appwrite project ID
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`: Your database ID
- `NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID`: Transactions collection ID
- `NEXT_PUBLIC_APPWRITE_BUDGETS_COLLECTION_ID`: Budgets collection ID

### 4. Run Development Server

```bash
npm run dev
```

**Note**: The app works without Appwrite configuration (localStorage only mode) but cloud sync requires proper setup.

---

**Last Updated**: 2025-01-27
**Version**: 0.2.0 (Appwrite Integration)
