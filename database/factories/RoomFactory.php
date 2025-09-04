<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true) . ' Interview Room',
            'room_code' => strtoupper($this->faker->bothify('??######')),
            'created_by' => \App\Models\User::factory(),
            'is_active' => true,
            'last_activity' => now(),
        ];
    }
}
