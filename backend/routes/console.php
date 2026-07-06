<?php

use App\Console\Commands\SendLowStockAlerts;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the low-stock alert to run daily at 8 AM
Schedule::command(SendLowStockAlerts::class)->dailyAt('08:00');

// Scheduled Daily Financial Report at 23:59
Schedule::call(function () {
    $yesterday = \Carbon\Carbon::yesterday();
    $branches = \App\Models\Branch::all();

    foreach ($branches as $branch) {
        $sales = \App\Models\Invoice::where('branch_id', $branch->id)
            ->where('type', 'sale')
            ->whereDate('created_at', $yesterday)
            ->sum('total');

        $purchases = \App\Models\Invoice::where('branch_id', $branch->id)
            ->where('type', 'purchase')
            ->whereDate('created_at', $yesterday)
            ->sum('total');

        $profit = $sales - $purchases;

        // Log to activity log
        activity()
            ->causedBy(null) // System-generated
            ->performedOn($branch)
            ->withProperties([
                'sales' => $sales,
                'purchases' => $purchases,
                'profit' => $profit,
                'date' => $yesterday->toDateString()
            ])
            ->log('automated_daily_financial_report');
    }
})->dailyAt('23:59');
