# PharmaSys

Pharmacy management system for pharmaceutical and cosmetic retail operations. Handles inventory, point-of-sale, purchasing, multi-branch transfers, and staff management.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | Laravel Sanctum (REST API) |
| Auth | Token-based (Bearer), stored in localStorage |
| Runtime | Node.js, Turbopack (dev) |

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL and app name

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (e.g. `http://localhost:8000/api/v1`) |
| `NEXT_PUBLIC_APP_NAME` | No | Display name throughout the app (default: `PharmaSys`) |

## Architecture

```
app/
├── auth/                        # Login, password reset flows
├── (dashboard)/                 # Authenticated routes (grouped layout)
│   ├── page.tsx                 # Dashboard with KPIs and charts
│   ├── pos/                     # Point of Sale terminal
│   ├── medicines/               # Medicine catalog (CRUD)
│   ├── cosmetics/               # Cosmetic catalog (CRUD)
│   ├── categories/              # Product categories
│   ├── branches/                # Branch management (owner only)
│   ├── users/                   # Staff accounts & roles
│   ├── suppliers/               # Supplier directory
│   ├── stock/                   # Stock batch management
│   ├── stock-movements/         # Inventory audit log
│   ├── stock-transfers/         # Inter-branch transfers
│   ├── purchase-orders/         # Supplier PO workflow
│   ├── sales/                   # Transaction history
│   │   └── shifts/              # Cashier shift tracking
│   ├── reports/                 # Analytics & CSV export
│   ├── settings/                # System configuration
│   └── profile/                 # User profile & preferences
components/
├── layout/                      # Sidebar, topbar
├── pos/                         # Shift modals
├── settings/                    # Telegram config modal
├── ui/                          # Reusable components
lib/
├── api/                         # API client layer (18 modules)
├── mock-data.ts                 # TypeScript interfaces
└── utils.ts                     # Helpers
context/
└── auth-context.tsx             # Auth state, role-based access
```

## User Roles

| Role | Access Scope |
|------|-------------|
| `owner` | Full system. Manages branches, users, settings, Telegram bot. Sees all branches. |
| `manager` | Products, stock, purchase orders, transfers, sales, reports. No branch/user management. |
| `pharmacist` | Medicines, cosmetics, categories, stock, POS sales. Own branch only. |
| `cashier` | POS sales only. Views own sales history and shifts. |
| `inventory_officer` | Stock batches, movements, purchase orders, products, suppliers. No sales access. |

Role-based visibility is enforced in the sidebar navigation and action buttons via `useAuth()` context.

## Core Features

### Point of Sale

- **Shift-based workflow**: Cashier opens shift with opening float, closes with cash reconciliation
- **FEFO allocation**: First-Expiry-First-Out — system auto-selects batches nearest to expiry
- **Pack-aware pricing**: Tracks pack sizes (e.g. 10 strips/pack), calculates unit and pack prices
- **Payment methods**: Cash, Mobile Money (Telebirr), Card/Bank Transfer
- **Tax & discount**: Configurable tax rate (default 15%), per-cashier discount limits
- **Receipt printing**: Thermal format (80mm/58mm) with QR code, customizable header/footer
- **Sale voiding**: Managers/owners can void transactions with reason logging

### Inventory Management

- **Stock batches**: Track by batch number, expiry date, purchase cost, selling price, supplier, branch
- **Stock alerts**: Dashboard cards for low stock, expiring soon (configurable days), expired batches
- **Stock movements**: Full audit trail of every inventory change (purchase, sale, return, adjustment, transfer)
- **FEFO visibility**: Batch expiry ordering visible in stock list

### Multi-Branch Operations

- **Stock transfers**: 4-step workflow — Request → Approve → Dispatch → Receive
- **Branch-scoped settings**: Each branch has independent tax rate, receipt config, expiry thresholds
- **Branch-scoped stock**: Inventory isolated per branch with cross-branch visibility for managers+

### Purchase Orders

- **4-step workflow**: Draft → Ordered → Partially Received → Fully Received
- **Pack-aware receiving**: Enter quantities in packs, system tracks base units
- **Pricing on receipt**: Capture cost per pack, pack selling price, unit selling price at intake

### Product Catalog

Dual product types with shared base fields:

| Field | Medicine | Cosmetic |
|-------|----------|----------|
| `name` | Yes | Yes |
| `sku`, `barcode` | Yes | Yes |
| `pack_size`, `pack_selling_price` | Yes | Yes |
| `generic_name` | Yes | — |
| `strength`, `dosage_form` | Yes | — |
| `is_prescription_required` | Yes | — |
| `product_type`, `size`, `unit` | — | Yes |
| `color`, `shade`, `ingredients` | — | Yes |

### Telegram Integration

- **Bot configuration**: Global bot token stored in settings
- **Password reset**: 6-digit verification codes sent via Telegram
- **Alerts**: Low stock, expiring, expired batch notifications
- **Per-user Chat IDs**: Each staff member configures their own Telegram Chat ID in profile

### Reports & Analytics

- **Charts**: Weekly revenue trend, payment method distribution, top products, branch stock allocation
- **Sales reports**: Revenue by period, payment breakdown
- **Stock reports**: Low stock items, expiring batches, expired batches
- **CSV export**: Download sales and stock data

## API Client

All API communication goes through `lib/api/client.ts` which handles:

- **Auth injection**: Bearer token from localStorage on every request
- **401 handling**: Auto-logout and redirect to `/auth/login` on expired sessions
- **Error parsing**: Extracts first validation error from Laravel error responses
- **Pagination helpers**: `extractListData<T>()` and `extractPaginationMeta()` for consistent response handling

Each API module (`lib/api/*.ts`) exports typed functions with query parameter building:

```typescript
// Example usage
const res = await getMedicines({ search: "aspirin", page: 1, per_page: 15 });
const medicines = extractListData<ApiMedicine>(res);
const meta = extractPaginationMeta(res, medicines.length);
```

## Key Components

| Component | Description |
|-----------|-------------|
| `DataTable` | Generic table with columns, skeleton loading, row click support |
| `Pagination` | Page navigation with per-page selector and ellipsis |
| `ProductPicker` | Searchable product dropdown with type tabs and keyboard navigation |
| `Toast` | Notification system with success/error/info variants |
| `Receipt` | Thermal receipt generator with QR code |
| `ConfirmDialog` | Modal confirmation for destructive actions |
| `StatsCard` | KPI metric display card |
| `StatusBadge` | Colored status labels |
| `Charts` | Area, donut, bar chart components (zero-dependency SVG) |

## Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private — PharmaEt
