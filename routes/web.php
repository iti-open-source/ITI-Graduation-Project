<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AIChatController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\WebRtcController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LeetCodeScraperController;

Route::get('/', function () {
    return Inertia::render('home', ["isLoggedIn" => Auth::check(),]);
})->name('home');



Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', ProfileController::class)->name('dashboard')->middleware('check.role');
    Route::get('api/dashboard/state', [ProfileController::class, 'state'])->name('dashboard.state');

    // Admin routes
    Route::prefix('admin')->name('admin.')->middleware('admin.only')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('dashboard');
        Route::get('/users', [AdminController::class, 'users'])->name('users');
        Route::get('/users/{user}', [AdminController::class, 'showUser'])->name('users.show');
        Route::patch('/users/{user}', [AdminController::class, 'updateUserRole'])
            ->name('users.updateRole');

        // Route::get('/users/{user}/edit', [AdminController::class, 'editUser'])->name('users.edit');
        // Route::put('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');


        Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->name('users.delete');
        Route::patch('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('users.toggle-status');
    });

    // Room routes
    Route::get('lobby', [RoomController::class, 'lobby'])->name('lobby')->middleware('check.role');
    Route::post('rooms', [RoomController::class, 'create'])->name('room.create')->middleware(['instructor.only']);
    Route::get('room/{roomCode}', [RoomController::class, 'show'])->name('room.show')->middleware('room.access');
    Route::get('api/room/{roomCode}/state', [RoomController::class, 'state'])->name('room.state');
    Route::post('room/{roomCode}/join', [RoomController::class, 'join'])->name('room.join');
    Route::post('room/{roomCode}/disconnect', [RoomController::class, 'disconnect'])->name('room.disconnect');
    Route::post('room/{roomCode}/leave', [RoomController::class, 'leave'])->name('room.leave');
    Route::delete('room/{roomCode}', [RoomController::class, 'destroy'])->name('room.destroy');

    Route::post('/rooms/{room}/assign-student', [RoomController::class, 'assignStudent']);
    Route::delete('/rooms/{room}/remove-student/{student}', [RoomController::class, 'removeStudent']);
    Route::put('/rooms/{room}/update-student/{student}', [RoomController::class, 'updateStudentInterview']);
    Route::put('/rooms/{room}/students/{student}/toggle-done', [RoomController::class, 'toggleInterviewDone']);
    Route::put('/rooms/{room}/students/{student}/toggle-absent', [RoomController::class, 'toggleStudentIsAbsent']);






    // Session (simple WebRTC) routes
    Route::get('session/create', [SessionController::class, 'create'])->name('session.create');
    Route::get('session/{sessionCode}', [SessionController::class, 'room'])->name('session.room');
    Route::post('session/{sessionCode}/signal', [SessionController::class, 'signal'])->name('session.signal');
    Route::post('session/{sessionCode}/terminate', [SessionController::class, 'terminate'])->name('session.terminate');
    Route::get('api/session/{sessionCode}/state', [SessionController::class, 'state'])->name('session.state');
    Route::post('session/{sessionCode}/evaluate', [SessionController::class, 'evaluate'])->name('session.evaluate');

    // AI Chat routes
    Route::post('api/ai-chat/{roomCode}', [AIChatController::class, 'chat'])->name('ai.chat');
    Route::get('api/ai-chat/{roomCode}/history', [AIChatController::class, 'getHistory'])->name('ai.chat.history');
    Route::delete('api/ai-chat/{roomCode}/clear', [AIChatController::class, 'clearChat'])->name('ai.chat.clear');
    Route::get('api/ai-chat/provider', [AIChatController::class, 'getProviderInfo'])->name('ai.chat.provider');

    // WebRTC API routes
    Route::post('api/livekit/token', [WebRtcController::class, 'generateToken'])->name('livekit.token');

    // Leetcode problem scraper 
    Route::get('/leetcode/{titleSlug}', [LeetCodeScraperController::class, 'fetchProblem'])->name('leetcode.problem');
});



Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::fallback(function () {
    return Inertia::render('not-found/not-found', ["user" => Auth::user()]);
});
