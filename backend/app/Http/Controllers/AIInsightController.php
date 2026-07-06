<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AIInsightController extends Controller
{
    public function insights()
    {
        $user     = auth()->user();
        $branchId = $user?->branch_id;

        if (! $branchId) {
            return response()->json(['insights' => [], 'health_score' => 0, 'summary' => '']);
        }

        $now      = Carbon::now();
        $insights = [];

        // ── 1. Revenue Trend ────────────────────────────────────────────
        $thisMonth = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->sum('total');

        $lastMonth = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->whereBetween('created_at', [
                $now->copy()->subMonth()->startOfMonth(),
                $now->copy()->subMonth()->endOfMonth(),
            ])
            ->sum('total');

        if ($lastMonth > 0) {
            $revChange = (($thisMonth - $lastMonth) / $lastMonth) * 100;
            if ($revChange >= 10) {
                $insights[] = [
                    'type'        => 'success',
                    'category'    => 'Revenue',
                    'title'       => 'Revenue Growing Strong',
                    'description' => sprintf(
                        'Sales are up %.1f%% vs last month. Current total: $%s.',
                        $revChange,
                        number_format($thisMonth, 0)
                    ),
                    'action'      => 'View Reports',
                    'action_url'  => '/reports',
                    'priority'    => 'medium',
                    'metric'      => '+' . round($revChange, 1) . '%',
                ];
            } elseif ($revChange <= -10) {
                $insights[] = [
                    'type'        => 'warning',
                    'category'    => 'Revenue',
                    'title'       => 'Revenue Declining',
                    'description' => sprintf(
                        'Sales dropped %.1f%% vs last month. Consider a promotion or discount campaign.',
                        abs($revChange)
                    ),
                    'action'      => 'Analyze',
                    'action_url'  => '/reports',
                    'priority'    => 'high',
                    'metric'      => round($revChange, 1) . '%',
                ];
            }
        } elseif ($thisMonth > 0 && $lastMonth == 0) {
            $insights[] = [
                'type'        => 'info',
                'category'    => 'Revenue',
                'title'       => 'First Sales This Month!',
                'description' => sprintf('Great start! You\'ve recorded $%s in sales this month.', number_format($thisMonth, 0)),
                'action'      => 'View Reports',
                'action_url'  => '/reports',
                'priority'    => 'low',
                'metric'      => '$' . number_format($thisMonth, 0),
            ];
        }

        // ── 2. Critical Low / Out-of-Stock ─────────────────────────────
        $criticalStock = Product::where('branch_id', $branchId)->where('stock', 0)->count();
        $lowStock      = Product::where('branch_id', $branchId)
            ->whereRaw('stock > 0 AND stock <= min_stock_level')
            ->count();

        if ($criticalStock > 0) {
            $insights[] = [
                'type'        => 'danger',
                'category'    => 'Inventory',
                'title'       => 'Out of Stock Alert',
                'description' => "{$criticalStock} product(s) are completely out of stock and need immediate restocking.",
                'action'      => 'Restock Now',
                'action_url'  => '/inventory',
                'priority'    => 'critical',
                'metric'      => $criticalStock . ' items',
            ];
        }

        if ($lowStock > 0) {
            $insights[] = [
                'type'        => 'warning',
                'category'    => 'Inventory',
                'title'       => 'Low Stock Warning',
                'description' => "{$lowStock} product(s) are running below minimum levels. Place purchase orders soon.",
                'action'      => 'View Inventory',
                'action_url'  => '/inventory',
                'priority'    => 'high',
                'metric'      => $lowStock . ' items',
            ];
        }

        // ── 3. Star Product This Month ──────────────────────────────────
        $topProduct = DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->where('invoices.branch_id', $branchId)
            ->where('invoices.type', 'sale')
            ->whereMonth('invoices.created_at', $now->month)
            ->whereYear('invoices.created_at', $now->year)
            ->select(
                'products.name',
                DB::raw('SUM(invoice_items.quantity) as qty'),
                DB::raw('SUM(invoice_items.total) as revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderBy('revenue', 'desc')
            ->first();

        if ($topProduct) {
            $insights[] = [
                'type'        => 'info',
                'category'    => 'Products',
                'title'       => 'Star Product This Month',
                'description' => "'{$topProduct->name}' leads with $" . number_format($topProduct->revenue, 0) . " revenue and {$topProduct->qty} units sold.",
                'action'      => 'View Products',
                'action_url'  => '/products',
                'priority'    => 'low',
                'metric'      => '$' . number_format($topProduct->revenue, 0),
            ];
        }

        // ── 4. Unpaid Invoices ──────────────────────────────────────────
        $unpaidCount = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->where('status', 'unpaid')
            ->count();

        $unpaidTotal = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->where('status', 'unpaid')
            ->sum('total');

        if ($unpaidCount > 0) {
            $insights[] = [
                'type'        => 'warning',
                'category'    => 'Finance',
                'title'       => 'Outstanding Payments',
                'description' => "{$unpaidCount} unpaid invoice(s) totaling $" . number_format($unpaidTotal, 0) . " awaiting collection.",
                'action'      => 'View Invoices',
                'action_url'  => '/invoices?status=unpaid',
                'priority'    => 'high',
                'metric'      => '$' . number_format($unpaidTotal, 0),
            ];
        }

        // ── 5. Customer Activity Drop ───────────────────────────────────
        $activeNow = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->whereNotNull('customer_id')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->distinct('customer_id')
            ->count('customer_id');

        $activePrev = Invoice::where('branch_id', $branchId)
            ->where('type', 'sale')
            ->whereNotNull('customer_id')
            ->whereBetween('created_at', [
                $now->copy()->subMonth()->startOfMonth(),
                $now->copy()->subMonth()->endOfMonth(),
            ])
            ->distinct('customer_id')
            ->count('customer_id');

        if ($activePrev > 2 && $activeNow < $activePrev * 0.7) {
            $insights[] = [
                'type'        => 'warning',
                'category'    => 'Customers',
                'title'       => 'Customer Activity Drop',
                'description' => "Active customers fell from {$activePrev} last month to {$activeNow} this month. Re-engagement recommended.",
                'action'      => 'View Customers',
                'action_url'  => '/customers',
                'priority'    => 'high',
                'metric'      => $activeNow . ' active',
            ];
        }

        // ── 6. Peak Sales Day ───────────────────────────────────────────
        $peakDay = DB::table('invoices')
            ->where('branch_id', $branchId)
            ->where('type', 'sale')
            ->whereBetween('created_at', [$now->copy()->subDays(30), $now->copy()])
            ->select(
                DB::raw('DAYNAME(created_at) as day_name'),
                DB::raw('SUM(total) as total')
            )
            ->groupBy(DB::raw('DAYNAME(created_at)'))
            ->orderBy('total', 'desc')
            ->first();

        if ($peakDay) {
            $insights[] = [
                'type'        => 'info',
                'category'    => 'Analytics',
                'title'       => 'Peak Sales Day',
                'description' => "{$peakDay->day_name} is your best sales day over the last 30 days. Schedule promotions then.",
                'action'      => null,
                'action_url'  => null,
                'priority'    => 'low',
                'metric'      => $peakDay->day_name,
            ];
        }

        // ── 7. High Purchase Cost Alert ─────────────────────────────────
        $purchasesThisMonth = Invoice::where('branch_id', $branchId)
            ->where('type', 'purchase')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->sum('total');

        if ($thisMonth > 0 && $purchasesThisMonth > $thisMonth * 0.8) {
            $insights[] = [
                'type'        => 'warning',
                'category'    => 'Finance',
                'title'       => 'High Purchase Costs',
                'description' => 'Purchases are nearly as high as sales this month. Profit margins may be squeezed.',
                'action'      => 'View Reports',
                'action_url'  => '/reports',
                'priority'    => 'medium',
                'metric'      => '$' . number_format($purchasesThisMonth, 0),
            ];
        }

        // ── Health Score ────────────────────────────────────────────────
        $healthScore = $this->calcHealthScore($insights);

        // ── Summary line ────────────────────────────────────────────────
        $summary = $this->buildSummary($healthScore, $insights);

        // Sort: critical → high → medium → low
        $order = ['critical' => 0, 'high' => 1, 'medium' => 2, 'low' => 3];
        usort($insights, fn($a, $b) => $order[$a['priority']] <=> $order[$b['priority']]);

        return response()->json([
            'insights'     => $insights,
            'health_score' => $healthScore,
            'summary'      => $summary,
            'generated_at' => $now->format('H:i'),
        ]);
    }

    private function calcHealthScore(array $insights): int
    {
        $deductions = ['critical' => 30, 'high' => 12, 'medium' => 4, 'low' => 0];
        $score = 100;
        foreach ($insights as $i) {
            $score -= ($deductions[$i['priority']] ?? 0);
        }
        return max(0, min(100, $score));
    }

    private function buildSummary(int $score, array $insights): string
    {
        $critical = count(array_filter($insights, fn($i) => $i['priority'] === 'critical'));
        $high     = count(array_filter($insights, fn($i) => $i['priority'] === 'high'));

        if ($score >= 85) return 'Business is performing excellently. Keep it up!';
        if ($score >= 65) return $high > 0 ? "Good performance with {$high} area(s) needing attention." : 'Business is on track with minor observations.';
        if ($score >= 40) return "Multiple issues detected. Review {$high} high-priority alert(s).";
        return $critical > 0 ? "Critical issues require immediate action ({$critical} critical alert(s))." : 'Several issues need your attention today.';
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $user = auth()->user();
        $branchId = $user?->branch_id;

        if (!$branchId) {
            return response()->json(['reply' => 'الرجاء التأكد من تسجيل الدخول واختيار فرع نشط.']);
        }

        $message = $request->input('message');

        // Compile Business Context Data
        $now = Carbon::now();
        $branchName = $user->branch?->name ?? 'الفرع الحالي';

        // 1. Sales & Purchases this month
        $salesThisMonth = Invoice::where('branch_id', $branchId)->where('type', 'sale')->whereMonth('created_at', $now->month)->whereYear('created_at', $now->year)->sum('total');
        $purchasesThisMonth = Invoice::where('branch_id', $branchId)->where('type', 'purchase')->whereMonth('created_at', $now->month)->whereYear('created_at', $now->year)->sum('total');
        
        // 2. Low stock & out of stock
        $criticalStock = Product::where('branch_id', $branchId)->where('stock', 0)->get(['name', 'sku']);
        $lowStock = Product::where('branch_id', $branchId)->whereRaw('stock > 0 AND stock <= min_stock_level')->get(['name', 'sku', 'stock', 'min_stock_level']);

        // 3. Top selling product this month
        $topProduct = DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->where('invoices.branch_id', $branchId)
            ->where('invoices.type', 'sale')
            ->whereMonth('invoices.created_at', $now->month)
            ->whereYear('invoices.created_at', $now->year)
            ->select('products.name', DB::raw('SUM(invoice_items.quantity) as qty'), DB::raw('SUM(invoice_items.total) as revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderBy('revenue', 'desc')
            ->first();

        // 4. Unpaid invoices
        $unpaidTotal = Invoice::where('branch_id', $branchId)->where('type', 'sale')->where('status', 'unpaid')->sum('total');
        $unpaidCount = Invoice::where('branch_id', $branchId)->where('type', 'sale')->where('status', 'unpaid')->count();

        // 5. Total customers count
        $customersCount = Customer::where('branch_id', $branchId)->count();

        $context = "أنت مساعد أعمال ذكي وخبير مالي لنظام ApexFlow ERP. فرع العمل الحالي هو: {$branchName}.\n";
        $context .= "البيانات المالية الحالية لهذا الشهر:\n";
        $context .= "- إجمالي المبيعات: $" . number_format($salesThisMonth, 2) . "\n";
        $context .= "- إجمالي المشتريات: $" . number_format($purchasesThisMonth, 2) . "\n";
        $context .= "- المنتج الأكثر مبيعاً: " . ($topProduct ? "{$topProduct->name} (كمية: {$topProduct->qty}، إيرادات: \${$topProduct->revenue})" : "لا يوجد مبيعات بعد") . "\n";
        $context .= "- الفواتير غير المدفوعة المعلقة: {$unpaidCount} فاتورة بقيمة إجمالية $" . number_format($unpaidTotal, 2) . "\n";
        $context .= "- عدد المنتجات المنتهية تماماً (Out of Stock): " . $criticalStock->count() . "\n";
        $context .= "- عدد المنتجات منخفضة المخزون: " . $lowStock->count() . "\n";
        $context .= "- إجمالي عدد العملاء: {$customersCount}\n\n";
        $context .= "الرجاء الإجابة على استفسار المستخدم باللغة العربية بأسلوب مهني ومختصر، واستخدام أرقام دقيقة بناءً على البيانات أعلاه إذا سألك عنها.\n";

        $apiKey = env('GEMINI_API_KEY');

        if ($apiKey) {
            try {
                $response = \Illuminate\Support\Facades\Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $context . "استفسار المستخدم: " . $message]
                            ]
                        ]
                    ]
                ]);

                if ($response->successful()) {
                    $json = $response->json();
                    $reply = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
                    if ($reply) {
                        return response()->json(['reply' => trim($reply)]);
                    }
                }
            } catch (\Exception $e) {
                // Fallback to local heuristic response below
            }
        }

        // --- LOCAL HEURISTIC FALLBACK ENGINE ---
        // If API key is not present or query fails, analyze keywords in Arabic/English to provide smart responses
        $msgLower = mb_tolower($message);
        $reply = "";

        if (str_contains($msgLower, 'مبيعات') || str_contains($msgLower, 'ارباح') || str_contains($msgLower, 'sales') || str_contains($msgLower, 'revenue')) {
            $reply = "إجمالي المبيعات المسجلة لفرع **{$branchName}** هذا الشهر يبلغ **\$" . number_format($salesThisMonth, 2) . "**. \n\n";
            if ($topProduct) {
                $reply .= "المنتج الأكثر مساهمة في هذه المبيعات هو **{$topProduct->name}** بإجمالي إيرادات تبلغ **\$" . number_format($topProduct->revenue, 2) . "**.";
            } else {
                $reply .= "لم يتم تسجيل منتج مفضل للمبيعات حتى الآن.";
            }
        } elseif (str_contains($msgLower, 'مخزون') || str_contains($msgLower, 'نقص') || str_contains($msgLower, 'stock') || str_contains($msgLower, 'inventory')) {
            $reply = "تقرير المخزون لفرع **{$branchName}**:\n";
            $reply .= "- عدد المنتجات المنتهية تماماً (Out of Stock): **" . $criticalStock->count() . "** منتج(ات).\n";
            $reply .= "- المنتجات منخفضة المخزون: **" . $lowStock->count() . "** منتج(ات).\n\n";
            
            if ($criticalStock->count() > 0) {
                $reply .= "⚠️ **المنتجات المنتهية:** \n";
                foreach ($criticalStock->take(3) as $p) {
                    $reply .= "- {$p->name} (SKU: {$p->sku})\n";
                }
            }
            if ($lowStock->count() > 0) {
                $reply .= "⚠️ **المنتجات منخفضة الكمية:** \n";
                foreach ($lowStock->take(3) as $p) {
                    $reply .= "- {$p->name} (المتبقي: {$p->stock} | الحد الأدنى: {$p->min_stock_level})\n";
                }
            }
            $reply .= "\nيمكنك التوجه لصفحة المخزون لطلب توريد المنتجات.";
        } elseif (str_contains($msgLower, 'فاتورة') || str_contains($msgLower, 'مستحق') || str_contains($msgLower, 'invoice') || str_contains($msgLower, 'unpaid')) {
            $reply = "يوجد حالياً **{$unpaidCount}** فواتير مبيعات غير مدفوعة ومعلقة في فرع **{$branchName}**.\n";
            $reply .= "القيمة الإجمالية المستحقة للتحصيل تبلغ **\$" . number_format($unpaidTotal, 2) . "**.\n\n";
            $reply .= "💡 *نصيحة المساعد:* يرجى مراجعة صفحة الفواتير وتصفيتها بـ 'غير مدفوعة' لمتابعة التحصيل مع العملاء.";
        } elseif (str_contains($msgLower, 'بريد') || str_contains($msgLower, 'اكتب') || str_contains($msgLower, 'email') || str_contains($msgLower, 'mail')) {
            $reply = "إليك مسودة بريد إلكتروني احترافية لمطالبة العميل بالدفع:\n\n";
            $reply .= "```\n";
            $reply .= "الموضوع: تذكير بموعد استحقاق الفاتورة مع ApexFlow ERP\n\n";
            $reply .= "عزيزنا العميل،\n";
            $reply .= "نأمل أن تكون بخير. نود تذكيركم بلطف بأن هناك فاتورة معلقة بقيمة مستحقة لم يتم سدادها بعد.\n";
            $reply .= "يرجى مراجعة تفاصيل الفاتورة عبر حسابكم أو التواصل معنا لتسهيل عملية الدفع.\n\n";
            $reply .= "أطيب التحيات،\n";
            $reply .= "إدارة الشؤون المالية - فرع {$branchName}\n";
            $reply .= "```";
        } else {
            $reply = "أهلاً بك! أنا مساعد الأعمال الذكي لنظام ApexFlow ERP. \n\n";
            $reply .= "يمكنني مساعدتك في الإجابة على استفسارات المبيعات والمخزون والفواتير المعلقة. \n";
            $reply .= "جرب سؤالي عن: \n";
            $reply .= "- *ما هي مبيعات هذا الشهر؟*\n";
            $reply .= "- *هل توجد منتجات منخفضة المخزون؟*\n";
            $reply .= "- *كم عدد الفواتير غير المدفوعة؟*";
        }

        return response()->json(['reply' => $reply]);
    }
}
