<?php

return [
    /*
    |--------------------------------------------------------------------------
    | WebRTC Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for WebRTC/LiveKit integration
    |
    */

    'server_url' => env('WEBRTC_SERVER' ),
    'api_key' => env('WEBRTC_API_KEY'),
    'api_secret' => env('WEBRTC_API_SECRET'),
];
