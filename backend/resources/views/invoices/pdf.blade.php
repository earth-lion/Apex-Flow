<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 13px; color: #1e293b; background: #fff; }

        .header { background: linear-gradient(135deg, #0f172a, #1e3a5f); color: #fff; padding: 32px 40px; }
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .brand { font-size: 28px; font-weight: 800; letter-spacing: -1px; color: #fff; }
        .brand span { color: #f59e0b; }
        .brand-sub { font-size: 10px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
        .inv-badge { background: rgba(245,158,11,0.2); border: 1px solid rgba(245,158,11,0.4); color: #f59e0b; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .inv-number { font-size: 22px; font-weight: 700; color: #fff; margin-top: 20px; }
        .inv-date { font-size: 12px; color: #94a3b8; margin-top: 4px; }

        .body { padding: 32px 40px; }

        .parties { display: flex; gap: 40px; margin-bottom: 28px; }
        .party { flex: 1; }
        .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px; }
        .party-name { font-size: 16px; font-weight: 700; color: #0f172a; }
        .party-detail { font-size: 12px; color: #64748b; margin-top: 3px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        thead th:last-child { text-align: right; }
        tbody td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
        tbody td:last-child { text-align: right; font-weight: 600; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:nth-child(even) { background: #f8fafc; }

        .totals { display: flex; justify-content: flex-end; margin-bottom: 28px; }
        .totals-box { width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #64748b; }
        .totals-row.total { border-top: 2px solid #e2e8f0; margin-top: 6px; padding-top: 10px; font-size: 16px; font-weight: 800; color: #0f172a; }
        .totals-row.total span:last-child { color: #d97706; }

        .status-badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-partial { background: #fef3c7; color: #92400e; }
        .status-unpaid { background: #fee2e2; color: #991b1b; }

        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
        .footer-note { font-size: 11px; color: #94a3b8; }
        .footer-brand { font-size: 13px; font-weight: 700; color: #64748b; }
    </style>
</head>
<body>

<div class="header">
    <div class="header-top">
        <div>
            <div class="brand">Apex<span>Flow</span></div>
            <div class="brand-sub">Enterprise ERP System</div>
        </div>
        <div class="inv-badge">{{ strtoupper($invoice->type) }}</div>
    </div>
    <div class="inv-number">{{ $invoice->invoice_number }}</div>
    <div class="inv-date">Issued: {{ $invoice->created_at->format('d F Y') }} &nbsp;|&nbsp; Branch: {{ $invoice->branch->name ?? 'N/A' }}</div>
</div>

<div class="body">

    {{-- Parties --}}
    <div class="parties">
        <div class="party">
            <div class="party-label">From</div>
            <div class="party-name">{{ $invoice->branch->name ?? 'ApexFlow HQ' }}</div>
            <div class="party-detail">{{ $invoice->branch->email ?? '' }}</div>
            <div class="party-detail">{{ $invoice->branch->phone ?? '' }}</div>
        </div>
        @if($invoice->customer)
        <div class="party">
            <div class="party-label">Bill To (Customer)</div>
            <div class="party-name">{{ $invoice->customer->name }}</div>
            <div class="party-detail">{{ $invoice->customer->email }}</div>
            <div class="party-detail">{{ $invoice->customer->phone }}</div>
        </div>
        @elseif($invoice->supplier)
        <div class="party">
            <div class="party-label">Supplier</div>
            <div class="party-name">{{ $invoice->supplier->name }}</div>
            <div class="party-detail">{{ $invoice->supplier->email }}</div>
            <div class="party-detail">{{ $invoice->supplier->phone }}</div>
        </div>
        @endif
        <div class="party">
            <div class="party-label">Payment</div>
            <div class="party-name">{{ ucfirst($invoice->payment_method ?? 'Cash') }}</div>
            <div class="party-detail">
                <span class="status-badge status-{{ $invoice->status }}">{{ ucfirst($invoice->status) }}</span>
            </div>
        </div>
    </div>

    {{-- Items Table --}}
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $i => $item)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $item->product->name ?? 'Deleted Product' }}</td>
                <td>{{ $item->product->sku ?? '—' }}</td>
                <td>{{ $item->quantity }}</td>
                <td>${{ number_format($item->unit_price, 2) }}</td>
                <td>${{ number_format($item->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- Totals --}}
    <div class="totals">
        <div class="totals-box">
            <div class="totals-row"><span>Subtotal</span><span>${{ number_format($invoice->subtotal, 2) }}</span></div>
            <div class="totals-row"><span>Discount</span><span>-${{ number_format($invoice->discount, 2) }}</span></div>
            <div class="totals-row"><span>Tax ({{ round($invoice->tax / ($invoice->subtotal - $invoice->discount ?: 1) * 100, 0) }}%)</span><span>${{ number_format($invoice->tax, 2) }}</span></div>
            <div class="totals-row total"><span>Total</span><span>${{ number_format($invoice->total, 2) }}</span></div>
        </div>
    </div>

    @if($invoice->notes)
    <p style="font-size:12px; color:#64748b; border-top:1px solid #e2e8f0; padding-top:16px;">
        <strong>Notes:</strong> {{ $invoice->notes }}
    </p>
    @endif

</div>

<div class="footer">
    <div class="footer-note">Thank you for your business. Generated by ApexFlow ERP &mdash; {{ now()->format('d M Y, H:i') }}</div>
    <div class="footer-brand">ApexFlow</div>
</div>

</body>
</html>
