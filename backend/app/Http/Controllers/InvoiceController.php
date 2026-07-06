<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Branch;
use App\Services\InvoiceService;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function __construct(
        private InvoiceService $invoiceService,
        private DashboardService $dashboardService
    ) {}

    public function index(Request $request)
    {
        $branchId = $this->branchId();

        $invoices = Invoice::with(['customer', 'supplier', 'user'])
            ->where('branch_id', $branchId)
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->search, fn($q, $s) => $q->where('invoice_number', 'like', "%$s%"))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => InvoiceResource::collection($invoices),
            'filters'  => $request->only(['type', 'status', 'search']),
        ]);
    }

    public function create()
    {
        $branchId = $this->branchId();

        return Inertia::render('Invoices/Create', [
            'customers' => Customer::where('branch_id', $branchId)->get(['id', 'name', 'email']),
            'suppliers' => Supplier::where('branch_id', $branchId)->get(['id', 'name']),
            'products'  => Product::where('branch_id', $branchId)->get(['id', 'name', 'sku', 'price', 'stock']),
        ]);
    }

    public function store(InvoiceRequest $request)
    {
        try {
            $invoice = $this->invoiceService->createInvoice(
                $request->validated(),
                auth()->id()
            );

            // Bust the dashboard stats cache after a transaction
            $this->dashboardService->clearStatsCache($invoice->branch_id);

            return redirect()->route('invoices.show', $invoice)
                ->with('success', "Invoice #{$invoice->invoice_number} created successfully.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['customer', 'supplier', 'user', 'items.product', 'branch']);
        return Inertia::render('Invoices/Show', [
            'invoice' => new InvoiceResource($invoice),
        ]);
    }

    public function destroy(Invoice $invoice)
    {
        activity()->performedOn($invoice)->causedBy(auth()->user())->log('deleted');
        $invoice->delete();
        return redirect()->route('invoices.index')->with('success', 'Invoice deleted.');
    }

    public function downloadPdf(Invoice $invoice)
    {
        $invoice->load(['customer', 'supplier', 'user', 'items.product', 'branch']);

        $pdf = Pdf::loadView('invoices.pdf', ['invoice' => $invoice])
            ->setPaper('A4', 'portrait');

        return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
    }
}
