<?php

use App\Http\Middleware\AdminOnly;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\InstructorOnly;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use App\Http\Middleware\RoomAccessControl;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Str;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->alias([
            'check.role'   => CheckRole::class,
            'admin.only'   => AdminOnly::class,
            'instructor.only' => InstructorOnly::class,
            'room.access' => RoomAccessControl::class
        ]);


        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,

        ]);
    })


    ->withExceptions(function (Exceptions $exceptions) {

        $handleRedirect = function () {
            $fallbackRoute = '/'; // 
            $previousUrl = url()->previous();

            // common asset file extensions
            $assetExtensions = [
                '.css',
                '.js',
                '.jpg',
                '.jpeg',
                '.png',
                '.gif',
                '.svg',
                '.ico',
                '.webp',
                '.map',
                '.woff',
                '.woff2',
                '.ttf',
                '.otf',
                '.eot'
            ];

            // 1. If the previous URL is an asset file...
            // 2. Or if the previous URL is the same as the current one (causes a redirect loop)...
            // ...then redirect to the fallback route.
            if (Str::endsWith($previousUrl, $assetExtensions) || $previousUrl === url()->current()) {
                return redirect($fallbackRoute);
            }

            // Otherwise, it's safe to redirect back.
            return redirect()->back();
        };





        // catches authorization exceptions and redirects back with an error message
        $exceptions->renderable(function (AuthorizationException $e, $request) use ($handleRedirect) {
            return $handleRedirect()->with('error', $e->getMessage());
        });

        // catches HTTP 403 ( happens when using abort() )exceptions and redirects back with an error message
        $exceptions->renderable(function (HttpException $e, $request)  use ($handleRedirect) {

            if ($e->getStatusCode() === 403) {
                return $handleRedirect()->with('error', $e->getMessage());
            }
        });
    })->create();
