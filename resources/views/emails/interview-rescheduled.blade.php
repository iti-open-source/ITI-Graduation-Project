<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Interview Details Updated</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; }
        .header { font-size: 24px; font-weight: bold; color: #dd6b20; margin-bottom: 20px; } /* Orange color for update */
        .update-box { background-color: #fff; padding: 20px; border-left: 4px solid #dd6b20; margin: 20px 0; }
        .update-box .old-time { color: #e53e3e; text-decoration: line-through; }
        .update-box .new-time { color: #38a169; font-weight: bold; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3490dc; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { margin-top: 25px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <p class="header">Important: Your Interview Time Has Changed</p>
        <p>Hello, {{ $student->name }},</p>
        <p>
            The date and/or time for your interview with <strong>{{ $room->creator->name }}</strong> has been updated. Please review the changes below.
        </p>
        <div class="update-box">
            <strong>Room Name:</strong> {{ $room->name }}<br><br>
            <span class="old-time"><strong>Previous Time:</strong> {{ $oldSessionDetails ? $oldSessionDetails->pivot->interview_date . ' at ' . $oldSessionDetails->pivot->interview_time : 'N/A' }}</span><br>
            <span class="new-time"><strong>New Time:</strong> {{ $newSessionDetails ? $newSessionDetails->pivot->interview_date . ' at ' . $newSessionDetails->pivot->interview_time : 'Not specified' }}</span>
        </div>
        <p>
            Please update your calendar with the new time. The link to the interview room remains the same.
        </p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{{ url('/room/' . $room->room_code) }}" class="button" style="color: #ffffff;">Go to Interview Room</a>
        </p>
        <p class="footer">If you have any questions, please contact your instructor.</p>
    </div>
</body>
</html>