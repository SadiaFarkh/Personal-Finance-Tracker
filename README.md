# Aura Finance | Premium Wealth Analytics Tracker

Aura Finance is a production-ready, portfolio-quality personal finance tracker designed for a SaaS-style user experience. It runs entirely client-side using sandboxed browser `localStorage` to guarantee 100% data privacy.

---

## 🌟 Key Features

### 1. Interactive Analytics Dashboard
* **Dynamic Metrics Grid**: Real-time tracking of **13 metrics** (Total Balance, Total Income, Total Expenses, Savings Rate, Monthly Income/Expense aggregates, Highest entries, and Day/Week/Month/Year spending totals).
* **Tabbed Charts Panel**: Fully animated visualizations powered by Recharts:
  * **Cash Flow**: Monthly comparison of Income vs. Expenses (Double Bar Chart).
  * **Categories**: Visual distribution of expense categories (Donut Chart).
  * **Net Worth**: Cumulative wealth history (Glow-Area Chart).
  * **Weekly Activity**: Last 7 days of daily spending (Gradient Bar Chart).
* **Aura Financial Insights**: JavaScript-calculated recommendations that dynamically flag budget overruns, savings rule achievements, high housing costs, and subscription drain alerts.

### 2. Transaction Management & Ledger
* **Full CRUD Operations**: Create, view, edit, duplicate, and delete transactions. Duplicating clones entries to today's date for swift entering.
* **Inline Dynamic Registers**: Register and auto-select custom categories or payment methods on-the-fly directly inside forms.
* **Deep Filtering & Search**: Case-insensitive search on titles and notes with a **300ms input debounce**. Multi-column filtering by Category, Payment Method, Type (Income/Expense), Date Range, and Amount Range.
* **Clickable Column Sort**: Sort lists instantly by Title, Date, or Amount with active caret visual indicators.
* **Pagination**: Smooth ledger pagination at **10 items per page** with dynamic range trackers.

### 3. Budgets & Financial Targets
* **Monthly Budgets**: Set category-specific monthly spending caps. Interactive progress bars adjust colors (emerald, amber, red) based on threshold consumption with status warnings.
* **Savings Goals**: Define savings targets (e.g. emergency fund, vacation), track percentage progress, and contribute funds directly from your balance (auto-adjusting cash flows).

### 4. Upcoming Bills Manager
* **Subscription & Bill Scheduler**: Schedule recurring bills. Highlights overdue invoices, supports deleting reminders, and lets you mark bills as "Paid" to automatically subtract from the balance and insert corresponding ledger entries.

### 5. Preferences & Data Tools
* **OLED Dark & Light Themes**: Persistent theme selector shifting visual styles between OLED Dark mode and clean Light mode.
* **Backup & Restore**: Real-time backup tool to export your entire database as a JSON file and restore it instantly on any device.
* **Maintenance Utilities**: Reseed mock data or wipe local storage with double-confirmation modal security.

---

## 🛠️ Technology Stack
* **Core**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v4 (using CSS `@theme` configuration variables)
* **Routing**: React Router
* **Visualizations**: Recharts
* **Form Controls**: React Hook Form
* **Validation**: Zod (using `zodResolver`)
* **Animations**: Framer Motion
* **Notifications**: React Hot Toast
* **Icons**: Lucide React

---

## ⚡ Performance & Quality Engineering

* **Code Splitting (Lazy Loading)**: Page components (`Dashboard`, `Transactions`, `Budgets`, `Analytics`, `Settings`) and heavy chart libraries are loaded dynamically using `React.lazy` and `Suspense` loaders, shrinking the initial bundle size from **1.2MB** to a **506kB** chunk index.
* **Selector Memoization**: Large-scale financial calculations are memoized via `useMemo` hooks, preventing costly array recalculations on layout renders.
* **A11y Compliance**: Fully semantic HTML structure, keyboard escape handlers on popup modals, focus outline indicators on interactive elements, and color contrasts.

---

## 🚀 Local Installation Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)

### Installation Steps
1. Clone this repository to your local directory:
   ```bash
   git clone <repository-url>
   cd "Personal Finance Tracker"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server locally:
   ```bash
   npm run dev
   ```
4. Build the production-ready bundle:
   ```bash
   npm run build
   ```
