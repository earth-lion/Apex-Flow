<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $this->branchId();
        $customers = Customer::where('branch_id', $branchId)
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%$s%")->orWhere('phone', 'like', "%$s%"))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => CustomerResource::collection($customers),
            'filters'   => $request->only(['search']),
        ]);
    }

    public function store(CustomerRequest $request)
    {
        $data = $request->validated();
        $data['branch_id'] = auth()->user()->branch_id ?? 1;

        Customer::create($data);
        return redirect()->route('customers.index')->with('success', 'Customer created.');
    }

    public function update(CustomerRequest $request, Customer $customer)
    {
        if ($customer->branch_id !== (auth()->user()->branch_id ?? 1)) {
            abort(403, 'Unauthorized action.');
        }

        $customer->update($request->validated());
        return redirect()->route('customers.index')->with('success', 'Customer updated.');
    }

    public function destroy(Customer $customer)
    {
        if ($customer->branch_id !== (auth()->user()->branch_id ?? 1)) {
            abort(403, 'Unauthorized action.');
        }

        activity()->performedOn($customer)->causedBy(auth()->user())->log('deleted');
        $customer->delete();
        return redirect()->route('customers.index')->with('success', 'Customer deleted.');
    }
}
