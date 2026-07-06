<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $this->branchId();
        $suppliers = Supplier::where('branch_id', $branchId)
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%$s%")->orWhere('phone', 'like', "%$s%"))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => SupplierResource::collection($suppliers),
            'filters'   => $request->only(['search']),
        ]);
    }

    public function store(SupplierRequest $request)
    {
        $data = $request->validated();
        $data['branch_id'] = auth()->user()->branch_id ?? 1;

        Supplier::create($data);
        return redirect()->route('suppliers.index')->with('success', 'Supplier created.');
    }

    public function update(SupplierRequest $request, Supplier $supplier)
    {
        if ($supplier->branch_id !== (auth()->user()->branch_id ?? 1)) {
            abort(403, 'Unauthorized action.');
        }

        $supplier->update($request->validated());
        return redirect()->route('suppliers.index')->with('success', 'Supplier updated.');
    }

    public function destroy(Supplier $supplier)
    {
        if ($supplier->branch_id !== (auth()->user()->branch_id ?? 1)) {
            abort(403, 'Unauthorized action.');
        }

        activity()->performedOn($supplier)->causedBy(auth()->user())->log('deleted');
        $supplier->delete();
        return redirect()->route('suppliers.index')->with('success', 'Supplier deleted.');
    }
}
