<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClaimRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lost_item_id' => ['required', 'integer', 'exists:lost_items,id'],
            'found_item_id' => ['required', 'integer', 'exists:found_items,id'],
            'message' => ['nullable', 'string', 'max:2000'],
            'proof_details' => ['nullable', 'array'],
        ];
    }
}
