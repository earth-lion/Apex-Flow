<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $this->branchId();
        $categories = Category::where('branch_id', $branchId)
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%$s%")->orWhere('description', 'like', "%$s%"))
            ->withCount('products')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Categories/Index', [
            'categories' => CategoryResource::collection($categories),
            'filters'   => $request->only(['search']),
        ]);
    }

    public function store(CategoryRequest $request)
    {
        $data = $request->validated();
        $data['branch_id'] = auth()->user()->branch_id ?? 1;

        Category::create($data);
        return redirect()->route('categories.index')->with('success', 'Category created successfully.');
    }

    public function update(CategoryRequest $request, Category $category)
    {
        if ($category->branch_id !== (auth()->user()->branch_id ?? 1)) {
            abort(403, 'Unauthorized action.');
        }

        $category->update($request->validated());
        return redirect()->route('categories.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        if ($category->branch_id !== (auth()->user()->branch_id ?? 1)) {
            abort(403, 'Unauthorized action.');
        }

        activity()->performedOn($category)->causedBy(auth()->user())->log('deleted');
        $category->delete();
        return redirect()->route('categories.index')->with('success', 'Category deleted successfully.');
    }
}
