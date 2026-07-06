<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Category;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->query('q');
        $branchId = $this->branchId();

        if (empty($q) || strlen($q) < 2) {
            return response()->json([]);
        }

        // Search Products
        $products = Product::where('branch_id', $branchId)
            ->where(function($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('sku', 'like', "%{$q}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'sku', 'price'])
            ->map(fn($p) => [
                'type' => 'Product',
                'title' => $p->name,
                'subtitle' => "SKU: {$p->sku} • Price: \${$p->price}",
                'url' => "/products?search={$p->sku}",
            ]);

        // Search Categories
        $categories = Category::where('branch_id', $branchId)
            ->where('name', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'name'])
            ->map(fn($cat) => [
                'type' => 'Category',
                'title' => $cat->name,
                'subtitle' => "Category",
                'url' => "/categories?search={$cat->name}",
            ]);

        // Search Customers
        $customers = Customer::where('branch_id', $branchId)
            ->where(function($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('phone', 'like', "%{$q}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'phone'])
            ->map(fn($c) => [
                'type' => 'Customer',
                'title' => $c->name,
                'subtitle' => "Phone: " . ($c->phone ?: '—'),
                'url' => "/customers?search={$c->name}",
            ]);

        // Search Invoices
        $invoices = Invoice::where('branch_id', $branchId)
            ->where('invoice_number', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'invoice_number', 'total', 'type'])
            ->map(fn($i) => [
                'type' => 'Invoice',
                'title' => $i->invoice_number,
                'subtitle' => "Type: " . ucfirst($i->type) . " • Total: \${$i->total}",
                'url' => "/invoices/{$i->id}",
            ]);

        // Combine results
        $results = collect([])
            ->concat($products)
            ->concat($categories)
            ->concat($customers)
            ->concat($invoices);

        return response()->json($results);
    }
}
