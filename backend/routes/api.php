<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClaimController;
use App\Http\Controllers\FoundItemController;
use App\Http\Controllers\LostItemController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/lost-items', [LostItemController::class, 'index']);
Route::get('/lost-items/{lostItem}/matches', [MatchController::class, 'forLostItem']);
Route::get('/lost-items/{lostItem}', [LostItemController::class, 'show']);
Route::get('/found-items', [FoundItemController::class, 'index']);
Route::get('/found-items/{foundItem}', [FoundItemController::class, 'show']);
Route::get('/matches', [MatchController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::apiResource('lost-items', LostItemController::class)->except(['index', 'show']);
    Route::apiResource('found-items', FoundItemController::class)->except(['index', 'show']);

    Route::get('/claims', [ClaimController::class, 'index']);
    Route::post('/claims', [ClaimController::class, 'store']);
    Route::get('/claims/{id}', [ClaimController::class, 'show']);
    Route::patch('/claims/{id}/approve', [ClaimController::class, 'approve']);
    Route::patch('/claims/{id}/reject', [ClaimController::class, 'reject']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{notification}/mark-read', [NotificationController::class, 'markRead']);
});
