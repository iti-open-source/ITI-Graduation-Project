<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Http\Middleware\RoomAccessControl;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;

// Bootstrap Laravel
$app = new Application(realpath(__DIR__));
$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);
$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);
$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Room Access Logic...\n";

// Test the date parsing logic directly
$testDate = '2025-09-14';
$testTime = '19:17:00';

try {
    $dateTimeString = $testDate . ' ' . $testTime;
    $interviewDateTime = Carbon::createFromFormat('Y-m-d H:i:s', $dateTimeString);
    $now = Carbon::now();

    echo "Interview DateTime: " . $interviewDateTime->format('Y-m-d H:i:s') . "\n";
    echo "Current DateTime: " . $now->format('Y-m-d H:i:s') . "\n";
    echo "Can Access: " . ($now->greaterThanOrEqualTo($interviewDateTime) ? 'YES' : 'NO') . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Test with database data
try {
    $room = Room::where('room_code', 'muxCeYzn')->first();
    if ($room) {
        echo "\nRoom found: " . $room->name . "\n";

        $assignedStudent = $room->assignedStudents()->first();
        if ($assignedStudent) {
            echo "Assigned student: " . $assignedStudent->name . "\n";
            echo "Interview Date: " . $assignedStudent->pivot->interview_date . "\n";
            echo "Interview Time: " . $assignedStudent->pivot->interview_time . "\n";

            // Test the exact logic from middleware
            $interviewDate = $assignedStudent->pivot->interview_date;
            $interviewTime = $assignedStudent->pivot->interview_time;

            $dateTimeString = $interviewDate . ' ' . $interviewTime;
            $interviewDateTime = Carbon::createFromFormat('Y-m-d H:i:s', $dateTimeString);
            $now = Carbon::now();

            echo "Combined DateTime: " . $dateTimeString . "\n";
            echo "Parsed DateTime: " . $interviewDateTime->format('Y-m-d H:i:s') . "\n";
            echo "Current DateTime: " . $now->format('Y-m-d H:i:s') . "\n";
            echo "Access Allowed: " . ($now->greaterThanOrEqualTo($interviewDateTime) ? 'YES' : 'NO') . "\n";
        } else {
            echo "No assigned students found\n";
        }
    } else {
        echo "Room not found\n";
    }
} catch (\Exception $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
