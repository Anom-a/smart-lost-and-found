<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait ExtractsItemKeywords
{
    protected static function bootExtractsItemKeywords(): void
    {
        static::saving(function ($item): void {
            $keywords = self::normalizeKeywords($item->keywords ?? []);

            if ($keywords === []) {
                $keywords = self::extractKeywordsFromText($item->title.' '.$item->description);
            }

            $item->keywords = $keywords;
        });
    }

    private static function normalizeKeywords(mixed $keywords): array
    {
        if (! is_array($keywords)) {
            return [];
        }

        return collect($keywords)
            ->map(fn ($keyword): string => Str::of((string) $keyword)->lower()->squish()->toString())
            ->filter(fn (string $keyword): bool => strlen($keyword) >= 3)
            ->unique()
            ->values()
            ->all();
    }

    private static function extractKeywordsFromText(string $text): array
    {
        preg_match_all('/[a-z0-9]+/i', Str::lower($text), $matches);

        $stopWords = [
            'the', 'and', 'for', 'with', 'near', 'from', 'that', 'this', 'item',
            'lost', 'found', 'around', 'student', 'main',
        ];

        return collect($matches[0] ?? [])
            ->map(fn (string $word): string => Str::of($word)->lower()->toString())
            ->filter(fn (string $word): bool => strlen($word) >= 3 && ! in_array($word, $stopWords, true))
            ->unique()
            ->take(12)
            ->values()
            ->all();
    }
}
