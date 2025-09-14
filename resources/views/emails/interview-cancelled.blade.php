<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Interview Cancellation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; }
        .header { font-size: 24px; font-weight: bold; color: #e53e3e; margin-bottom: 20px; } /* Red color for cancellation */
        .info-box { background-color: #fff; padding: 15px; border-left: 4px solid #e53e3e; margin: 20px 0; }
        .footer { margin-top: 25px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <p class="header">Interview Cancellation Notice</p>
        <p>Hello, {{ $student->name }},</p>
        <p>
            Please be advised that your upcoming interview has been cancelled by your instructor, <strong>{{ $room->creator->name }}</strong>.
        </p>
        <div class="info-box">
            <strong>Cancelled Interview Details:</strong><br>
            <strong>Room Name:</strong> {{ $room->name }}<br>
            <strong>Originally Scheduled For:</strong> {{ $sessionDetails ? $sessionDetails->pivot->interview_date . ' at ' . $sessionDetails->pivot->interview_time : 'Not specified' }}
        </div>
        <p>
            Your instructor will provide more information regarding rescheduling at a later time. We apologize for any inconvenience this may cause.
        </p>
        <p class="footer">If you have urgent questions, please contact your instructor directly.</p>
    </div>
</body>
</html>