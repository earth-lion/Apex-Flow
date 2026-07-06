<?php

namespace App\Http\Controllers;

use App\Models\CashierShift;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;

class CashierShiftController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $branchId = $user->branch_id;

        // Managers/Admins can see all shifts in their branch, cashiers can see their own shifts
        $query = CashierShift::with('user')
            ->where('branch_id', $branchId);

        if (!$user->hasRole('admin') && !$user->hasRole('manager')) {
            $query->where('user_id', $user->id);
        }

        $shifts = $query->orderBy('opened_at', 'desc')->paginate(15);

        return Inertia::render('Shifts/Index', [
            'shifts' => $shifts,
            'activeShift' => $this->getActiveShift(),
        ]);
    }

    public function status()
    {
        return response()->json([
            'active_shift' => $this->getActiveShift(),
        ]);
    }

    public function open(Request $request)
    {
        $request->validate([
            'opening_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $user = auth()->user();
        $branchId = $user->branch_id;

        if (!$branchId) {
            return back()->withErrors(['error' => 'يجب ربط حسابك بفرع نشط أولاً.']);
        }

        // Check if there is already an open shift for this user and branch
        $existing = CashierShift::where('user_id', $user->id)
            ->where('branch_id', $branchId)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return back()->withErrors(['error' => 'لديك وردية مفتوحة بالفعل.']);
        }

        CashierShift::create([
            'user_id' => $user->id,
            'branch_id' => $branchId,
            'opened_at' => Carbon::now(),
            'opening_balance' => $request->opening_balance,
            'expected_closing_balance' => $request->opening_balance,
            'status' => 'open',
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'تم فتح وردية الكاشير بنجاح.');
    }

    public function close(Request $request)
    {
        $request->validate([
            'actual_closing_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $activeShift = $this->getActiveShift();

        if (!$activeShift) {
            return back()->withErrors(['error' => 'لا توجد وردية مفتوحة لإغلاقها.']);
        }

        $actual = $request->actual_closing_balance;
        $expected = $activeShift->expected_closing_balance;
        $difference = $actual - $expected;

        $activeShift->update([
            'closed_at' => Carbon::now(),
            'actual_closing_balance' => $actual,
            'difference' => $difference,
            'status' => 'closed',
            'notes' => $request->notes . ($activeShift->notes ? "\n" . $activeShift->notes : ""),
        ]);

        return redirect()->back()->with('success', 'تم إغلاق الوردية بنجاح وتسجيل الرصيد النهائي.');
    }

    private function getActiveShift()
    {
        $user = auth()->user();
        if (!$user) return null;

        return CashierShift::where('user_id', $user->id)
            ->where('branch_id', $user->branch_id)
            ->where('status', 'open')
            ->first();
    }
}
