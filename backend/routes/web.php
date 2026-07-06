<?php

use App\Http\Controllers\AIInsightController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SupplierController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public landing / welcome redirects to dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Branches
    Route::resource('branches', BranchController::class)->except(['show']);
    Route::post('/branches/switch', [BranchController::class, 'switchBranch'])->name('branches.switch');

    // Categories
    Route::resource('categories', CategoryController::class)->except(['show']);

    // Products
    Route::get('/products/export/csv', [ProductController::class, 'exportCsv'])->name('products.export');
    Route::resource('products', ProductController::class)->except(['show', 'create', 'edit']);

    // Customers
    Route::resource('customers', CustomerController::class)->except(['show', 'create', 'edit']);

    // Suppliers
    Route::resource('suppliers', SupplierController::class)->except(['show', 'create', 'edit']);

    // Invoices (create / show / delete)
    Route::resource('invoices', InvoiceController::class)->except(['edit', 'update']);
    Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf'])->name('invoices.pdf');

    // Inventory
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');

    // Cashier Shifts
    Route::get('/shifts', [\App\Http\Controllers\CashierShiftController::class, 'index'])->name('shifts.index');
    Route::get('/shifts/status', [\App\Http\Controllers\CashierShiftController::class, 'status'])->name('shifts.status');
    Route::post('/shifts/open', [\App\Http\Controllers\CashierShiftController::class, 'open'])->name('shifts.open');
    Route::post('/shifts/close', [\App\Http\Controllers\CashierShiftController::class, 'close'])->name('shifts.close');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // Activity Log / Audit Trail
    Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index'])->name('activity-logs.index');

    // Global Search — rate limited to 30 req/min
    Route::middleware('throttle:30,1')->get('/global-search', [\App\Http\Controllers\SearchController::class, 'search'])->name('search.global');

    // AI Business Insights & Chat — rate limited
    Route::middleware('throttle:20,1')->get('/ai/insights', [AIInsightController::class, 'insights'])->name('ai.insights');
    Route::middleware('throttle:30,1')->post('/ai/chat', [AIInsightController::class, 'chat'])->name('ai.chat');

    // Notifications (low stock)
    Route::get('/notifications', [DashboardController::class, 'notifications'])->name('notifications');
});

require __DIR__ . '/auth.php';
