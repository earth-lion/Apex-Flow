<?php

namespace App\Jobs;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendInvoiceEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $invoice;

    /**
     * Create a new job instance.
     */
    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // For demonstration/simulation of queue, we log the email delivery.
        // In a real application, you would do:
        // Mail::to($this->invoice->customer->email)->send(new InvoiceMail($this->invoice));
        
        Log::info("Background Job processing: Sending Invoice Email for #{$this->invoice->invoice_number} to customer: {$this->invoice->customer->name} ({$this->invoice->customer->email}). Total amount: {$this->invoice->total}.");
        
        // Simulating some heavy email template generation and network delay
        usleep(500000); // 0.5s sleep
    }
}
