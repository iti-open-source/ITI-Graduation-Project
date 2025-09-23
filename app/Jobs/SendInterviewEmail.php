<?php

namespace App\Jobs;

use App\Models\Room;
use App\Models\User;
use App\Mail\InterviewScheduled;
use App\Mail\InterviewCancelled;
use App\Mail\InterviewRescheduled;
use App\Mail\InterviewCompleted;
use App\Mail\InterviewAbsent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendInterviewEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $emailType,
        public Room $room,
        public User $student,
        public mixed $sessionDetails,
        public mixed $oldSessionDetails = null
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            switch ($this->emailType) {
                case 'scheduled':
                    Mail::to($this->student->email)->send(new InterviewScheduled(
                        $this->room,
                        $this->student,
                        $this->sessionDetails
                    ));
                    break;

                case 'cancelled':
                    Mail::to($this->student->email)->send(new InterviewCancelled(
                        $this->room,
                        $this->student,
                        $this->sessionDetails
                    ));
                    break;

                case 'rescheduled':
                    Mail::to($this->student->email)->send(new InterviewRescheduled(
                        $this->room,
                        $this->student,
                        $this->oldSessionDetails,
                        $this->sessionDetails
                    ));
                    break;

                case 'completed':
                    Mail::to($this->student->email)->send(new InterviewCompleted(
                        $this->room,
                        $this->student,
                        $this->sessionDetails
                    ));
                    break;

                case 'absent':
                    Mail::to($this->student->email)->send(new InterviewAbsent(
                        $this->room,
                        $this->student,
                        $this->sessionDetails
                    ));
                    break;

                default:
                    Log::warning("Unknown email type: {$this->emailType}");
                    break;
            }
        } catch (\Throwable $e) {
            Log::error("Failed to send {$this->emailType} email to {$this->student->email}: " . $e->getMessage());
            throw $e; // Re-throw to trigger job retry
        }
    }
}
