<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $activeShift = null;
        if ($request->user() && $request->user()->branch_id) {
            $activeShift = \App\Models\CashierShift::where('user_id', $request->user()->id)
                ->where('branch_id', $request->user()->branch_id)
                ->where('status', 'open')
                ->select(['id', 'opened_at', 'opening_balance', 'expected_closing_balance'])
                ->first();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'branch_id' => $request->user()->branch_id,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
                'branches' => $request->user() ? \App\Models\Branch::where('status', true)->get(['id', 'name', 'code']) : [],
                'active_shift' => $activeShift,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
