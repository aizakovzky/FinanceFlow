# FinanceFlow — User Manual (Demo Version)

> **This is the browser-only demo.** All data is stored in your browser's localStorage — no database, no server, no sign-up required. Your data persists until you clear your browser data.

---

## Getting Started

### Demo Account
A demo account is created automatically on first visit:
- **Email:** `demo@financeflow.app`
- **Password:** `demo123`

It comes pre-loaded with 15 sample transactions, 6 budget categories, and 2 recurring items so you can explore the app immediately.

### Creating Your Own Account
1. Click **Create one** on the login page
2. Fill in your name, email, and password (min. 6 characters)
3. Click **Create account** — you'll be signed in automatically

Each account's data is fully isolated in your browser.

### Signing In
Enter your email and password on the login page and click **Sign in**.

---

## Dashboard

Your home screen showing:
- **Monthly Spending** — total amount and transaction count for the current month
- **Budget Status** — top 3 budget categories with progress bars
- **Quick Actions** — jump to Analytics
- **Recent Transactions** — last 5 expenses this month
- **Spending by Category** — colored bar chart of this month's distribution

---

## Adding Transactions

Two ways to add a transaction:
- **Floating button**: Click the green **+ Add Transaction** button (bottom-right)
- **Keyboard shortcut**: Press `C` anywhere, or `Ctrl+K` / `Cmd+K`

### Smart Input (Natural Language)
Type a sentence like *"Spent $25 on lunch yesterday"* and the form auto-fills:
- **Amount** is extracted from the number
- **Category** is guessed from keywords (e.g. "lunch" → Food & Dining)
- **Date** adjusts for "yesterday" or "last week"

### Manual Fields
| Field | Description |
|---|---|
| **Amount** | How much was spent |
| **Date** | When it happened |
| **Category** | Food & Dining, Transport, Entertainment, Utilities, Shopping, Healthcare, Other |
| **Description** | Short note about the transaction |

Click **Add Transaction** to save.

---

## Editing Transactions

1. Go to the **Expenses** page
2. Click the **pencil icon** (✏️) next to a transaction
3. Modify any fields in the modal
4. Click **Update Transaction**

---

## Expenses Page

All transactions in a filterable list (newest first).

- **Filter by category** using the buttons at the top
- **Edit** with the pencil icon
- **Delete** with the trash icon (click twice to confirm)
- Header shows total count and sum for the active filter

---

## Budgets Page

A card for each spending category showing:
- **Progress bar** — spent vs. monthly limit
- **Color coding** — green (on track), amber (>80%), red (over budget)
- **Edit** — click to change the limit

### JPY Scaling
If currency is set to ¥ and budgets are still at the default $500, a banner offers one-click scaling to Japanese Yen defaults (e.g. Food: ¥50,000).

---

## Analytics Page

Visual insights into your spending:

| Chart | What it shows |
|---|---|
| **Spending by Category** | Donut chart of this month's breakdown |
| **Monthly Trend** | Line chart of spending over the last 6 months |
| **Average by Category** | Bar chart of average transaction size |

Hover over chart elements for tooltips with exact values.

### Proactive Insights
Automatic alerts:
- ⚠️ **Warning** — budget exceeded or projected to exceed
- ℹ️ **Info** — spending up vs. last month
- ✅ **Success** — spending has decreased

---

## Recurring Transactions

Set up repeating entries:
1. Click **Add Recurring**
2. Choose Type (Expense/Income), Frequency (Daily/Weekly/Monthly/Yearly)
3. Fill in amount, category, description, and next date
4. Click **Add**

The page shows the **total monthly impact** of all recurring items.

---

## Settings

### Currency
Choose from 10 currencies: USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, INR, BRL. A live preview shows formatting in your chosen locale.

### Data Management
| Action | Description |
|---|---|
| **Export CSV** | Download transactions as a spreadsheet file |
| **Export JSON** | Full backup (transactions, budgets, recurring, currency) |
| **Import CSV** | Bulk-import transactions from a CSV file |

### Account
- **Sign Out** — returns to the login page
- **Clear All Data** — permanently deletes all transactions (requires confirmation)

### Privacy
All data stays in your browser. Nothing is sent to any server.

---

## Dark Mode

Toggle light/dark themes using the **theme button** in the sidebar. The setting persists across sessions. Login and registration pages always display in light mode.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `C` | Open Add Transaction modal |
| `Ctrl+K` / `Cmd+K` | Open Add Transaction modal |
| `Enter` | Submit the form |
| `Escape` | Close modals |

---

## Navigation

### Desktop
Sidebar on the left: Dashboard, Expenses, Budgets, Analytics, Recurring, Settings.

### Mobile
Bottom tab bar: Home, Expenses, Analytics, Budgets, Settings. The floating green button is always available for quick adds.
