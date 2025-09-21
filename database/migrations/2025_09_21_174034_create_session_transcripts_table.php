<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('session_transcripts', function (Blueprint $table) {
            $table->id();
            $table->string('session_code');
            $table->unsignedBigInteger('user_id');
            $table->text('text');
            $table->bigInteger('timestamp_microseconds');
            $table->boolean('is_final')->default(false);
            $table->decimal('confidence', 3, 2)->nullable();
            $table->timestamps();

            $table->index(['session_code', 'timestamp_microseconds']);
            $table->index(['session_code', 'user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_transcripts');
    }
};
