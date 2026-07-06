<?php

namespace App\Http\Controllers;

use App\Models\InventoryTransaction;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $this->branchId();

        $transactions = InventoryTransaction::with(['product', 'user'])
            ->where('branch_id', $branchId)
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->product_id, fn($q, $p) => $q->where('product_id', $p))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $lowStockProducts = Product::where('branch_id', $branchId)
            ->whereRaw('stock <= min_stock_level')
            ->with('category')
            ->get();

        return Inertia::render('Inventory/Index', [
            'transactions'     => $transactions,
            'lowStockProducts' => $lowStockProducts,
            'filters'          => $request->only(['type', 'product_id']),
        ]);
    }
}
