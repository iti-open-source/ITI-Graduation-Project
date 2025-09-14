<?php

namespace App\Providers;

use App\Models\Room;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        Inertia::share([
            'auth.user' => fn() => Auth::user(),
            'roomsCount' => fn() => $this->getRoomsCount(),
            'assignedRooms' => fn() => $this->getAssignedRooms(),
            'webrtc' => [
                'serverUrl' => config('webrtc.server_url'),
            ],
        ]);
    }

    private function getRoomsCount(): int
    {
        try {
            return Room::count();
        } catch (\Exception $e) {
            // Return 0 if database is not ready or tables don't exist
            return 0;
        }
    }

    private function getAssignedRooms(): array
    {
        try {
            /** @var User|null $user */
            $user = Auth::user();
            if ($user && $user->role === 'student') {
                return $user->assignedRooms()->pluck('rooms.id')->toArray();
            }
            return [];
        } catch (\Exception $e) {
            // Return empty array if database is not ready or tables don't exist
            return [];
        }
    }
}
