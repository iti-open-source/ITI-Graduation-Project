<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_evaluations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lobby_session_id');
            $table->unsignedBigInteger('guest_id');
            $table->unsignedBigInteger('created_by');
            $table->unsignedTinyInteger('rating'); // 1-10
            $table->text('comments')->nullable();
            $table->timestamps();

            $table->foreign('lobby_session_id')->references('id')->on('lobby_sessions')->onDelete('cascade');
            $table->foreign('guest_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_evaluations');
    }
};


