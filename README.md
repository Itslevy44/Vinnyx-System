# Vinnyx-System

Enterprise Point of Sale (POS), Workshop Repairs, Stationery & Customer Self-Service Portal for Vinnyx Technologies, Bomet CBD (Opposite Aga Khan Hospital).

## System Architecture

The system is split into two primary layers:

### 1. Frontend (`/frontend`)
- **Framework:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Theme:** Clean white & blue light design system
- **Portals & Role Separation:**
  - **Public Landing Page & Shop:** Customer-facing storefront with instant service request submission, categorized electronics & stationery catalog, and WhatsApp integration (`0750280280`).
  - **Customer Portal (`/customer/dashboard`):** Track ongoing print jobs, hardware repair tickets, and past transaction receipts.
  - **Cyber Tellers (Tellers 1–9):** Dedicated workstation displaying personal accumulated commissions (Day / Week / Month / Year filters) and incoming public service request queues.
  - **Repair Technicians (Tellers 10 & 11):** Dedicated Hardware Repairs Lab and Electronics POS.
  - **Management (Manager & Owner):** Full oversight including Stationery & Cyber POS, Electronics POS, Daily Expenses, Day Close reconciliation, Payroll & Commissions, and Audit trails.
- **Credit:** Designed by Techrift Software ([https://techrift-system.vercel.app/](https://techrift-system.vercel.app/)).

### 2. Backend (`/backend`)
- **Framework:** Laravel 11 / PHP 8.4
- **Modules:**
  - `Auth`: Token authentication (Laravel Sanctum), role-based middleware (`owner`, `manager`, `teller`, `repair_teller`, `customer`), and customer self-registration.
  - `Sales`: POS transactions, multi-item line services, commission allocation per teller.
  - `Payments`: Cash, M-Pesa STK Push integration, Bank/Card processing, and Split Payments.
  - `Expenses`: Petty cash and business expense approvals.
  - `DayClose`: Shift and end-of-day register balancing and audit.
  - `Settings`: Dynamic branch, commission rates, and auth provider configurations.

---

## Getting Started

### Prerequisites
- Node.js 18+ & npm
- PHP 8.2+
- Composer
- MySQL Database

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configure DB credentials in .env
php artisan migrate --seed
php artisan serve
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` (proxies `/api` to backend `http://localhost:8000`).
Production build: `npm run build`.
