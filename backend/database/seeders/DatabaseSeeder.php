<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InventoryTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks for clean seeding
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('role_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::table('roles')->truncate();
        DB::table('permissions')->truncate();
        DB::table('inventory_transactions')->truncate();
        DB::table('invoice_items')->truncate();
        DB::table('invoices')->truncate();
        DB::table('products')->truncate();
        DB::table('categories')->truncate();
        DB::table('suppliers')->truncate();
        DB::table('customers')->truncate();
        DB::table('users')->truncate();
        DB::table('branches')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Create Roles
        $adminRole = Role::create(['name' => 'admin']);
        $managerRole = Role::create(['name' => 'manager']);
        $staffRole = Role::create(['name' => 'staff']);

        // 2. Create Permissions
        $permissions = [
            'view-dashboard', 'manage-products', 'manage-invoices',
            'manage-customers', 'manage-suppliers', 'manage-branches',
            'view-reports', 'manage-inventory',
        ];
        foreach ($permissions as $perm) {
            Permission::create(['name' => $perm]);
        }

        // Admin gets all permissions
        $adminRole->syncPermissions($permissions);
        $managerRole->syncPermissions(['view-dashboard', 'manage-products', 'manage-invoices', 'manage-customers', 'manage-suppliers', 'view-reports', 'manage-inventory']);
        $staffRole->syncPermissions(['view-dashboard', 'manage-invoices', 'view-reports']);

        // 3. Create Branch
        $branch = Branch::create([
            'name'    => 'Main Branch — HQ',
            'code'    => 'HQ-01',
            'phone'   => '+1-555-100-0001',
            'email'   => 'hq@apexflow.io',
            'address' => '100 Enterprise Blvd, New York',
            'status'  => true,
        ]);

        // 4. Create Admin User
        $admin = User::factory()->create([
            'name'       => 'Admin User',
            'email'      => 'admin@apexflow.io',
            'password'   => Hash::make('password'),
            'branch_id'  => $branch->id,
        ]);
        $admin->assignRole('admin');

        // 5. Create Categories
        $categories = [
            ['name' => 'Electronics', 'description' => 'Electronic devices, gadgets, and accessories'],
            ['name' => 'Office Supplies', 'description' => 'Office and stationery items'],
            ['name' => 'Furniture', 'description' => 'Office, workspace, and home furniture'],
            ['name' => 'Food & Beverage', 'description' => 'Consumable food items and beverages'],
            ['name' => 'Apparel', 'description' => 'Corporate apparel and staff uniforms'],
        ];

        $createdCats = [];
        foreach ($categories as $cat) {
            $createdCats[] = Category::create([...$cat, 'branch_id' => $branch->id]);
        }

        // 6. Create Products
        $productsData = [
            // Electronics
            ['name' => 'Wireless Mechanical Keyboard', 'sku' => 'ELEC-KEY-01', 'price' => 89.99, 'cost' => 45.00, 'stock' => 140, 'min_stock_level' => 15, 'category_id' => $createdCats[0]->id, 'image_url' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60'],
            ['name' => 'USB-C Multiport Hub 8-in-1', 'sku' => 'ELEC-HUB-02', 'price' => 59.99, 'cost' => 25.00, 'stock' => 95, 'min_stock_level' => 20, 'category_id' => $createdCats[0]->id, 'image_url' => 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&auto=format&fit=crop&q=60'],
            ['name' => '27" IPS Curved Monitor', 'sku' => 'ELEC-MON-03', 'price' => 329.99, 'cost' => 190.00, 'stock' => 4, 'min_stock_level' => 10, 'category_id' => $createdCats[0]->id, 'image_url' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60'], // LOW STOCK
            ['name' => 'Noise Cancelling Headphones', 'sku' => 'ELEC-HD-04', 'price' => 199.99, 'cost' => 110.00, 'stock' => 35, 'min_stock_level' => 8, 'category_id' => $createdCats[0]->id, 'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'],
            ['name' => 'FHD Pro Webcam 1080p', 'sku' => 'ELEC-CAM-05', 'price' => 79.99, 'cost' => 35.00, 'stock' => 0, 'min_stock_level' => 12, 'category_id' => $createdCats[0]->id, 'image_url' => 'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=500&auto=format&fit=crop&q=60'], // OUT OF STOCK

            // Office Supplies
            ['name' => 'Premium A4 Paper Ream', 'sku' => 'OFF-PAP-01', 'price' => 14.50, 'cost' => 7.00, 'stock' => 480, 'min_stock_level' => 60, 'category_id' => $createdCats[1]->id, 'image_url' => 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60'],
            ['name' => 'Gel Pen Box (Assorted)', 'sku' => 'OFF-PEN-02', 'price' => 24.99, 'cost' => 10.00, 'stock' => 180, 'min_stock_level' => 30, 'category_id' => $createdCats[1]->id, 'image_url' => 'https://images.unsplash.com/photo-1585336139080-b019d0b2d3dd?w=500&auto=format&fit=crop&q=60'],
            ['name' => 'Dry Erase Whiteboard', 'sku' => 'OFF-WBD-03', 'price' => 49.99, 'cost' => 20.00, 'stock' => 22, 'min_stock_level' => 5, 'category_id' => $createdCats[1]->id, 'image_url' => 'https://images.unsplash.com/photo-1572945281861-c8ef85c7bb74?w=500&auto=format&fit=crop&q=60'],

            // Furniture
            ['name' => 'Ergonomic Mesh Chair', 'sku' => 'FURN-CHR-01', 'price' => 450.00, 'cost' => 240.00, 'stock' => 18, 'min_stock_level' => 5, 'category_id' => $createdCats[2]->id, 'image_url' => 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60'],
            ['name' => 'L-Shaped Electric Desk', 'sku' => 'FURN-DSK-02', 'price' => 699.00, 'cost' => 410.00, 'stock' => 8, 'min_stock_level' => 3, 'category_id' => $createdCats[2]->id, 'image_url' => 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&auto=format&fit=crop&q=60'],
            ['name' => 'Dual Monitor Arm Stand', 'sku' => 'FURN-ARM-03', 'price' => 129.99, 'cost' => 60.00, 'stock' => 25, 'min_stock_level' => 6, 'category_id' => $createdCats[2]->id, 'image_url' => 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop&q=60'],

            // Food & Beverage
            ['name' => 'Premium Roast Coffee Beans', 'sku' => 'FOOD-COF-01', 'price' => 19.99, 'cost' => 9.00, 'stock' => 110, 'min_stock_level' => 25, 'category_id' => $createdCats[3]->id, 'image_url' => 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&auto=format&fit=crop&q=60'],
            ['name' => 'Organic Green Tea (100pk)', 'sku' => 'FOOD-TEA-02', 'price' => 15.99, 'cost' => 6.50, 'stock' => 80, 'min_stock_level' => 15, 'category_id' => $createdCats[3]->id, 'image_url' => 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=500&auto=format&fit=crop&q=60'],

            // Apparel
            ['name' => 'Slim Fit Polo Shirt', 'sku' => 'APP-POL-01', 'price' => 34.99, 'cost' => 14.00, 'stock' => 150, 'min_stock_level' => 20, 'category_id' => $createdCats[4]->id, 'image_url' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60'],
            ['name' => 'Windbreaker Jacket', 'sku' => 'APP-WND-02', 'price' => 79.99, 'cost' => 38.00, 'stock' => 65, 'min_stock_level' => 10, 'category_id' => $createdCats[4]->id, 'image_url' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60'],
        ];

        $products = [];
        foreach ($productsData as $prod) {
            $products[] = Product::create([...$prod, 'branch_id' => $branch->id]);
        }

        // 7. Create Suppliers
        $suppliers = [
            Supplier::create(['name' => 'TechMart Global', 'phone' => '+1-555-200-0001', 'email' => 'sales@techmart.com', 'branch_id' => $branch->id]),
            Supplier::create(['name' => 'Office & Co Supply', 'phone' => '+1-555-200-0002', 'email' => 'partners@officeco.com', 'branch_id' => $branch->id]),
            Supplier::create(['name' => 'Comfort Furniture Group', 'phone' => '+1-555-200-0003', 'email' => 'orders@comfortfurn.com', 'branch_id' => $branch->id]),
            Supplier::create(['name' => 'Natura Food Distributor', 'phone' => '+1-555-200-0004', 'email' => 'logistics@naturafood.com', 'branch_id' => $branch->id]),
            Supplier::create(['name' => 'Stitch & Thread Apparel', 'phone' => '+1-555-200-0005', 'email' => 'b2b@stitchthread.com', 'branch_id' => $branch->id]),
        ];

        // 8. Create Customers
        $customers = [
            Customer::create(['name' => 'Acme Technologies LLC', 'phone' => '+1-555-300-0001', 'email' => 'billing@acme.com', 'branch_id' => $branch->id]),
            Customer::create(['name' => 'Global Horizon Ventures', 'phone' => '+1-555-300-0002', 'email' => 'accounts@globalhorizon.com', 'branch_id' => $branch->id]),
            Customer::create(['name' => 'Creative Hub Agency', 'phone' => '+1-555-300-0003', 'email' => 'hello@creativehub.co', 'branch_id' => $branch->id]),
            Customer::create(['name' => 'Sarah Jenkins', 'phone' => '+1-555-300-0004', 'email' => 'sarah.j@email.com', 'branch_id' => $branch->id]),
            Customer::create(['name' => 'David Miller', 'phone' => '+1-555-300-0005', 'email' => 'david.m@outlook.com', 'branch_id' => $branch->id]),
            Customer::create(['name' => 'Vortex Retail Partners', 'phone' => '+1-555-300-0006', 'email' => 'finance@vortexretail.com', 'branch_id' => $branch->id]),
            Customer::create(['name' => 'Elena Rostova', 'phone' => '+1-555-300-0007', 'email' => 'elena.ros@yandex.com', 'branch_id' => $branch->id]),
            Customer::create(['name' => 'Alpha Synergy Corp', 'phone' => '+1-555-300-0008', 'email' => 'procurement@alphasyn.com', 'branch_id' => $branch->id]),
            Customer::create(['name' => 'Apex Design Studio', 'phone' => '+1-555-300-0009', 'email' => 'design@apexstudio.io', 'branch_id' => $branch->id]),
            Customer::create(['name' => 'Robert Chen', 'phone' => '+1-555-300-0010', 'email' => 'robert.c@fastmail.com', 'branch_id' => $branch->id]),
        ];

        // 9. Generate realistic historical invoices over the last 12 months!
        $invoiceCount = 0;
        
        // Loop backward for the last 12 months
        for ($monthOffset = 11; $monthOffset >= 0; $monthOffset--) {
            $monthDate = Carbon::now()->subMonths($monthOffset);
            
            // Random number of sales in this month (3 to 6 sales)
            $salesInMonth = rand(3, 6);
            for ($s = 0; $s < $salesInMonth; $s++) {
                $invoiceCount++;
                $invoiceDate = $monthDate->copy()->startOfMonth()->addDays(rand(1, 27))->setTime(rand(9, 18), rand(0, 59));
                
                $customer = $customers[array_rand($customers)];
                
                // Select 1 to 3 random products for the sale
                $numProducts = rand(1, 3);
                $selectedProds = array_rand($products, $numProducts);
                if (!is_array($selectedProds)) {
                    $selectedProds = [$selectedProds];
                }
                
                $subtotal = 0;
                $itemsToCreate = [];
                
                foreach ($selectedProds as $pIdx) {
                    $product = $products[$pIdx];
                    $qty = rand(1, 4);
                    $totalPrice = $product->price * $qty;
                    $subtotal += $totalPrice;
                    
                    $itemsToCreate[] = [
                        'product_id' => $product->id,
                        'quantity'   => $qty,
                        'unit_price' => $product->price,
                        'total'      => $totalPrice,
                    ];
                }
                
                $discount = rand(0, 1) ? round($subtotal * (rand(5, 15) / 100), 2) : 0;
                $taxableAmount = $subtotal - $discount;
                $tax = round($taxableAmount * 0.08, 2); // 8% tax
                $total = $taxableAmount + $tax;
                
                $status = ['paid', 'paid', 'paid', 'partial', 'unpaid'][rand(0, 4)];
                
                $invoice = Invoice::create([
                    'invoice_number' => 'INV-SALE-' . str_pad($invoiceCount, 5, '0', STR_PAD_LEFT),
                    'customer_id'    => $customer->id,
                    'supplier_id'    => null,
                    'user_id'        => $admin->id,
                    'branch_id'      => $branch->id,
                    'subtotal'       => $subtotal,
                    'tax'            => $tax,
                    'discount'       => $discount,
                    'total'          => $total,
                    'type'           => 'sale',
                    'status'         => $status,
                    'payment_method' => ['cash', 'card', 'bank_transfer'][rand(0, 2)],
                    'created_at'     => $invoiceDate,
                    'updated_at'     => $invoiceDate,
                ]);
                
                foreach ($itemsToCreate as $item) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        ...$item,
                        'created_at' => $invoiceDate,
                        'updated_at' => $invoiceDate,
                    ]);
                    
                    // Create Inventory Transaction record
                    InventoryTransaction::create([
                        'product_id' => $item['product_id'],
                        'user_id'    => $admin->id,
                        'branch_id'  => $branch->id,
                        'quantity'   => -$item['quantity'], // Negative for sales exit
                        'type'       => 'sale',
                        'invoice_id' => $invoice->id,
                        'notes'      => 'Sale invoice #' . $invoice->invoice_number,
                        'created_at' => $invoiceDate,
                        'updated_at' => $invoiceDate,
                    ]);
                }

                // If unpaid or partial, update customer balance
                if ($status !== 'paid') {
                    $unpaidAmount = $total;
                    if ($status === 'partial') {
                        $unpaidAmount = round($total * 0.5, 2);
                    }
                    $customer->increment('balance', $unpaidAmount);
                }
            }

            // Random number of purchases in this month (1 to 2 purchases)
            $purchasesInMonth = rand(1, 2);
            for ($p = 0; $p < $purchasesInMonth; $p++) {
                $invoiceCount++;
                $invoiceDate = $monthDate->copy()->startOfMonth()->addDays(rand(1, 27))->setTime(rand(9, 18), rand(0, 59));
                
                $supplier = $suppliers[array_rand($suppliers)];
                
                // Select 1 to 2 random products for the purchase
                $numProducts = rand(1, 2);
                $selectedProds = array_rand($products, $numProducts);
                if (!is_array($selectedProds)) {
                    $selectedProds = [$selectedProds];
                }
                
                $subtotal = 0;
                $itemsToCreate = [];
                
                foreach ($selectedProds as $pIdx) {
                    $product = $products[$pIdx];
                    $qty = rand(10, 30);
                    $totalPrice = $product->cost * $qty;
                    $subtotal += $totalPrice;
                    
                    $itemsToCreate[] = [
                        'product_id' => $product->id,
                        'quantity'   => $qty,
                        'unit_price' => $product->cost,
                        'total'      => $totalPrice,
                    ];
                }
                
                $tax = round($subtotal * 0.05, 2); // 5% tax on purchases
                $total = $subtotal + $tax;
                
                $invoice = Invoice::create([
                    'invoice_number' => 'INV-PURC-' . str_pad($invoiceCount, 5, '0', STR_PAD_LEFT),
                    'customer_id'    => null,
                    'supplier_id'    => $supplier->id,
                    'user_id'        => $admin->id,
                    'branch_id'      => $branch->id,
                    'subtotal'       => $subtotal,
                    'tax'            => $tax,
                    'discount'       => 0,
                    'total'          => $total,
                    'type'           => 'purchase',
                    'status'         => 'paid',
                    'payment_method' => 'bank_transfer',
                    'created_at'     => $invoiceDate,
                    'updated_at'     => $invoiceDate,
                ]);
                
                foreach ($itemsToCreate as $item) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        ...$item,
                        'created_at' => $invoiceDate,
                        'updated_at' => $invoiceDate,
                    ]);
                    
                    // Create Inventory Transaction record
                    InventoryTransaction::create([
                        'product_id' => $item['product_id'],
                        'user_id'    => $admin->id,
                        'branch_id'  => $branch->id,
                        'quantity'   => $item['quantity'], // Positive for purchase entry
                        'type'       => 'purchase',
                        'invoice_id' => $invoice->id,
                        'notes'      => 'Purchase invoice #' . $invoice->invoice_number,
                        'created_at' => $invoiceDate,
                        'updated_at' => $invoiceDate,
                    ]);
                }
            }
        }

        $this->command->info('✅ ApexFlow database seeded successfully with rich historical data!');
        $this->command->info('Admin: admin@apexflow.io | Password: password');
    }
}
