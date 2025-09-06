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


    public function editUser(User $user)
    {
        return Inertia::render('admin/edit-user', [
            'user' => $user
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->route('admin.users')->with('success', 'User updated successfully.');
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
