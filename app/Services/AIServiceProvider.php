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

    public function generateInterviewFeedback(string $transcript, int $rating, string $comments = ''): string
    {
        $apiKey = $this->config['api_key'];
        
        if (!$apiKey) {
            throw new \Exception('Google Gemini API key not configured');
        }

        $model = $this->config['model'] ?? 'gemini-1.5-flash';
        
        $prompt = $this->buildInterviewFeedbackPrompt($transcript, $rating, $comments);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->withOptions([
            'verify' => false, // Disable SSL verification for development
        ])->timeout(60)->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.3, // Lower temperature for more consistent feedback
                'maxOutputTokens' => 1000, // Allow longer feedback
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

        return 'Unable to generate AI feedback at this time.';
    }

    private function buildInterviewFeedbackPrompt(string $transcript, int $rating, string $comments = ''): string
    {
        return "You are an expert interview analyst. Please analyze the following interview transcript and provide comprehensive feedback on the interviewee's performance.

INTERVIEW TRANSCRIPT:
{$transcript}

INTERVIEWER RATING: {$rating}/10
INTERVIEWER COMMENTS: {$comments}

Please provide detailed feedback covering:

1. **Communication Skills**: How well did the interviewee communicate their thoughts, ask clarifying questions, and engage in the conversation?

2. **Technical Knowledge**: Based on the discussion, assess the depth and accuracy of their technical understanding.

3. **Problem-Solving Approach**: How did they approach problems or questions? Did they think through solutions systematically?

4. **Professionalism**: Assess their demeanor, confidence, and professional behavior during the interview.

5. **Areas of Strength**: What did the interviewee do well?

6. **Areas for Improvement**: What could they improve on for future interviews?

7. **Overall Assessment**: Provide a balanced summary of their performance and potential.

Please be constructive, specific, and professional in your feedback. Focus on actionable insights that could help the interviewee improve.";
    }

    public function generateFeedbackFromScore(int $rating, string $comments = ''): string
    {
        $apiKey = $this->config['api_key'];
        
        if (!$apiKey) {
            throw new \Exception('Google Gemini API key not configured');
        }

        $model = $this->config['model'] ?? 'gemini-1.5-flash';
        
        $prompt = $this->buildScoreBasedFeedbackPrompt($rating, $comments);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->withOptions([
            'verify' => false, // Disable SSL verification for development
        ])->timeout(60)->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.3, // Lower temperature for more consistent feedback
                'maxOutputTokens' => 1000, // Allow longer feedback
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

        return 'Unable to generate AI feedback at this time.';
    }

    private function buildScoreBasedFeedbackPrompt(int $rating, string $comments = ''): string
    {
        return "You are an expert interview analyst. Based on the interviewer's evaluation, provide comprehensive feedback on the interviewee's performance.

INTERVIEWER EVALUATION:
- Rating: {$rating}/10
- Comments: " . ($comments ?: 'No specific comments provided') . "

Please analyze this evaluation and provide:
1. **Performance Summary**: Overall assessment based on the rating
2. **Strengths**: What the interviewee did well (if rating is 6+)
3. **Areas for Improvement**: Specific areas to focus on (if rating is below 8)
4. **Recommendations**: Actionable advice for future interviews
5. **Next Steps**: Suggested areas to practice or develop

Format your response in a professional, constructive manner that would be helpful for the interviewee's development.";
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
