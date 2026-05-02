<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about-project', function () {
    $this->info('Smart Lost and Found System for Students');
})->purpose('Display the project name');
