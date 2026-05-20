<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register_successfully(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validRegistrationPayload());

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Registration successful.')
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'student_id', 'phone', 'profile_photo_path'],
                    'token',
                    'token_type',
                ],
            ])
            ->assertJsonMissingPath('data.user.password');

        $this->assertDatabaseHas('users', [
            'email' => 'student@example.edu',
            'student_id' => 'STU-1001',
        ]);

        $this->assertTrue(Hash::check('Password1', User::firstOrFail()->password));
    }

    public function test_registration_returns_validation_errors(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'A',
            'email' => 'not-an-email',
            'student_id' => 'ab',
            'password' => 'weak',
            'password_confirmation' => 'different',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'student_id', 'password']);
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'student@example.edu',
        ]);

        $response = $this->postJson('/api/auth/register', $this->validRegistrationPayload([
            'student_id' => 'STU-2002',
        ]));

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_rejects_duplicate_student_id(): void
    {
        User::factory()->create([
            'student_id' => 'STU-1001',
        ]);

        $response = $this->postJson('/api/auth/register', $this->validRegistrationPayload([
            'email' => 'another@example.edu',
        ]));

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['student_id']);
    }

    public function test_student_can_login_successfully(): void
    {
        User::factory()->create([
            'email' => 'student@example.edu',
            'password' => Hash::make('Password1'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'student@example.edu',
            'password' => 'Password1',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Login successful.')
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonStructure(['data' => ['user', 'token']]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'student@example.edu',
            'password' => Hash::make('Password1'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'student@example.edu',
            'password' => 'WrongPassword1',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_student_can_fetch_profile(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.user.email', $user->email);
    }

    public function test_unauthenticated_profile_request_returns_401(): void
    {
        $this->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    public function test_student_can_logout_successfully(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Logout successful.');

        $this->assertSame(0, PersonalAccessToken::count());
    }

    private function validRegistrationPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Student One',
            'email' => 'student@example.edu',
            'student_id' => 'STU-1001',
            'phone' => '+251911111111',
            'profile_photo_path' => null,
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ], $overrides);
    }
}
