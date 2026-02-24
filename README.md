# FinanceFlow — User Manual

## Getting Started

### Creating an Account
1. Open the app in your browser at `http://localhost:3000`
2. Click **Create one** on the login page
3. Fill in your name, email, and password (min. 6 characters)
4. Click **Create account** — you'll be signed in automatically

### Signing In
Enter your email and password on the login page and click **Sign in**.

---

## Adding Transactions

There are two ways to add a transaction:

- **Floating button**: Click the green **+ Add Transaction** button (bottom-right on desktop, bottom-right circle on mobile)
- **Keyboard shortcut**: Press `C` anywhere in the app, or `Ctrl+K` / `Cmd+K`

### Smart Input (Natural Language)
Type a sentence like *"Spent $25 on lunch yesterday"* and the form auto-fills:
- **Amount** is extracted from the number
- **Category** is guessed from keywords (e.g. "lunch" → Food & Dining)
- **Date** adjusts for "yesterday" or "last week"

You can also fill in or override the fields manually below the text area.

### Manual Fields
| Field | Description |
|---|---|
| **Amount** | How much was spent |
| **Date** | When it happened |
| **Category** | Select from: Food & Dining, Transport, Entertainment, Utilities, Shopping, Healthcare, Other |
| **Description** | Short note about the transaction |

Click **Add Transaction** or press `Enter` to save.

---

## Editing Transactions

1. Go to the **Expenses** page
2. Find the transaction you want to edit
3. Click the **pencil icon** (✏️) next to the delete button
4. The modal opens pre-filled with the existing data
5. Modify any fields, then click **Update Transaction**

---

## Expenses Page

Shows all your transactions in a filterable list (newest first).

- **Filter by category** using the buttons at the top (All, Food & Dining, Transport, etc.)
- **Edit** a transaction with the pencil icon
- **Delete** a transaction with the trash icon (requires a second click to confirm)
- The header shows the total count and sum for the current filter

---

## Budgets Page

Displays a card for each spending category with:
- **Progress bar** — how much you've spent vs. your monthly limit
- **Percentage** — visual indicator (green = on track, amber = close, red = over budget)
- **Edit** button to change the budget limit

### JPY Scaling
If your currency is set to Japanese Yen (¥) and budgets are still at the default ¥500, a banner appears offering to **Scale Budgets for ¥** with one click. This sets practical defaults like:
- Food & Dining: ¥50,000
- Transport: ¥15,000
- Entertainment: ¥20,000
- Utilities: ¥25,000
- Shopping: ¥30,000
- Healthcare: ¥10,000

---

## Analytics Page

Provides visual insights into your spending:

| Chart | What it shows |
|---|---|
| **Spending by Category** | Donut chart of this month's spending breakdown |
| **Monthly Trend** | Line chart of total spending over the last 6 months |
| **Average by Category** | Bar chart showing average transaction size per category |

Hover over any chart element to see a tooltip with the exact value.

### Proactive Insights
The app automatically generates alerts:
- ⚠️ **Warning** if you've exceeded a budget or are projected to
- ℹ️ **Info** if spending is up compared to last month
- ✅ **Success** if spending has decreased

---

## Recurring Transactions

Set up transactions that repeat automatically.

1. Click **Add Recurring** on the Recurring page
2. Choose **Type** (Expense or Income), **Frequency** (Daily, Weekly, Monthly, Yearly)
3. Fill in amount, category, description, and next date
4. Click **Add**

Each recurring entry shows its next scheduled date and frequency. The page also shows the **total monthly impact** of all recurring items.

---

## Settings Page

### Currency
Choose from 10 currencies: USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, INR, BRL. A preview shows how amounts are formatted in your chosen locale.

### Data Management
| Action | Description |
|---|---|
| **Export CSV** | Download all transactions as a spreadsheet-compatible CSV file |
| **Export JSON** | Full backup including transactions, budgets, recurring items, and currency |
| **Import CSV** | Upload a CSV file to bulk-import transactions |

### Account
- **Sign Out** — returns you to the login page
- **Clear All Data** — permanently deletes all transactions and recurring items (requires confirmation)

---

## Dark Mode

Toggle between light and dark themes using the **theme button** in the sidebar (shows "Dark Mode" or "Light Mode"). The setting persists across sessions.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `C` | Open Add Transaction modal |
| `Ctrl+K` / `Cmd+K` | Open Add Transaction modal |
| `Enter` | Submit the transaction form |
| `Escape` | Close any open modal or dropdown |

---

## Navigation

### Desktop
Use the sidebar on the left: Dashboard, Expenses, Budgets, Analytics, Recurring, Settings.

### Mobile
Use the bottom tab bar: Home, Expenses, Analytics, Budgets, Settings. The green floating button is always available for quick adds.
