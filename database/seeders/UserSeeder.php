<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
	/**
	 * Run the database seeds.
	 */
	public function run(): void
	{
		// Upsert admin
		User::updateOrCreate(
			['email' => 'admin@mockmate.com'],
			[
				'name' => 'Admin User',
				'password' => Hash::make('password'),
				'role' => 'admin',
				'email_verified_at' => now(),
			]
		);

		// Upsert instructor
		User::updateOrCreate(
			['email' => 'instructor@mockmate.com'],
			[
				'name' => 'Instructor User',
				'password' => Hash::make('password'),
				'role' => 'instructor',
				'email_verified_at' => now(),
			]
		);

		// Upsert student
		User::updateOrCreate(
			['email' => 'student@mockmatem.com'],
			[
				'name' => 'Student User',
				'password' => Hash::make('password'),
				'role' => 'student',
				'email_verified_at' => now(),
			]
		);
	}
}
