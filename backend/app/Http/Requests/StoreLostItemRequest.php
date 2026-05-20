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
            'contact_phone' => ['required', 'string', 'regex:/^\+251\d{9}$/'],
            'status' => ['sometimes', 'in:open,claimed,closed'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'contact_phone.regex' => 'The contact phone must be a valid Ethiopian phone number starting with +251 followed by 9 digits (e.g., +251912345678).',
        ];
    }
}
