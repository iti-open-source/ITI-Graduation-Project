<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIServiceProvider
{
    private string $provider;
    private array $config;

    public function __construct()
    {
        $this->provider = 'gemini';
        $this->config = config('ai.providers.gemini', []);
    }

    public function chat(string $message, array $history = []): string
    {
        return $this->geminiChat($message, $history);
    }

    public function chatStream(string $message, array $history = []): \Generator
    {
        return $this->geminiChatStream($message, $history);
    }


    private function geminiChat(string $message, array $history = []): string
    {
        $apiKey = $this->config['api_key'];
        
        if (!$apiKey) {
            throw new \Exception('Google Gemini API key not configured');
        }

        $model = $this->config['model'] ?? 'gemini-1.5-flash';
        
        // Build the conversation context for Gemini
        $prompt = $this->buildGeminiPrompt($message, $history);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->withOptions([
            'verify' => false, // Disable SSL verification for development
        ])->timeout(30)->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => $this->config['temperature'] ?? 0.7,
                'maxOutputTokens' => $this->config['max_tokens'] ?? 500,
                'topP' => 0.8,
                'topK' => 10,
            ]
        ]);

        if (!$response->successful()) {
            throw new \Exception('Google Gemini API request failed: ' . $response->body());
        }

        $data = $response->json();
        
        if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            return $data['candidates'][0]['content']['parts'][0]['text'];
        }

        return 'I apologize, but I couldn\'t generate a response.';
    }

    private function geminiChatStream(string $message, array $history = []): \Generator
    {
        $apiKey = $this->config['api_key'];
        
        if (!$apiKey) {
            throw new \Exception('Google Gemini API key not configured');
        }

        $model = $this->config['model'] ?? 'gemini-1.5-flash';
        
        // Build the conversation context for Gemini
        $prompt = $this->buildGeminiPrompt($message, $history);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->withOptions([
            'verify' => false, // Disable SSL verification for development
        ])->timeout(60)->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:streamGenerateContent?key={$apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => $this->config['temperature'] ?? 0.7,
                'maxOutputTokens' => $this->config['max_tokens'] ?? 500,
                'topP' => 0.8,
                'topK' => 10,
            ]
        ]);

        if (!$response->successful()) {
            throw new \Exception('Google Gemini API request failed: ' . $response->body());
        }

        $body = $response->body();
        
        // Parse the JSON array response
        $data = json_decode($body, true);
        
        if (is_array($data)) {
            foreach ($data as $chunk) {
                if (isset($chunk['candidates'][0]['content']['parts'][0]['text'])) {
                    yield $chunk['candidates'][0]['content']['parts'][0]['text'];
                }
            }
        }
    }

    private function buildGeminiPrompt(string $message, array $history = []): string
    {
        $systemPrompt = "You are an AI assistant helping with technical interviews. You can:
- Suggest relevant technical questions based on the candidate's background
- Provide guidance on interview best practices
- Help evaluate technical concepts and solutions
- Suggest follow-up questions to dig deeper into topics
- Offer tips for conducting effective interviews
- Generate interview questions based on topics and difficulty levels
- Recommend LeetCode problems for coding interviews

When generating interview questions:
- Provide 5-7 well-structured questions for the given topic and difficulty
- Include both conceptual and practical questions
- Vary question types (multiple choice, open-ended, scenario-based)
- Include follow-up questions for deeper discussion
- Provide sample answers or evaluation criteria

When recommending LeetCode problems:
- Return ONLY the problem slugs (e.g., two-sum, valid-parentheses, merge-two-sorted-lists)
- Suggest 3-5 specific problems based on the topic and difficulty
- Format as a simple list of slugs, one per line
- Do not include problem numbers, descriptions, or explanations
- Focus on well-known problems that match the requested topic and difficulty level

Keep responses concise, professional, and focused on interview-related topics. If asked about non-interview topics, politely redirect to interview-related assistance.";
        
        $prompt = "System: {$systemPrompt}\n\n";
        
        // Add recent history
        foreach (array_slice($history, -5) as $msg) {
            $role = $msg['role'] === 'user' ? 'Human' : 'Assistant';
            $prompt .= "{$role}: {$msg['content']}\n";
        }
        
        $prompt .= "Human: {$message}\nAssistant:";
        
        return $prompt;
    }

    public function getProviderInfo(): array
    {
        return [
            'name' => 'Google Gemini',
            'description' => 'Google\'s advanced AI model (free tier available)',
            'free' => true,
            'configured' => !empty($this->config['api_key'])
        ];
    }
}
