<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    //


     public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->user();
        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
          
            if($user->google_id === null){
                $user->google_id = $googleUser->getId();
                $user->avatar = $user->avatar ? $user->avatar : $googleUser->getAvatar();
                $user->save();
            }
        } else {
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => bcrypt(uniqid()), 
                'role' => 'user',
                'avatar' => $googleUser->getAvatar(),
            ]);
        
    }

        Auth::login($user, true);

        return redirect()->intended('/'); 
    }
}
