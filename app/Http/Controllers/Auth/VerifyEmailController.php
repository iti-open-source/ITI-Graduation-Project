<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    // public function __invoke(EmailVerificationRequest $request): RedirectResponse
    // {
    //     if ($request->user()->hasVerifiedEmail()) {
    //         return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    //     }

    //     $request->fulfill();

    //     return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    // }



    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return $this->redirectUser($request->user()->role);
        }

        $request->fulfill();

        return $this->redirectUser($request->user()->role);
    }

    /**
     * Redirect user based on role
     */
    protected function redirectUser(string | null $role): RedirectResponse
    {
        if ($role === 'admin') {
            return redirect()->intended(route('dashboard', absolute: false) . '?verified=1');
        }

        return redirect()->intended(route('home') . '?verified=1');
    }
}
