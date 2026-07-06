<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'type'           => 'required|in:sale,purchase,return,waste',
            'branch_id'      => 'required|exists:branches,id',
            'customer_id'    => 'nullable|exists:customers,id',
            'supplier_id'    => 'nullable|exists:suppliers,id',
            'status'         => 'nullable|in:paid,partial,unpaid',
            'payment_method' => 'nullable|string|max:50',
            'discount'       => 'nullable|numeric|min:0',
            'tax_rate'       => 'nullable|numeric|min:0|max:1',
            'paid_amount'    => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string',
            'items'          => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ];
    }
}
