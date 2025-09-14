<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Scheduled</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 3px; }
        h1 { color: #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, {{ $student->name }}!</h1>
        <p>
            You have been scheduled for an interview by your instructor, <strong>{{ $room->creator->name }}</strong>.
        </p>
        <p>Here are the details:</p>
        <ul>
            <li><strong>Room:</strong> {{ $room->name }}</li>
            <li><strong>Date & Time:</strong> {{$sessionDetails->pivot->interview_date}} at {{$sessionDetails->pivot->interview_time}}</li>
        </ul>
        <p>
            Please be prepared and on time. You can access the interview room using the button below.
        </p>
        <a href="{{ url('/room/' . $room->room_code) }}" class="button" style="color: #ffffff;">Go to Interview Room</a>
        <p>Good luck!</p>
    </div>
</body>
</html>