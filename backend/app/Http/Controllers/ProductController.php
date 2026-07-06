<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $this->branchId();

        $products = Product::with('category')
            ->where('branch_id', $branchId)
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%$s%")->orWhere('sku', 'like', "%$s%"))
            ->when($request->category_id, fn($q, $c) => $q->where('category_id', $c))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $categories = Category::where('branch_id', $branchId)->get(['id', 'name']);

        return Inertia::render('Products/Index', [
            'products'   => ProductResource::collection($products),
            'categories' => $categories,
            'filters'    => $request->only(['search', 'category_id']),
        ]);
    }

    public function store(ProductRequest $request)
    {
        $data = $request->validated();
        $data['branch_id'] = auth()->user()->branch_id ?? 1;

        $product = Product::create($data);
        activity()->performedOn($product)->causedBy(auth()->user())->log('created');

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    public function update(ProductRequest $request, Product $product)
    {
        if ($product->branch_id !== (auth()->user()->branch_id ?? 1)) {
            abort(403, 'Unauthorized action.');
        }

        $product->update($request->validated());
        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        if ($product->branch_id !== (auth()->user()->branch_id ?? 1)) {
            abort(403, 'Unauthorized action.');
        }

        activity()->performedOn($product)->causedBy(auth()->user())->log('deleted');
        $product->delete();
        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    public function exportCsv()
    {
        $branchId = $this->branchId();
        $products = Product::with('category')->where('branch_id', $branchId)->orderBy('name')->get();

        $headers = [
            'Content-type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=products_export_' . now()->format('Y-m-d') . '.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($products) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Headers
            fputcsv($file, ['Product ID', 'Name', 'SKU', 'Category', 'Stock', 'Min Stock', 'Price ($)', 'Cost ($)', 'Created At']);

            foreach ($products as $p) {
                fputcsv($file, [
                    $p->id,
                    $p->name,
                    $p->sku,
                    $p->category->name ?? '—',
                    $p->stock,
                    $p->min_stock_level,
                    $p->price,
                    $p->cost,
                    $p->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
