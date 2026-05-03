<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function successResponse(string $message, mixed $data = null, int $status = 200, array $meta = []): \Illuminate\Http\JsonResponse
    {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    protected function errorResponse(string $message, int $status, mixed $errors = null): \Illuminate\Http\JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
