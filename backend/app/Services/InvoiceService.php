<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\InventoryTransaction;
use App\Jobs\SendInvoiceEmailJob;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class InvoiceService
{
    /**
     * Create an invoice along with its items, adjust stock, and update balances.
     * Everything is wrapped in a secure Database Transaction.
     *
     * @param array $data
     * @param int $userId
     * @return Invoice
     * @throws Exception
     */
    public function createInvoice(array $data, int $userId): Invoice
    {
        return DB::transaction(function () use ($data, $userId) {
            $type = $data['type'] ?? 'sale'; // sale, purchase, return, waste
            $branchId = $data['branch_id'];
            
            // Shift Validation for sales
            $activeShift = null;
            if ($type === 'sale') {
                $activeShift = \App\Models\CashierShift::where('user_id', $userId)
                    ->where('branch_id', $branchId)
                    ->where('status', 'open')
                    ->first();

                if (!$activeShift) {
                    throw new Exception("لا يمكن إتمام عملية البيع. يجب فتح وردية كاشير أولاً للفرع الحالي.");
                }
            }
            
            // Calculate total, tax, discount, subtotal
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }
            
            $discount = $data['discount'] ?? 0;
            $taxRate = $data['tax_rate'] ?? 0.15; // 15% default tax
            $tax = ($subtotal - $discount) * $taxRate;
            $total = ($subtotal - $discount) + $tax;
            
            // Generate Invoice Number if not provided
            $invoiceNumber = $data['invoice_number'] ?? $this->generateInvoiceNumber($type, $branchId);

            // 1. Create Invoice Header
            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'customer_id' => $data['customer_id'] ?? null,
                'supplier_id' => $data['supplier_id'] ?? null,
                'user_id' => $userId,
                'branch_id' => $branchId,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'type' => $type,
                'status' => $data['status'] ?? 'paid', // paid, partial, unpaid
                'payment_method' => $data['payment_method'] ?? 'cash',
                'cashier_shift_id' => $activeShift?->id,
            ]);

            // Update expected balance for active shift on cash sale
            if ($activeShift && $invoice->payment_method === 'cash') {
                $activeShift->expected_closing_balance += $total;
                $activeShift->save();
            }

            // 2. Process Invoice Items, adjust stock, and log inventory transactions
            foreach ($data['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                $qty = $itemData['quantity'];
                
                // Create Item record
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'unit_price' => $itemData['unit_price'],
                    'total' => $qty * $itemData['unit_price'],
                ]);

                // Determine stock change direction
                // Sale / Waste / Return-to-Supplier: Decrement stock
                // Purchase / Return-from-Customer: Increment stock
                $qtyChange = 0;
                if ($type === 'sale' || $type === 'waste') {
                    $qtyChange = -$qty;
                } elseif ($type === 'purchase') {
                    $qtyChange = $qty;
                } elseif ($type === 'return') {
                    // If invoice is return: check who returned. If customer returned, stock increases. If returned to supplier, stock decreases.
                    if ($invoice->customer_id) {
                        $qtyChange = $qty; // Stock goes back in
                    } else {
                        $qtyChange = -$qty; // Stock goes out to supplier
                    }
                }

                // Verify stock availability for sales/waste/returns to supplier
                if ($qtyChange < 0 && $product->stock < abs($qtyChange)) {
                    throw new Exception("Invalide stock quantity for product: {$product->name}. Current stock: {$product->stock}, Requested: " . abs($qtyChange));
                }

                // Adjust Product Stock
                $product->stock += $qtyChange;
                $product->save();

                // 3. Log Inventory Transaction
                InventoryTransaction::create([
                    'product_id' => $product->id,
                    'user_id' => $userId,
                    'branch_id' => $branchId,
                    'quantity' => $qtyChange,
                    'type' => $type,
                    'invoice_id' => $invoice->id,
                    'notes' => $data['notes'] ?? "Invoice #{$invoiceNumber}",
                ]);
            }

            // 4. Update Customer / Supplier Account Balances for partial or unpaid credit sales
            $paymentStatus = $data['status'] ?? 'paid';
            if ($paymentStatus !== 'paid') {
                $unpaidAmount = $total; // For simplicity, assume whole invoice total is unpaid if not status 'paid'
                if ($paymentStatus === 'partial') {
                    $paidAmount = $data['paid_amount'] ?? 0;
                    $unpaidAmount = $total - $paidAmount;
                }

                if ($type === 'sale' && $invoice->customer_id) {
                    // Customer owes us money. Increase customer debt balance
                    $customer = Customer::findOrFail($invoice->customer_id);
                    $customer->balance += $unpaidAmount;
                    $customer->save();
                } elseif ($type === 'purchase' && $invoice->supplier_id) {
                    // We owe supplier money. Increase supplier credit balance
                    $supplier = Supplier::findOrFail($invoice->supplier_id);
                    $supplier->balance += $unpaidAmount;
                    $supplier->save();
                }
            }

            // 5. Dispatch background queue job to send invoice email
            if ($invoice->customer_id && $invoice->customer->email) {
                SendInvoiceEmailJob::dispatch($invoice)->onQueue('emails');
            }

            return $invoice;
        });
    }

    /**
     * Generate a unique invoice number sequence.
     */
    private function generateInvoiceNumber(string $type, int $branchId): string
    {
        $prefix = match ($type) {
            'sale' => 'INV-',
            'purchase' => 'PUR-',
            'return' => 'RET-',
            'waste' => 'WST-',
            default => 'TXN-',
        };

        $latestInvoice = Invoice::where('branch_id', $branchId)
            ->where('type', $type)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = 1;
        if ($latestInvoice) {
            $parts = explode('-', $latestInvoice->invoice_number);
            $lastNum = intval(end($parts));
            $sequence = $lastNum + 1;
        }

        return $prefix . str_pad($branchId, 2, '0', STR_PAD_LEFT) . '-' . str_pad($sequence, 6, '0', STR_PAD_LEFT);
    }
}
