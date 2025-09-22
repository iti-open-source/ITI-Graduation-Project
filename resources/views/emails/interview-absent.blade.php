<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Regarding Your Missed Interview</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; }
        .header { font-size: 24px; font-weight: bold; color: #dd6b20; margin-bottom: 20px; } /* Orange for attention */
        .info-box { background-color: #fff; padding: 15px; border-left: 4px solid #dd6b20; margin: 20px 0; }
        .important { font-weight: bold; }
        .footer { margin-top: 25px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <p class="header">Regarding Your Missed Interview</p>
        <p>Hello, {{ $student->name }},</p>
        <p>
            Our records indicate that you were absent for your scheduled interview session with your instructor, <strong>{{ $room->creator->name }}</strong>.
        </p>
        <div class="info-box">
            <strong>Missed Interview Details:</strong><br>
            <strong>Room Name:</strong> {{ $room->name }}<br>
            <strong>Scheduled For:</strong> {{ $sessionDetails ? $sessionDetails->pivot->interview_date . ' at ' . $sessionDetails->pivot->interview_time : 'Not specified' }}<br>
        </div>
        <p>
            We understand that unforeseen circumstances can arise. <span class="important">It is important that you contact your instructor as soon as possible</span> to provide an explanation and discuss any potential next steps.
        </p>
        <p>Sincerely,<br>The {{ config('app.name') }} Team</p>
        <p class="footer">This is an automated notification. Please do not reply to this email.</p>
    </div>
</body>
</html>