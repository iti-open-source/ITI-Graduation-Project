<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Interview Completed</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; }
        .header { font-size: 24px; font-weight: bold; color: #38a169; margin-bottom: 20px; } /* Green color for completion */
        .info-box { background-color: #fff; padding: 15px; border-left: 4px solid #38a169; margin: 20px 0; }
        .footer { margin-top: 25px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <p class="header">Thank You, {{ $student->name }}!</p>
        <p>
            This email confirms that you have successfully completed your interview with <strong>{{ $room->creator->name }}</strong>.
        </p>
        <p>
            We appreciate you taking the time to meet with us.
        </p>
        <div class="info-box">
            <strong>Interview Details:</strong><br>
            <strong>Room Name:</strong> {{ $room->name }}<br>
            <strong>Scheduled For:</strong> {{ $sessionDetails ? $sessionDetails->pivot->interview_date . ' at ' . $sessionDetails->pivot->interview_time : 'Not specified' }}<br>
            <strong>Completed On:</strong> {{ now()->format('F j, Y, g:i A T') }}
        </div>
        <p>
            <strong>Next Steps:</strong> If your instructor has any feedback, you can find them in your dashboard.
        </p>
        <p>Best regards,<br>The {{ config('app.name') }} Team</p>
        <p class="footer">This is an automated notification. Please do not reply to this email.</p>
    </div>
</body>
</html>