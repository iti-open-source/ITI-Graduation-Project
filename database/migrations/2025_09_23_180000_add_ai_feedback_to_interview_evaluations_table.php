<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interview_evaluations', function (Blueprint $table) {
            $table->longText('ai_feedback')->nullable()->after('comments');
        });
    }

    public function down(): void
    {
        Schema::table('interview_evaluations', function (Blueprint $table) {
            $table->dropColumn('ai_feedback');
        });
    }
};


