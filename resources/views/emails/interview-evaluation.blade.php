<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your Interview Evaluation is Ready</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; }
        .header { font-size: 24px; font-weight: bold; color: #3490dc; margin-bottom: 20px; } /* Blue for information */
        .evaluation-box { background-color: #ffffff; padding: 25px; border: 1px solid #e0e0e0; border-radius: 5px; margin: 25px 0; }
        .rating { font-size: 28px; font-weight: bold; color: #2d3748; text-align: center; margin-bottom: 20px; }
        .feedback-label { font-weight: bold; color: #2d3748; margin-bottom: 10px; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px;}
        .feedback-content { background-color: #f7fafc; border-left: 4px solid #3490dc; padding: 15px; margin-top: 10px; }
        .footer { margin-top: 25px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <p class="header">Your Interview Evaluation is Ready</p>
        <p>Hello, {{ $student->name }},</p>
        <p>
            The evaluation for your interview with <strong>{{ $room->creator->name }}</strong> is now available. Thank you for your participation and effort during the session.
        </p>

        <div class="evaluation-box">
            <p class="rating">Overall Rating: {{ $rating }}/10</p>
            <p class="feedback-label">Instructor's Feedback:</p>
            <div class="feedback-content">
                @if($feedback)
                    <p style="margin: 0;"><em>"{!! nl2br(e($feedback)) !!}"</em></p>
                @else
                    <p>No feedback provided.</p>
                @endif
            </div>
            @if(isset($aiFeedback) && $aiFeedback)
                <p class="feedback-label" style="margin-top: 16px;">AI Feedback:</p>
                <div class="feedback-content">
                    {{-- Render markdown minimally: support line breaks; email-safe --}}
                    {!! nl2br(e($aiFeedback)) !!}
                </div>
            @endif
        </div>

        <p>
            We hope you find this feedback valuable for your continued growth and professional development.
        </p>
        <p>Best regards,<br>The {{ config('app.name') }} Team</p>
        <p class="footer">This evaluation reflects the perspective of the instructor for the session held on {{$sessionDetails->pivot->interview_date}} at {{$sessionDetails->pivot->interview_time}}.</p>
    </div>
</body>
</html>