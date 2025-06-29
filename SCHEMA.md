# OnlyFunds - Appwrite Database Schema

## 📋 Overview

This document outlines the database schema structure for the OnlyFunds application using Appwrite as the backend service. The schema consists of two main collections for storing financial data, while user management is handled entirely by Appwrite's built-in authentication system.

---

## 🔐 Authentication

**User management is handled by Appwrite's built-in authentication system.**

- **Service**: Appwrite Auth
- **Features**: Registration, login, logout, session management, OAuth (Google)
- **User Data**: Stored in Appwrite's internal user collection
- **Access**: Users can only access their own data through proper permissions

---

## 📊 Database Collections

### Collection: `transactions`

**Purpose**: Store all income and expense transactions for users

#### Attributes

| Field Name    | Type     | Size | Required | Default | Description                             |
| ------------- | -------- | ---- | -------- | ------- | --------------------------------------- |
| `id`          | String   | 36   | Yes      | -       | Unique transaction identifier           |
| `userId`      | String   | 36   | Yes      | -       | Reference to Appwrite user ID           |
| `type`        | String   | 20   | Yes      | -       | Transaction type: "income" or "expense" |
| `category`    | String   | 50   | Yes      | -       | Transaction category                    |
| `amount`      | Float    | -    | Yes      | -       | Transaction amount (positive number)    |
| `description` | String   | 500  | No       | ""      | Optional transaction description        |
| `date`        | DateTime | -    | Yes      | -       | Transaction date                        |
| `createdAt`   | DateTime | -    | Yes      | now()   | Record creation timestamp               |

#### Indexes

```
- userId (key: userId, type: key)
- userDate (key: [userId, date], type: key)
- userType (key: [userId, type], type: key)
- userCategory (key: [userId, category], type: key)
```

#### Permissions

```
Create: users
Read: users
Update: users
Delete: users
```

#### Categories

**Income Categories:**

- `salary` - Regular employment income
- `freelance` - Freelance/contract work
- `business` - Business revenue
- `investment` - Investment returns
- `gift` - Gifts and donations received
- `other` - Other income sources

**Expense Categories:**

- `food` - Food and dining
- `transportation` - Transport and travel
- `housing` - Rent, utilities, home expenses
- `healthcare` - Medical and health expenses
- `entertainment` - Entertainment and recreation
- `shopping` - Shopping and retail
- `education` - Education and learning
- `utilities` - Utilities and services
- `other` - Other expenses

---

### Collection: `budgets`

**Purpose**: Store monthly budget limits for expense categories

#### Attributes

| Field Name  | Type     | Size | Required | Default | Description                      |
| ----------- | -------- | ---- | -------- | ------- | -------------------------------- |
| `id`        | String   | 36   | Yes      | -       | Unique budget identifier         |
| `userId`    | String   | 36   | Yes      | -       | Reference to Appwrite user ID    |
| `category`  | String   | 50   | Yes      | -       | Expense category for this budget |
| `amount`    | Float    | -    | Yes      | -       | Budget limit amount              |
| `month`     | Integer  | -    | No       | current | Budget month (1-12)              |
| `year`      | Integer  | -    | No       | current | Budget year (e.g., 2024)         |
| `createdAt` | DateTime | -    | Yes      | now()   | Record creation timestamp        |
| `updatedAt` | DateTime | -    | Yes      | now()   | Record last update timestamp     |

#### Indexes

```
- userId (key: userId, type: key)
- userPeriod (key: [userId, year, month], type: key)
- userCategory (key: [userId, category], type: key)
- unique_budget (key: [userId, category, year, month], type: unique)
```

#### Permissions

```
Create: users
Read: users
Update: users
Delete: users
```

#### Budget Categories

Budgets can only be created for **expense categories**:

- `food`, `transportation`, `housing`, `healthcare`, `entertainment`, `shopping`, `education`, `utilities`, `other`

---

## 🔗 Relationships

### User → Transactions (1:Many)

- One user can have multiple transactions
- Each transaction belongs to exactly one user
- Relationship established through `userId` field

