<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'], 
            
        ]);
         $avatarPath = null;
    if ($request->hasFile('avatar')) {
        $file = $request->file('avatar');
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        // $avatarPath = $request->file('avatar')->store('profile-photos', $filename , 'public');
        $avatarPath = $file->storeAs('profile-photos', $filename, 'public');
    }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'avatar' => $avatarPath,

        ]);

        event(new Registered($user));

        Auth::login($user);
        if ($user->role === 'admin') {
        return redirect()->intended(route('dashboard', absolute: false));
    }
    return redirect()->route('verification.notice');

    }
}
