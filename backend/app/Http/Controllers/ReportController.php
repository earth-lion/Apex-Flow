<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $this->branchId();

        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to',   now()->toDateString());
        $type = $request->get('type', 'all'); // all | sale | purchase

        // ── Revenue & Cost Summary ──────────────────────────────
        $salesQuery = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59']);

        $purchaseQuery = Invoice::where('branch_id', $branchId)
            ->where('type', 'purchase')
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59']);

        $totalSales     = $salesQuery->sum('total');
        $totalPurchases = $purchaseQuery->sum('total');

        // COGS for the period
        $cogs = DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->where('invoices.branch_id', $branchId)
            ->where('invoices.type', 'sale')
            ->whereBetween('invoices.created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->sum(DB::raw('invoice_items.quantity * products.cost'));

        $grossProfit = $totalSales - $cogs;

        // ── Daily Sales Trend ───────────────────────────────────
        $dailySales = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        // ── Top Products in Period ──────────────────────────────
        $topProducts = DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->where('invoices.branch_id', $branchId)
            ->where('invoices.type', 'sale')
            ->whereBetween('invoices.created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select(
                'products.name',
                'products.sku',
                DB::raw('SUM(invoice_items.quantity) as sold_qty'),
                DB::raw('SUM(invoice_items.total) as revenue'),
                DB::raw('SUM(invoice_items.quantity * products.cost) as cost')
            )
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderBy('sold_qty', 'desc')
            ->limit(10)
            ->get();

        // ── Top Customers in Period ─────────────────────────────
        $topCustomers = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->whereNotNull('customer_id')
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->with('customer:id,name,email')
            ->select('customer_id', DB::raw('SUM(total) as total_spent'), DB::raw('COUNT(*) as invoice_count'))
            ->groupBy('customer_id')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        // ── Invoices List ───────────────────────────────────────
        $invoicesQuery = Invoice::where('branch_id', $branchId)
            ->with(['customer', 'supplier'])
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59']);

        if ($type !== 'all') {
            $invoicesQuery->where('type', $type);
        }

        $invoices = $invoicesQuery->orderBy('created_at', 'desc')->limit(50)->get();

        return Inertia::render('Reports/Index', [
            'summary' => [
                'total_sales'     => round($totalSales, 2),
                'total_purchases' => round($totalPurchases, 2),
                'gross_profit'    => round($grossProfit, 2),
                'cogs'            => round($cogs, 2),
                'profit_margin'   => $totalSales > 0 ? round($grossProfit / $totalSales * 100, 1) : 0,
            ],
            'daily_sales'  => $dailySales,
            'top_products' => $topProducts,
            'top_customers'=> $topCustomers,
            'invoices'     => $invoices,
            'filters'      => ['from' => $from, 'to' => $to, 'type' => $type],
        ]);
    }
}
