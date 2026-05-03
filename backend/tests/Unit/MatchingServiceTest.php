<?php

namespace Tests\Unit;

use App\Models\FoundItem;
use App\Models\ItemCategory;
use App\Models\LostItem;
use App\Models\User;
use App\Services\MatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_exact_category_match_scores_one(): void
    {
        $service = new MatchingService();
        [$lostItem, $foundItem] = $this->items(['item_category_id' => 10], ['item_category_id' => 10]);

        $this->assertSame(1.0, $service->categoryScore($lostItem, $foundItem));
    }

    public function test_keyword_overlap_uses_jaccard_similarity(): void
    {
        $service = new MatchingService();
        [$lostItem, $foundItem] = $this->items(
            ['keywords' => ['black', 'laptop', 'dell']],
            ['keywords' => ['black', 'laptop', 'charger']]
        );

        $this->assertSame(0.5, $service->keywordScore($lostItem, $foundItem));
    }

    public function test_zero_keyword_overlap_scores_zero(): void
    {
        $service = new MatchingService();
        [$lostItem, $foundItem] = $this->items(
            ['keywords' => ['wallet']],
            ['keywords' => ['laptop']]
        );

        $this->assertSame(0.0, $service->keywordScore($lostItem, $foundItem));
    }

    public function test_close_dates_score_higher_than_far_dates(): void
    {
        $service = new MatchingService();
        [$lostItem, $closeFoundItem] = $this->items(
            ['lost_at' => now()],
            ['found_at' => now()->addDay()]
        );
        [, $farFoundItem] = $this->items(
            ['lost_at' => now()],
            ['found_at' => now()->addDays(30)]
        );

        $this->assertGreaterThan($service->dateScore($lostItem, $farFoundItem), $service->dateScore($lostItem, $closeFoundItem));
    }

    public function test_location_partial_match_scores_one(): void
    {
        $service = new MatchingService();
        [$lostItem, $foundItem] = $this->items(
            ['lost_location' => 'Main Library second floor'],
            ['found_location' => 'library']
        );

        $this->assertSame(1.0, $service->locationScore($lostItem, $foundItem));
    }

    public function test_total_weighted_score(): void
    {
        $service = new MatchingService();
        [$lostItem, $foundItem] = $this->items(
            [
                'item_category_id' => 1,
                'keywords' => ['black', 'laptop'],
                'lost_at' => now(),
                'lost_location' => 'Library',
            ],
            [
                'item_category_id' => 1,
                'keywords' => ['black', 'laptop'],
                'found_at' => now(),
                'found_location' => 'library',
            ]
        );

        $this->assertSame(1.0, $service->score($lostItem, $foundItem));
    }

    public function test_threshold_filtering_and_unavailable_items_are_excluded(): void
    {
        config(['matching.threshold' => 0.40]);
        $service = new MatchingService();
        $category = ItemCategory::create(['name' => 'Electronics', 'slug' => 'electronics']);
        $otherCategory = ItemCategory::create(['name' => 'Bags', 'slug' => 'bags']);
        $lostItem = $this->persistedLostItem($category, [
            'keywords' => ['black', 'laptop'],
            'lost_at' => now(),
            'lost_location' => 'Library',
        ]);

        $matchingAvailable = $this->persistedFoundItem($category, [
            'title' => 'Found black laptop',
            'keywords' => ['black', 'laptop'],
            'found_at' => now(),
            'found_location' => 'Library',
            'status' => 'available',
        ]);
        $this->persistedFoundItem($category, [
            'title' => 'Claimed black laptop',
            'keywords' => ['black', 'laptop'],
            'found_at' => now(),
            'found_location' => 'Library',
            'status' => 'claimed',
        ]);
        $this->persistedFoundItem($otherCategory, [
            'title' => 'Unrelated bag',
            'keywords' => ['bag'],
            'found_at' => now()->addDays(60),
            'found_location' => 'Gym',
            'status' => 'available',
        ]);

        $matches = $service->findMatchesForLostItem($lostItem);

        $this->assertCount(1, $matches);
        $this->assertTrue($matchingAvailable->is($matches->first()));
    }

    public function test_results_are_sorted_by_score_descending(): void
    {
        $service = new MatchingService();
        $category = ItemCategory::create(['name' => 'Electronics', 'slug' => 'electronics']);
        $lostItem = $this->persistedLostItem($category, [
            'keywords' => ['black', 'laptop'],
            'lost_at' => now(),
            'lost_location' => 'Library',
        ]);

        $weaker = $this->persistedFoundItem($category, [
            'title' => 'Found device',
            'keywords' => ['device'],
            'found_at' => now()->addDays(14),
            'found_location' => 'Cafe',
        ]);
        $stronger = $this->persistedFoundItem($category, [
            'title' => 'Found black laptop',
            'keywords' => ['black', 'laptop'],
            'found_at' => now(),
            'found_location' => 'Library',
        ]);

        $matches = $service->findMatchesForLostItem($lostItem);

        $this->assertTrue($stronger->is($matches->first()));
        $this->assertTrue($weaker->is($matches->last()));
        $this->assertGreaterThan($matches->last()->match_score, $matches->first()->match_score);
    }

    private function items(array $lostOverrides = [], array $foundOverrides = []): array
    {
        return [
            new LostItem(array_merge([
                'item_category_id' => 1,
                'keywords' => [],
                'lost_at' => null,
                'lost_location' => null,
            ], $lostOverrides)),
            new FoundItem(array_merge([
                'item_category_id' => 2,
                'keywords' => [],
                'found_at' => null,
                'found_location' => null,
            ], $foundOverrides)),
        ];
    }

    private function persistedLostItem(ItemCategory $category, array $overrides = []): LostItem
    {
        return LostItem::create(array_merge([
            'user_id' => User::factory()->create()->id,
            'item_category_id' => $category->id,
            'title' => 'Lost black laptop',
            'description' => 'A black laptop lost near the library.',
            'images' => [],
            'status' => 'open',
        ], $overrides));
    }

    private function persistedFoundItem(ItemCategory $category, array $overrides = []): FoundItem
    {
        return FoundItem::create(array_merge([
            'user_id' => User::factory()->create()->id,
            'item_category_id' => $category->id,
            'title' => 'Found black laptop',
            'description' => 'A black laptop found near the library.',
            'keywords' => ['black', 'laptop'],
            'images' => [],
            'status' => 'available',
        ], $overrides));
    }
}
