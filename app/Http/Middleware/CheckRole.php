<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
     public function handle($request, Closure $next): Response
    {
         if (auth()->check() && (auth()->user()->role === 'instructor' || auth()->user()->role === 'admin' || auth()->user()->role === 'student')) {
            return $next($request);
        }

        abort(403, 'Unauthorized action. You do not have instructor access.');
        //  return redirect('/')->with('error', 'You do not have instructor access.');
    }
}
