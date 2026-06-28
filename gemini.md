# Project Roadmap: Aura Finance Tracker

This roadmap outlines the development phases for Aura Finance, a premium SaaS-style Personal Finance Tracker.

---

## Phase 1: Project Setup & Core Layout
- [x] **Project Setup**: React 19 + TypeScript + Vite + Tailwind CSS v4 setup.
- [x] **Folder Structure**: Clean, modular, architectural framework (`src/components`, `src/pages`, `src/hooks`, `src/types`).
- [x] **Tailwind CSS**: Core variables, theme tokens, and custom utility classes.
- [x] **Theme (Light/Dark)**: Custom OLED Dark mode and Light mode shell wrapper.
- [x] **Routing**: Client-side page navigation with React Router.
- [x] **Global Layout**: Premium Sidebar + sticky blurred header Navbar.
- [x] **Typography**: Integrated `IBM Plex Sans` via Google Fonts.
- [x] **Design System**: Persisted master configuration [MASTER.md](file:///C:/Users/SMART%20TECH/Desktop/CLI/Personal%20Finance%20Tracker/design-system/personal-finance-tracker/MASTER.md).
- [x] **Base Components**: Reusable animated Modal component and global Toaster configurations.

---

## Phase 2: Dashboard Overview
- [x] **Analytics Cards**: Primary and secondary finance metrics grid (13 indicators).
- [x] **Interactive Charts**: Recharts Area chart, Bar charts, Pie charts, and custom tooltips/legends.
- [x] **Upcoming Bills Reminder**: Dynamic, actionable bill schedule manager.
- [x] **Recent Activity Feed**: Actionable transactions widget.
- [x] **Real-time JS Insights**: Automatic calculated insights recommendations.
- [x] **Responsive Design & Animations**: Smooth Framer Motion transitions.

---

## Phase 3: Transaction Management & Ledger
- [x] **CRUD Operations**: Complete Add/Edit/Delete/Duplicate ledger entry flows.
- [x] **Zod Validation**: Validated React Hook Form controls.
- [x] **LocalStorage Persistence**: Local storage state sync and recovery.
- [x] **Search & Sort**: Case-insensitive text search and multi-column sorting headers.
- [x] **Filters**: Deep filter controls (Date range, amount, payment methods, categories).
- [x] **Custom Categories & Payment Methods**: Dynamic addition registers.

---

## Phase 4: Advanced Analytics & Deep Dives
- [x] **Assets vs Liabilities**: Graphical comparison of assets, debt, and liquid reserves.
- [x] **Subscription Leak Tracker**: Cumulative monthly subscription calculator and list.
- [x] **Historical Spending Trends**: Line charts comparing income/expenses over time.
- [x] **Empty States**: Premium animated SVG illustrations when database is empty.

---

## Phase 5: Global Preferences & Settings
- [x] **Settings Form**: Display Name, Monthly Income target, and multi-currency formatting configurations.
- [x] **Data Tools**: Reseed sample database or wipe local storage with double-confirmation prompt.
- [x] **Theme Selector**: Dynamic light/dark toggle.

---

## Phase 6: Polish, Accessibility & Optimization
- [x] **Accessibility (a11y)**: Focus rings, keyboard nav, ARIA attributes, semantic HTML.
- [x] **Performance**: Memoized selectors, code splitting, image optimizations.
- [x] **Build Validation**: Error-free, zero-warning production build verification.
