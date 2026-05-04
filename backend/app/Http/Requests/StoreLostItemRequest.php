<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLostItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_category_id' => ['required', 'integer', 'exists:item_categories,id'],
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['required', 'string', 'min:10'],
            'keywords' => ['nullable', 'array'],
            'keywords.*' => ['string', 'max:60'],
            'lost_location' => ['nullable', 'string', 'max:255'],
            'lost_at' => ['nullable', 'date'],
            'contact_preference' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:open,claimed,closed'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
