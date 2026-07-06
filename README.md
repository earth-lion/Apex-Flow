# ApexFlow ERP

> Enterprise-grade ERP system built with **Laravel 12 + React/Inertia.js**

A full-featured business management platform designed for multi-branch retail and wholesale operations.

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 RBAC | Role-based access control (Admin / Manager / Cashier) via Spatie |
| 🤖 AI Business Copilot | Context-aware AI assistant powered by Gemini with heuristic fallback |
| 💰 Cashier Shift Management | Open/close shifts, auto-track cash balance & discrepancies |
| 📊 Financial Reports | Revenue, expenses, profit with interactive charts |
| 🧾 Invoice Engine | Sale, purchase, return & waste invoices with PDF export |
| 📦 Inventory Control | Real-time stock tracking with low-stock alerts |
| 👥 CRM | Customer & supplier management with credit balance tracking |
| 🗃️ Audit Trail | Visual timeline of all system changes with diff viewer |
| 🔔 Notifications | Automated low-stock alerts via scheduled tasks |

## 🛠️ Tech Stack

- **Backend**: Laravel 12, MySQL, Spatie RBAC, Spatie Activity Log, DomPDF
- **Frontend**: React 18, Inertia.js, Lucide Icons, Recharts
- **Build**: Vite 6
- **AI**: Google Gemini API with rule-based fallback

## 🚀 Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/ApexFlow.git
cd ApexFlow/backend

# 2. Install PHP dependencies
composer install

# 3. Install JS dependencies  
npm install

# 4. Configure environment
cp .env.example .env
php artisan key:generate

# 5. Configure your .env database credentials, then:
php artisan migrate --seed

# 6. Run the development servers
composer run dev
# or separately:
php artisan serve
npm run dev
```

## 📁 Project Structure

```
ApexFlow/
├── backend/         # Laravel application
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   ├── resources/js/
│   │   ├── Layouts/AppLayout.jsx
│   │   └── Pages/
│   │       ├── Dashboard/
│   │       ├── Invoices/
│   │       ├── Products/
│   │       ├── Reports/
│   │       ├── Shifts/
│   │       └── ActivityLog/
│   └── routes/
└── start.ps1        # One-click dev environment launcher
```

## 🔑 Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@apexflow.io | password |
| Manager | manager@apexflow.io | password |
| Cashier | cashier@apexflow.io | password |

## 📄 License

MIT
