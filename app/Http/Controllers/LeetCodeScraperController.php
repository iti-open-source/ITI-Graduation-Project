<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LeetCodeScraperController extends Controller
{
    public function fetchProblem(string $titleSlug)
    {
        $url = 'https://leetcode.com/graphql/';

        // This is the standard GraphQL query LeetCode uses to fetch a problem.
        $payload = [
            'operationName' => 'questionDetail',
            'variables' => [
                'titleSlug' => $titleSlug,
            ],
            'query' => 'query questionDetail($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    questionId
                    title
                    content
                    difficulty
                    stats
                    exampleTestcaseList
                    codeSnippets {
                        lang
                        langSlug
                        code
                    }
                }
            }',
        ];

        $response = Http::withHeaders([
            'User-Agent' => 'MockMate',
            'Referer' => "https://leetcode.com/problems/{$titleSlug}/",
        ])->post($url, $payload);

        if ($response->failed()) {
            Log::error('Failed to fetch LeetCode problem.', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => 'Could not fetch data from LeetCode.'], 500);
        }

        $data = $response->json('data.question');

        if (!$data) {
            return response()->json(['error' => 'Problem not found or invalid response.'], 404);
        }

        return response()->json([
            'title' => $data['title'],
            'content' => $data['content'], // The description is in HTML format
        ]);
    }
}
