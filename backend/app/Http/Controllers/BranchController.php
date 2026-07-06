<?php

namespace App\Http\Controllers;

use App\Http\Requests\BranchRequest;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class BranchController extends Controller
{
    public function index()
    {
        $branches = Branch::orderBy('name')->get();
        return Inertia::render('Branches/Index', [
            'branches' => $branches,
        ]);
    }

    public function store(BranchRequest $request)
    {
        Branch::create($request->validated());
        return redirect()->route('branches.index')->with('success', 'Branch created successfully.');
    }

    public function update(BranchRequest $request, Branch $branch)
    {
        $branch->update($request->validated());
        Cache::forget("branch_{$branch->id}_dashboard_stats");
        return redirect()->route('branches.index')->with('success', 'Branch updated successfully.');
    }

    public function destroy(Branch $branch)
    {
        activity()->performedOn($branch)->causedBy(auth()->user())->log('deleted');
        $branch->delete();
        return redirect()->route('branches.index')->with('success', 'Branch deleted successfully.');
    }

    /**
     * Switch active branch dynamically.
     */
    public function switchBranch(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
        ]);

        $user = auth()->user();
        $user->branch_id = $request->branch_id;
        $user->save();

        // Clear dashboard cache
        Cache::forget("branch_{$request->branch_id}_dashboard_stats");

        return back()->with('success', "Switched branch successfully.");
    }
}
