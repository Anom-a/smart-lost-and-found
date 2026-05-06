<?php
/**
 * Smart Lost and Found System
 *
 * @package App\Services
 * @author  System Developer
 */

namespace App\Services;

use App\Models\FoundItem;
use App\Models\LostItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Class MatchingService
 *
 * Handles the logic for matching lost items with potentially matching found items
 * using weighted signals like categories, keywords, dates, and locations.
 */
class MatchingService
{
    /**
     * Find potential found item matches for a given lost item.
     *
     * @param  LostItem  $lostItem
     * @param  int  $limit
     * @return Collection
     */
    public function findMatchesForLostItem(LostItem $lostItem, int $limit = 10): Collection
    {
        return FoundItem::query()
            ->with(['user', 'category'])
            ->where('status', 'available')
            ->get()
            ->map(function (FoundItem $foundItem) use ($lostItem): FoundItem {
                $breakdown = $this->scoreBreakdown($lostItem, $foundItem);
                $foundItem->setAttribute('match_score', $breakdown['total']);
                $foundItem->setAttribute('match_breakdown', $breakdown);

                return $foundItem;
            })
            ->filter(fn (FoundItem $foundItem): bool => $foundItem->match_score >= $this->threshold())
            ->sortByDesc('match_score')
            ->take($limit)
            ->values();
    }

    /**
     * Calculate a single total match score between a lost and found item.
     *
     * @param  LostItem  $lostItem
     * @param  FoundItem  $foundItem
     * @return float
     */
    public function score(LostItem $lostItem, FoundItem $foundItem): float
    {
        return $this->scoreBreakdown($lostItem, $foundItem)['total'];
    }

    /**
     * Get a detailed breakdown of scores for each matching signal.
     *
     * @param  LostItem  $lostItem
     * @param  FoundItem  $foundItem
     * @return array
     */
    public function scoreBreakdown(LostItem $lostItem, FoundItem $foundItem): array
    {
        $scores = [
            'category' => $this->categoryScore($lostItem, $foundItem),
            'keyword' => $this->keywordScore($lostItem, $foundItem),
            'date' => $this->dateScore($lostItem, $foundItem),
            'location' => $this->locationScore($lostItem, $foundItem),
        ];

        $total = collect($scores)
            ->map(fn (float $score, string $signal): float => $score * $this->weight($signal))
            ->sum();

        return array_merge($scores, [
            'total' => round($total, 4),
        ]);
    }

    /**
     * Calculate score based on whether items belong to the same category.
     *
     * @param  LostItem  $lostItem
     * @param  FoundItem  $foundItem
     * @return float
     */
    public function categoryScore(LostItem $lostItem, FoundItem $foundItem): float
    {
        return (int) $lostItem->item_category_id === (int) $foundItem->item_category_id ? 1.0 : 0.0;
    }

    /**
     * Calculate score based on keyword overlap using Jaccard similarity.
     *
     * @param  LostItem  $lostItem
     * @param  FoundItem  $foundItem
     * @return float
     */
    public function keywordScore(LostItem $lostItem, FoundItem $foundItem): float
    {
        $lostKeywords = $this->keywords($lostItem->keywords ?? []);
        $foundKeywords = $this->keywords($foundItem->keywords ?? []);

        if ($lostKeywords === [] || $foundKeywords === []) {
            return 0.0;
        }

        $intersection = array_intersect($lostKeywords, $foundKeywords);
        $union = array_unique(array_merge($lostKeywords, $foundKeywords));

        return count($union) === 0 ? 0.0 : round(count($intersection) / count($union), 4);
    }

    public function dateScore(LostItem $lostItem, FoundItem $foundItem): float
    {
        if (! $lostItem->lost_at || ! $foundItem->found_at) {
            return 0.0;
        }

        $daysDiff = abs($lostItem->lost_at->diffInDays($foundItem->found_at));

        return round(exp(-$daysDiff / 7), 4);
    }

    public function locationScore(LostItem $lostItem, FoundItem $foundItem): float
    {
        $lostLocation = $this->normalizeText($lostItem->lost_location);
        $foundLocation = $this->normalizeText($foundItem->found_location);

        if ($lostLocation === '' || $foundLocation === '') {
            return 0.0;
        }

        if (Str::contains($lostLocation, $foundLocation) || Str::contains($foundLocation, $lostLocation)) {
            return 1.0;
        }

        similar_text($lostLocation, $foundLocation, $percent);

        return round($percent / 100, 4);
    }

    private function weight(string $signal): float
    {
        return (float) config("matching.weights.$signal", 0);
    }

    private function threshold(): float
    {
        return (float) config('matching.threshold', 0.40);
    }

    private function keywords(array $keywords): array
    {
        return collect($keywords)
            ->map(fn ($keyword): string => $this->normalizeText((string) $keyword))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function normalizeText(?string $value): string
    {
        return Str::of($value ?? '')
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/', ' ')
            ->squish()
            ->toString();
    }
}
