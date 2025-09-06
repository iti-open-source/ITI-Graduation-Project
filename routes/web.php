<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\LinkedInController;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('home', ["isLoggedIn" => Auth::check()]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('interview-dashboard');
    })->name('dashboard');

    // Admin routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('dashboard');
        Route::get('/users', [AdminController::class, 'users'])->name('users');
        Route::get('/users/create', [AdminController::class, 'createUser'])->name('users.create');
        Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
        Route::get('/users/{user}', [AdminController::class, 'showUser'])->name('users.show');
        Route::get('/users/{user}/edit', [AdminController::class, 'editUser'])->name('users.edit');
        Route::put('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->name('users.delete');
        Route::patch('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('users.toggle-status');
    });

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
