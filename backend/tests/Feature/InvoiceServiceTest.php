<?php

use App\Models\Branch;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use App\Services\InvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create a branch first (required for all entities)
    $this->branch = Branch::create([
        'name'   => 'Main Branch',
        'code'   => 'HQ',
        'status' => true,
    ]);

    // Create a user associated to the branch
    $this->user = User::factory()->create([
        'branch_id' => $this->branch->id,
    ]);

    // Create a category
    $this->category = Category::create([
        'name'      => 'Electronics',
        'branch_id' => $this->branch->id,
    ]);

    // Create a product with known stock
    $this->product = Product::create([
        'name'            => 'Test Widget',
        'sku'             => 'TW-001',
        'category_id'     => $this->category->id,
        'branch_id'       => $this->branch->id,
        'price'           => 100.00,
        'cost'            => 60.00,
        'stock'           => 50,
        'min_stock_level' => 5,
    ]);

    // Create a customer
    $this->customer = Customer::create([
        'name'      => 'Jane Doe',
        'email'     => 'jane@example.com',
        'branch_id' => $this->branch->id,
    ]);
});

describe('InvoiceService - Stock Management', function () {
    test('a sale invoice reduces stock by the correct quantity', function () {
        $service = new InvoiceService();
        $initialStock = $this->product->stock; // 50

        $invoice = $service->createInvoice([
            'type'        => 'sale',
            'branch_id'   => $this->branch->id,
            'customer_id' => $this->customer->id,
            'status'      => 'paid',
            'discount'    => 0,
            'tax_rate'    => 0,
            'items'       => [
                ['product_id' => $this->product->id, 'quantity' => 10, 'unit_price' => 100.00],
            ],
        ], $this->user->id);

        $this->product->refresh();

        expect($this->product->stock)->toBe($initialStock - 10)
            ->and($invoice->type)->toBe('sale')
            ->and($invoice->total)->toBeGreaterThan(0);
    });

    test('a purchase invoice increases stock by the correct quantity', function () {
        $service = new InvoiceService();
        $initialStock = $this->product->stock; // 50

        $service->createInvoice([
            'type'       => 'purchase',
            'branch_id'  => $this->branch->id,
            'status'     => 'paid',
            'discount'   => 0,
            'tax_rate'   => 0,
            'items'      => [
                ['product_id' => $this->product->id, 'quantity' => 20, 'unit_price' => 60.00],
            ],
        ], $this->user->id);

        $this->product->refresh();

        expect($this->product->stock)->toBe($initialStock + 20);
    });

    test('a sale throws an exception when stock is insufficient', function () {
        $service = new InvoiceService();

        expect(fn () => $service->createInvoice([
            'type'        => 'sale',
            'branch_id'   => $this->branch->id,
            'customer_id' => $this->customer->id,
            'status'      => 'paid',
            'discount'    => 0,
            'tax_rate'    => 0,
            'items'       => [
                // Request 100, but only 50 in stock
                ['product_id' => $this->product->id, 'quantity' => 100, 'unit_price' => 100.00],
            ],
        ], $this->user->id))->toThrow(\Exception::class);

        // Stock should remain unchanged (DB transaction rolled back)
        $this->product->refresh();
        expect($this->product->stock)->toBe(50);
    });

    test('invoice creates an inventory transaction record', function () {
        $service = new InvoiceService();

        $invoice = $service->createInvoice([
            'type'        => 'sale',
            'branch_id'   => $this->branch->id,
            'customer_id' => $this->customer->id,
            'status'      => 'paid',
            'discount'    => 0,
            'tax_rate'    => 0.15,
            'items'       => [
                ['product_id' => $this->product->id, 'quantity' => 5, 'unit_price' => 100.00],
            ],
        ], $this->user->id);

        $this->assertDatabaseHas('inventory_transactions', [
            'invoice_id' => $invoice->id,
            'product_id' => $this->product->id,
            'type'       => 'sale',
            'quantity'   => -5,
        ]);
    });

    test('partial sale increases customer balance by unpaid amount', function () {
        $service = new InvoiceService();
        $this->customer->refresh();
        $initialBalance = (float) $this->customer->balance;

        $service->createInvoice([
            'type'        => 'sale',
            'branch_id'   => $this->branch->id,
            'customer_id' => $this->customer->id,
            'status'      => 'unpaid',
            'discount'    => 0,
            'tax_rate'    => 0,
            'items'       => [
                ['product_id' => $this->product->id, 'quantity' => 2, 'unit_price' => 100.00],
            ],
        ], $this->user->id);

        $this->customer->refresh();
        expect((float) $this->customer->balance)->toBeGreaterThan($initialBalance);
    });
});
