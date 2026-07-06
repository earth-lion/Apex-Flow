<?php

namespace App\Http\Controllers;

use Illuminate\Http\Exceptions\HttpResponseException;

abstract class Controller
{
    /**
     * Return the authenticated user's branch ID.
     * Aborts with 403 Forbidden if none is assigned,
     * preventing cross-branch data access.
     */
    protected function branchId(): int
    {
        $id = auth()->user()?->branch_id;

        if (! $id) {
            abort(403, 'No branch assigned to your account. Contact your administrator.');
        }

        return (int) $id;
    }
}

