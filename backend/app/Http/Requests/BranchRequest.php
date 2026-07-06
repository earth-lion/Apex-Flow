<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('branch') ? $this->route('branch')->id : null;
        
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:branches,code,' . $id,
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'status' => 'nullable|boolean',
        ];
    }
}
