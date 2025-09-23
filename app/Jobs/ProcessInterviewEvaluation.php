<?php

namespace App\Jobs;

use App\Models\InterviewEvaluation;
use App\Models\LobbySession;
use App\Models\User;
use App\Models\Room;
use App\Services\AIServiceProvider;
use App\Mail\InterviewEvaluation as InterviewEvaluationMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProcessInterviewEvaluation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public InterviewEvaluation $evaluation,
        public LobbySession $session,
        public int $rating,
        public ?string $comments
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Generate AI feedback using centralized AI service
        try {
            $interviewee = User::find($this->session->guest_id);
            $evaluator = User::find($this->evaluation->created_by);
            $room = Room::find($this->session->room_id);

            $ai = new AIServiceProvider();
            $aiFeedback = $ai->generateInterviewFeedback(
                $this->rating,
                $this->comments,
                [
                    'candidate_name' => $interviewee?->name,
                    'evaluator_name' => $evaluator?->name,
                    'room_title' => $room?->title,
                ]
            );

            if (is_string($aiFeedback) && $aiFeedback !== '') {
                $this->evaluation->ai_feedback = $aiFeedback;
                $this->evaluation->save();
            }
        } catch (\Throwable $e) {
            // Log and continue without blocking evaluation submission
            Log::warning('AI feedback generation failed: ' . $e->getMessage());
        }

        // Send evaluation email to the interviewee
        try {
            $interviewee = User::find($this->session->guest_id);
            $evaluationRoom = Room::find($this->session->room_id);

            if ($interviewee && $evaluationRoom) {
                $sessionDetails = $evaluationRoom->assignedStudents()
                    ->where('users.id', $interviewee->id)
                    ->withPivot('interview_date', 'interview_time')
                    ->first();

                if ($sessionDetails) {
                    Mail::to($interviewee->email)->send(new InterviewEvaluationMail(
                        $evaluationRoom,
                        $interviewee,
                        $sessionDetails,
                        $this->rating,
                        $this->comments ?? '',
                        $this->evaluation->fresh()->ai_feedback ?? null,
                    ));
                }
            }
        } catch (\Throwable $e) {
            Log::error('Failed to send evaluation email: ' . $e->getMessage());
        }
    }
}
