<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class LinkedInController extends Controller
{
    //
     public function redirectToLinkedIn()
    {
        return Socialite::driver('linkedin')->redirect();
    }

    public function handleLinkedInCallback()
    {
        $linkedInUser = Socialite::driver('linkedin')->user();

        $user = User::where('email', $linkedInUser->getEmail())->first();

        if ($user) {
            if ($user->linkedin_id === null) {
                $user->linkedin_id = $linkedInUser->getId();
                $user->avatar = $user->avatar ?? $linkedInUser->getAvatar();
                $user->email_verified_at = $user->email_verified_at ?? now();
                $user->save();
            }
        } else {
            $user = User::create([
                'name' => $linkedInUser->getName(),
                'email' => $linkedInUser->getEmail(),
                'linkedin_id' => $linkedInUser->getId(),
                'password' => bcrypt(uniqid()),
                'avatar' => $linkedInUser->getAvatar(),
                'email_verified_at' => now(),
            ]);
        }

        Auth::login($user, true);

        return redirect()->intended('/');
    }
}
