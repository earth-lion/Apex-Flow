<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $activities = Activity::with('causer')
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return Inertia::render('ActivityLog/Index', [
            'activities' => $activities,
        ]);
    }
}
