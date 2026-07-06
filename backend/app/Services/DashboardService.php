<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardService
{
    /**
     * Get branch-specific dashboard statistics with Redis caching support.
     *
     * @param int $branchId
     * @param bool $clearCache
     * @return array
     */
    public function getDashboardStats(int $branchId, bool $clearCache = false): array
    {
        $cacheKey = "branch_{$branchId}_dashboard_stats";

        if ($clearCache) {
            Cache::forget($cacheKey);
        }

        // Cache statistics for 10 minutes (600 seconds)
        // If Redis is configured, Laravel will store this key in Redis.
        return Cache::remember($cacheKey, 600, function () use ($branchId) {
            return [
                'kpis' => $this->getKpiSummary($branchId),
                'annual_profits' => $this->getAnnualProfits($branchId),
                'inventory_distribution' => $this->getInventoryDistribution($branchId),
                'top_products' => $this->getTopProducts($branchId),
                'low_stock_alerts' => $this->getLowStockAlerts($branchId),
            ];
        });
    }

    /**
     * Clear stats cache when a transaction happens.
     */
    public function clearStatsCache(int $branchId): void
    {
        Cache::forget("branch_{$branchId}_dashboard_stats");
    }

    private function getKpiSummary(int $branchId): array
    {
        // Total Sales this month
        $salesThisMonth = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total');

        // Total Purchases this month
        $purchasesThisMonth = Invoice::where('branch_id', $branchId)
            ->where('type', 'purchase')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total');

        // Total products count
        $totalProducts = Product::where('branch_id', $branchId)->count();

        // Low stock items count
        $lowStockCount = Product::where('branch_id', $branchId)
            ->whereRaw('stock <= min_stock_level')
            ->count();

        return [
            'sales_this_month' => round($salesThisMonth, 2),
            'purchases_this_month' => round($purchasesThisMonth, 2),
            'total_products' => $totalProducts,
            'low_stock_count' => $lowStockCount,
        ];
    }

    private function getAnnualProfits(int $branchId): array
    {
        // Monthly sales and purchases for the current year
        $year = now()->year;

        $sales = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total) as total_sales'),
                DB::raw('SUM(subtotal) as subtotal_sales')
            )
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->get()
            ->keyBy('month');

        // Calculate Cost of Goods Sold (COGS) to find actual profits
        // COGS = sum(quantity * product.cost)
        $cogs = DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->where('invoices.branch_id', $branchId)
            ->where('invoices.type', 'sale')
            ->whereYear('invoices.created_at', $year)
            ->select(
                DB::raw('MONTH(invoices.created_at) as month'),
                DB::raw('SUM(invoice_items.quantity * products.cost) as total_cost')
            )
            ->groupBy(DB::raw('MONTH(invoices.created_at)'))
            ->get()
            ->keyBy('month');

        $monthlyData = [];
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for ($m = 1; $m <= 12; $m++) {
            $monthSales = $sales->get($m)->total_sales ?? 0;
            $monthCost = $cogs->get($m)->total_cost ?? 0;
            $profit = $monthSales - $monthCost;

            $monthlyData[] = [
                'month' => $months[$m - 1],
                'sales' => round($monthSales, 2),
                'cost' => round($monthCost, 2),
                'profit' => round($profit, 2),
            ];
        }

        return $monthlyData;
    }

    private function getInventoryDistribution(int $branchId): array
    {
        // Stock value and item count by Category
        return Category::where('branch_id', $branchId)
            ->withCount('products')
            ->get()
            ->map(function ($category) {
                $stockVal = Product::where('category_id', $category->id)
                    ->select(DB::raw('SUM(stock * price) as val'))
                    ->first()
                    ->val ?? 0;

                return [
                    'name' => $category->name,
                    'product_count' => $category->products_count,
                    'stock_value' => round($stockVal, 2),
                ];
            })
            ->toArray();
    }

    private function getTopProducts(int $branchId): array
    {
        // Top 5 products by quantity sold
        return DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->where('invoices.branch_id', $branchId)
            ->where('invoices.type', 'sale')
            ->select(
                'products.name',
                'products.sku',
                DB::raw('SUM(invoice_items.quantity) as sold_qty'),
                DB::raw('SUM(invoice_items.total) as revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderBy('sold_qty', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'sold_qty' => (int) $item->sold_qty,
                    'revenue' => round($item->revenue, 2),
                ];
            })
            ->toArray();
    }

    private function getLowStockAlerts(int $branchId): array
    {
        return Product::where('branch_id', $branchId)
            ->whereRaw('stock <= min_stock_level')
            ->with('category')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'stock' => $product->stock,
                    'min_stock_level' => $product->min_stock_level,
                    'category' => $product->category->name,
                ];
            })
            ->toArray();
    }
}
