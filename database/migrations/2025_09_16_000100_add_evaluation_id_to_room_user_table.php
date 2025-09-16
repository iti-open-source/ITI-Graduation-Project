<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('room_user', function (Blueprint $table) {
            $table->unsignedBigInteger('evaluation_id')->nullable()->after('is_absent');
            $table->foreign('evaluation_id')->references('id')->on('interview_evaluations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('room_user', function (Blueprint $table) {
            $table->dropForeign(['evaluation_id']);
            $table->dropColumn('evaluation_id');
        });
    }
};