### User → Budgets (1:Many)

- One user can have multiple budgets
- Each budget belongs to exactly one user
- Relationship established through `userId` field

### Budget → Transactions (1:Many)

- One budget category can relate to multiple transactions
- Transactions are matched to budgets by `category`, `month`, and `year`
- Used for calculating budget progress and spending analysis

---

## 🛡️ Security & Permissions

### Data Isolation

- **User Level Security**: Each user can only access their own data
- **Automatic Filtering**: Appwrite automatically filters data by authenticated user
- **No Cross-User Access**: Users cannot see or modify other users' financial data

### Permission Rules

```
Create Documents: users
Read Documents: users
Update Documents: users
Delete Documents: users
```

### Authentication Requirements

- All database operations require valid Appwrite session
- Unauthenticated users have no database access
- Session-based security with automatic user context

---

## 📈 Data Flow & Usage

### Transaction Flow

1. User creates income/expense transaction
2. Data stored in `transactions` collection with `userId`
3. Used for financial summaries and budget calculations
4. Supports filtering by date, category, and type

### Budget Flow

1. User sets monthly spending limits by category
2. Data stored in `budgets` collection with `userId`
3. Budget progress calculated by comparing with transactions
4. Supports overspending alerts and progress tracking

### Calculation Examples

**Monthly Spending by Category:**

```sql
SELECT SUM(amount) FROM transactions
WHERE userId = $userId
  AND category = $category
  AND type = 'expense'
  AND MONTH(date) = $month
  AND YEAR(date) = $year
```

**Budget Progress:**

```sql
Budget Progress % = (Spent Amount / Budget Amount) × 100
Remaining = Budget Amount - Spent Amount
Over Budget = Spent Amount > Budget Amount
```

---

## 🔧 Implementation Notes

### Environment Variables Required

```env
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID=transactions
NEXT_PUBLIC_APPWRITE_BUDGETS_COLLECTION_ID=budgets
```

### Collection Creation Commands

**Transactions Collection:**

```bash
# Create collection
appwrite databases createCollection \
  --databaseId $DATABASE_ID \
  --collectionId transactions \
  --name "Transactions"

# Add attributes
appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId transactions --key id --size 36 --required true
appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId transactions --key userId --size 36 --required true
appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId transactions --key type --size 20 --required true
appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId transactions --key category --size 50 --required true
appwrite databases createFloatAttribute --databaseId $DATABASE_ID --collectionId transactions --key amount --required true
appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId transactions --key description --size 500 --required false
appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId transactions --key date --required true
appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId transactions --key createdAt --required true --default now()
```

**Budgets Collection:**

```bash
# Create collection
appwrite databases createCollection \
  --databaseId $DATABASE_ID \
  --collectionId budgets \
  --name "Budgets"

# Add attributes
appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId budgets --key id --size 36 --required true
appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId budgets --key userId --size 36 --required true
appwrite databases createStringAttribute --databaseId $DATABASE_ID --collectionId budgets --key category --size 50 --required true
appwrite databases createFloatAttribute --databaseId $DATABASE_ID --collectionId budgets --key amount --required true
appwrite databases createIntegerAttribute --databaseId $DATABASE_ID --collectionId budgets --key month --required true
appwrite databases createIntegerAttribute --databaseId $DATABASE_ID --collectionId budgets --key year --required true
appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId budgets --key createdAt --required true --default now()
appwrite databases createDatetimeAttribute --databaseId $DATABASE_ID --collectionId budgets --key updatedAt --required true --default now()
```

---

## 📚 Additional Resources

- **Appwrite Documentation**: [https://appwrite.io/docs](https://appwrite.io/docs)
- **Database Setup Guide**: See `APPWRITE_INTEGRATION.md` in the project root
- **API Reference**: [https://appwrite.io/docs/client/databases](https://appwrite.io/docs/client/databases)

---

**Last Updated**: 2025-01-27  
**Schema Version**: 1.0  
**Compatible with**: OnlyFunds v0.2.1+
