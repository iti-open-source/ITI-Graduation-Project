<?php

use App\Http\Controllers\GoogleController;
use App\Http\Controllers\LinkedInController;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('home', ["isLoggedIn" => Auth::check()]);
})->name('home');

Route::middleware(['auth', 'verified', 'admin.only'])->group(function () {

    Route::get('dashboard', function () {return Inertia::render('dashboard');})->name('dashboard');

    // Room routes
    Route::get('lobby', [RoomController::class, 'lobby'])->name('lobby');
    Route::post('rooms', [RoomController::class, 'create'])->name('room.create');
    Route::get('room/{roomCode}', [RoomController::class, 'show'])->name('room.show');
    Route::post('room/{roomCode}/join', [RoomController::class, 'join'])->name('room.join');
    Route::post('room/{roomCode}/disconnect', [RoomController::class, 'disconnect'])->name('room.disconnect');
    Route::post('room/{roomCode}/leave', [RoomController::class, 'leave'])->name('room.leave');
    Route::post('room/{roomCode}/signaling', [RoomController::class, 'signaling'])->name('room.signaling');
    Route::delete('room/{roomCode}', [RoomController::class, 'destroy'])->name('room.destroy');
});



Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

Route::get('/auth/linkedin', [LinkedInController::class, 'redirectToLinkedIn'])->name('linkedin.login');
Route::get('/auth/linkedin/callback', [LinkedInController::class, 'handleLinkedInCallback']);



require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
