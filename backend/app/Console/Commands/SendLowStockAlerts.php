<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Branch;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendLowStockAlerts extends Command
{
    /**
     * The name and signature of the console command.
     * This command runs as a daily Cron Job via the scheduler.
     */
    protected $signature = 'inventory:low-stock-alerts';

    protected $description = 'Send daily email alerts for products with stock at or below the minimum stock level.';

    public function handle(): void
    {
        $this->info('Checking for low stock products...');

        $branches = Branch::where('status', true)->get();

        foreach ($branches as $branch) {
            $lowStockProducts = Product::where('branch_id', $branch->id)
                ->whereRaw('stock <= min_stock_level')
                ->with('category')
                ->get();

            if ($lowStockProducts->isEmpty()) {
                $this->line("[Branch: {$branch->name}] All stock levels OK.");
                continue;
            }

            $this->warn("[Branch: {$branch->name}] {$lowStockProducts->count()} low-stock items found!");

            // In production, send mail:
            // Mail::to($adminEmail)->send(new LowStockAlertMail($branch, $lowStockProducts));

            // For demo, log the alert
            Log::warning("LOW STOCK ALERT for Branch [{$branch->name}]", [
                'branch_id' => $branch->id,
                'products'  => $lowStockProducts->map(fn($p) => [
                    'name'          => $p->name,
                    'sku'           => $p->sku,
                    'stock'         => $p->stock,
                    'min_stock'     => $p->min_stock_level,
                    'category'      => $p->category->name,
                ])->toArray(),
            ]);
        }

        $this->info('Low stock alert check complete.');
    }
}
