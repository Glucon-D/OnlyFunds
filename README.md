# OnlyFunds - Personal Finance Made Simple

A modern personal finance application built with Next.js, TypeScript, and Tailwind CSS. OnlyFunds helps you track expenses, manage budgets, and take control of your financial life with a clean, intuitive interface.

## ✨ Features

- **💰 Expense Tracking**: Record income and expenses with detailed categorization
- **📊 Budget Management**: Set monthly budgets and track spending progress in real-time
- **🌙 Dark Mode**: Beautiful light and dark themes with automatic system detection
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🔒 Local Authentication**: Secure user accounts with password hashing
- **💾 Local Storage**: All data stored locally for privacy and offline access
- **⚡ Real-time Updates**: Instant feedback and progress tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Validation**: Zod
- **Authentication**: bcryptjs (client-side)
- **Storage**: localStorage

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd onlyfunds
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Landing page
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── dashboard/         # Main dashboard
│   ├── transactions/      # Transaction management
│   └── budgets/           # Budget management
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── auth/             # Authentication components
│   ├── expenses/         # Expense-related components
│   ├── budgets/          # Budget-related components
│   └── layout/           # Layout components
├── lib/                  # Core utilities and logic
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions and validation
│   ├── zustand/          # State management stores
│   └── hooks/            # Custom React hooks
└── styles/               # Global styles
```

## 🎯 Usage

### Getting Started
1. **Sign Up**: Create a new account with username, email, and password
2. **Add Transactions**: Record your income and expenses with categories and dates
3. **Set Budgets**: Create monthly spending limits for different categories
4. **Track Progress**: Monitor your spending against budgets with visual progress bars
5. **Switch Themes**: Toggle between light and dark modes using the theme button

### Key Features
- **Dashboard**: Overview of monthly income, expenses, and net income
- **Transactions**: Complete transaction history with filtering and sorting
- **Budgets**: Budget progress tracking with overspending alerts
- **Responsive**: Works on all device sizes

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Code Style

The project follows these conventions:
- **File Headers**: Every file includes a descriptive comment explaining its purpose
- **TypeScript**: Strict typing throughout the application
- **Component Structure**: Functional components with proper prop typing
- **State Management**: Zustand stores for global state
- **Validation**: Zod schemas for all form validation

## 🎨 Design System

The application uses a consistent design system built with Tailwind CSS:
- **Colors**: Blue primary, gray neutrals, semantic colors for success/error
- **Typography**: Geist font family with proper hierarchy
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components with variants
- **Themes**: Light and dark mode support

## 📱 Responsive Design

OnlyFunds is fully responsive with breakpoints for:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔐 Security

- **Password Hashing**: bcryptjs for secure password storage
- **Local Storage**: All data stored locally for privacy
- **Input Validation**: Comprehensive validation with Zod
- **XSS Protection**: Proper input sanitization

## 🚧 Phase 1 Limitations

This is Phase 1 (MVP) with the following limitations:
- **Local Storage Only**: No cloud sync or backup
- **Single User**: No multi-user support
- **Basic Categories**: Predefined expense/income categories
- **No Exports**: No data export functionality
- **No Recurring**: No recurring transaction support

## 🔮 Future Enhancements

Planned for future phases:
- Cloud synchronization
- Data export/import
- Recurring transactions
- Advanced analytics
- Multi-currency support
- Receipt scanning
- Investment tracking

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read the file headers to understand each component's purpose before making changes.

---

**OnlyFunds** - Take control of your personal finances with simplicity and style.
