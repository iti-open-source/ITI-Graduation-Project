<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $users = User::latest()->paginate(10);
        
        return Inertia::render('admin/dashboard', [
            'users' => $users,
            'stats' => [
                'totalUsers' => User::count(),
                'verifiedUsers' => User::whereNotNull('email_verified_at')->count(),
                'unverifiedUsers' => User::whereNull('email_verified_at')->count(),
                'recentUsers' => User::where('created_at', '>=', now()->subDays(7))->count(),
            ]
        ]);
    }

    public function users()
    {
        $users = User::latest()->paginate(15);
        
        return Inertia::render('admin/users', [
            'users' => $users
        ]);
    }

    public function showUser(User $user)
    {
        return Inertia::render('admin/user-details', [
            'user' => $user
        ]);
    }



    public function deleteUser(User $user)
    {
        $user->delete();
        
        return redirect()->route('admin.users')->with('success', 'User deleted successfully.');
    }

    public function toggleUserStatus(User $user)
    {
        if ($user->email_verified_at) {
            $user->update(['email_verified_at' => null]);
            $message = 'User deactivated successfully.';
        } else {
            $user->update(['email_verified_at' => now()]);
            $message = 'User activated successfully.';
        }

        return redirect()->back()->with('success', $message);
    }
}
