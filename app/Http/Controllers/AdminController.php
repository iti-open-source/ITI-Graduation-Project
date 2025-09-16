<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Room;
use App\Models\LobbySession;
use App\Models\InterviewEvaluation;
use App\Models\AIChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $users = User::latest()->paginate(10);
        
        // Calculate meaningful statistics
        $totalUsers = User::count();
        $verifiedUsers = User::whereNotNull('email_verified_at')->count();
        $unverifiedUsers = User::whereNull('email_verified_at')->count();
        $recentUsers = User::where('created_at', '>=', now()->subDays(7))->count();
        
        // Role-based statistics
        $adminUsers = User::where('role', 'admin')->count();
        $instructorUsers = User::where('role', 'instructor')->count();
        $studentUsers = User::where('role', 'student')->count();
        $unassignedUsers = User::whereNull('role')->count();
        
        // Room statistics
        $totalRooms = Room::count();
        $activeRooms = Room::where('is_active', true)->count();
        $roomsThisWeek = Room::where('created_at', '>=', now()->subDays(7))->count();
        
        // Session statistics
        $totalSessions = LobbySession::count();
        $completedSessions = LobbySession::where('status', 'ended')->count();
        $activeSessions = LobbySession::where('status', 'active')->count();
        $sessionsThisWeek = LobbySession::where('created_at', '>=', now()->subDays(7))->count();
        
        // AI Chat statistics
        $totalAIMessages = AIChatMessage::count();
        $aiMessagesThisWeek = AIChatMessage::where('created_at', '>=', now()->subDays(7))->count();
        
        // Growth calculations
        $usersLastWeek = User::where('created_at', '>=', now()->subDays(14))
            ->where('created_at', '<', now()->subDays(7))
            ->count();
        $userGrowthRate = $usersLastWeek > 0 ? round((($recentUsers - $usersLastWeek) / $usersLastWeek) * 100, 1) : 0;
        
        $sessionsLastWeek = LobbySession::where('created_at', '>=', now()->subDays(14))
            ->where('created_at', '<', now()->subDays(7))
            ->count();
        $sessionGrowthRate = $sessionsLastWeek > 0 ? round((($sessionsThisWeek - $sessionsLastWeek) / $sessionsLastWeek) * 100, 1) : 0;
        
        return Inertia::render('admin/dashboard', [
            'users' => $users,
            'stats' => [
                // User statistics
                'totalUsers' => $totalUsers,
                'verifiedUsers' => $verifiedUsers,
                'unverifiedUsers' => $unverifiedUsers,
                'recentUsers' => $recentUsers,
                'userGrowthRate' => $userGrowthRate,
                
                // Role statistics
                'adminUsers' => $adminUsers,
                'instructorUsers' => $instructorUsers,
                'studentUsers' => $studentUsers,
                'unassignedUsers' => $unassignedUsers,
                
                // Room statistics
                'totalRooms' => $totalRooms,
                'activeRooms' => $activeRooms,
                'roomsThisWeek' => $roomsThisWeek,
                
                // Session statistics
                'totalSessions' => $totalSessions,
                'completedSessions' => $completedSessions,
                'activeSessions' => $activeSessions,
                'sessionsThisWeek' => $sessionsThisWeek,
                'sessionGrowthRate' => $sessionGrowthRate,
                
                // AI Chat statistics
                'totalAIMessages' => $totalAIMessages,
                'aiMessagesThisWeek' => $aiMessagesThisWeek,
                
                // Verification rate
                'verificationRate' => $totalUsers > 0 ? round(($verifiedUsers / $totalUsers) * 100, 1) : 0,
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
        'user' => $user,
        'roles' => ['admin', null, 'instructor', 'student'], 
    ]);
}

public function updateUserRole(Request $request, User $user)
{
    $request->validate([
        'role' => ['required', Rule::in([null, 'admin', 'instructor', 'student'])],
    ]);

    $user->update(['role' => $request->role]);

    return redirect()->back()->with('success', "{$user->name} role updated successfully.");
}


public function updateUser(Request $request, User $user)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        'role' => ['required', Rule::in(['admin', null, 'instructor', 'student'])],
        // 'password' => 'nullable|string|min:8|confirmed',
        // 'password_confirmation' => 'nullable|required_with:password|string|min:8',
        'updated_at' => now(),
    ]);

    $user->update($validated);

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
