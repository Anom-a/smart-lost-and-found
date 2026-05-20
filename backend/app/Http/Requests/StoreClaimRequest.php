<?php

namespace App\Http\Requests;

use App\Models\ClaimRequest;
use App\Models\FoundItem;
use Illuminate\Foundation\Http\FormRequest;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Validation\Validator;

class StoreClaimRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->resolveUserId() !== null;
    }

    public function rules(): array
    {
        return [
            'lost_item_id' => ['required', 'exists:lost_items,id'],
            'found_item_id' => ['required', 'exists:found_items,id'],
            'proof_message' => ['required', 'string', 'min:20', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $claimantId = $this->resolveUserId();
            $lostItemId = $this->integer('lost_item_id');
            $foundItemId = $this->integer('found_item_id');

            if ($claimantId === null) {
                return;
            }

            $duplicate = ClaimRequest::query()
                ->where('claimant_user_id', $claimantId)
                ->where('lost_item_id', $lostItemId)
                ->where('found_item_id', $foundItemId)
                ->exists();

            if ($duplicate) {
                abort(409, 'You have already submitted a claim for this item.');
            }

            $foundItem = FoundItem::query()->find($foundItemId);

            if ($foundItem !== null && (int) $foundItem->user_id === (int) $claimantId) {
                abort(403, 'You cannot submit a claim for your own found item.');
            }
        });
    }

    private function resolveUserId(): ?int
    {
        $bearerToken = $this->bearerToken();

        if ($bearerToken) {
            $personalAccessToken = PersonalAccessToken::findToken($bearerToken);

            if ($personalAccessToken?->tokenable_id) {
                return (int) $personalAccessToken->tokenable_id;
            }
        }

        return $this->user()?->id;
    }
}
