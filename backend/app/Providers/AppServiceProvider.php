<?php

namespace App\Providers;

use App\Support\Console\PlainComponentsFactory;
use Illuminate\Console\View\Components\Factory as ComponentsFactory;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        Sanctum::ignoreMigrations();

        if (! class_exists('DOMDocument')) {
            $this->app->bind(ComponentsFactory::class, PlainComponentsFactory::class);
        }
    }

    public function boot(): void
    {
        //
    }
}
