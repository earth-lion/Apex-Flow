<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    public function index(Request $request)
    {
        $branchId = $this->branchId();
        $clearCache = $request->boolean('refresh');
        $stats = $this->dashboardService->getDashboardStats($branchId, $clearCache);

        return Inertia::render('Dashboard/Index', ['stats' => $stats]);
    }

    /**
     * JSON endpoint: returns low-stock notifications for the Bell icon.
     */
    public function notifications()
    {
        $branchId = $this->branchId();

        $alerts = Product::where('branch_id', $branchId)
            ->whereRaw('stock <= min_stock_level')
            ->with('category')
            ->orderByRaw('stock ASC')
            ->limit(10)
            ->get()
            ->map(fn($p) => [
                'id'        => $p->id,
                'name'      => $p->name,
                'sku'       => $p->sku,
                'stock'     => $p->stock,
                'min'       => $p->min_stock_level,
                'category'  => $p->category?->name,
                'critical'  => $p->stock === 0,
            ]);

        return response()->json([
            'count'  => $alerts->count(),
            'alerts' => $alerts,
        ]);
    }
}
