import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { BookOpen, Bot, Code, Loader2, Send, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  roomCode: string;
  isCreator: boolean;
}

interface AIProvider {
  name: string;
  description: string;
  free: boolean;
  configured: boolean;
}

interface QuestionRequest {
  type: "interview" | "leetcode";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function AIChatbot({ roomCode, isCreator }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [provider, setProvider] = useState<AIProvider | null>(null);
  const [isLoadingProvider, setIsLoadingProvider] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionRequest, setQuestionRequest] = useState<QuestionRequest>({
    type: "interview",
    topic: "",
    difficulty: "medium",
  });
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only show for creators (interviewers)
  if (!isCreator) {
    return null;
  }

  const scrollToBottom = () => {
    // Only scroll if not currently loading to prevent interference
    if (!isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Disable auto-scroll during streaming to prevent interference with manual scrolling
  // This prevents the frequent state updates from causing scroll interference

  // Auto-scroll disabled - users can manually scroll
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages, isLoading]);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/ai-chat/${roomCode}/history`, {
          headers: {
            "X-CSRF-TOKEN":
              document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [roomCode]);

  // Load AI provider info on mount
  useEffect(() => {
    const loadProvider = async () => {
      try {
        const response = await fetch("/api/ai-chat/provider", {
          headers: {
            "X-CSRF-TOKEN":
              document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProvider(data.provider);
        }
      } catch (error) {
        console.error("Error loading AI provider:", error);
      } finally {
        setIsLoadingProvider(false);
      }
    };

    loadProvider();
  }, []);

  const generateQuestions = async () => {
    if (!questionRequest.topic.trim()) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Generate ${questionRequest.type === "interview" ? "interview questions" : "LeetCode problem recommendations"} for topic: "${questionRequest.topic}" with ${questionRequest.difficulty} difficulty level.`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Create a placeholder for the streaming response
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch(`/api/ai-chat/${roomCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN":
            document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10),
          stream: true, // Enable streaming
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "chunk") {
                // Break down the chunk into smaller pieces for better streaming effect
                const words = data.content.split(" ");

                for (let i = 0; i < words.length; i++) {
                  const word = words[i] + (i < words.length - 1 ? " " : "");

                  // Update the message with the current word
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId ? { ...msg, content: msg.content + word } : msg,
                    ),
                  );

                  // Add delay between words for typing effect
                  await new Promise((resolve) => setTimeout(resolve, 50));
                }
              } else if (data.type === "done") {
                // Streaming is complete
                break;
              } else if (data.type === "error") {
                // Handle error
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, content: data.content } : msg,
                  ),
                );
                break;
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }

      setShowQuestionForm(false);
      setQuestionRequest({ type: "interview", topic: "", difficulty: "medium" });
    } catch (error) {
      console.error("Error generating questions:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "Sorry, I encountered an error generating questions. Please try again.",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    setIsClearing(true);
    try {
      const response = await fetch(`/api/ai-chat/${roomCode}/clear`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN":
            document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
      });

      if (response.ok) {
        setMessages([]);
        setShowClearDialog(false);
      } else {
        console.error("Failed to clear chat");
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create a placeholder for the streaming response
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch(`/api/ai-chat/${roomCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN":
            document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10), // Send last 10 messages for context
          stream: true, // Enable streaming
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "chunk") {
                // Break down the chunk into smaller pieces for better streaming effect
                const words = data.content.split(" ");

                for (let i = 0; i < words.length; i++) {
                  const word = words[i] + (i < words.length - 1 ? " " : "");

                  // Update the message with the current word
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId ? { ...msg, content: msg.content + word } : msg,
                    ),
                  );

                  // Add delay between words for typing effect
                  await new Promise((resolve) => setTimeout(resolve, 50));
                }
              } else if (data.type === "done") {
                // Streaming is complete
                break;
              } else if (data.type === "error") {
                // Handle error
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, content: data.content } : msg,
                  ),
                );
                break;
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              AI Interview Assistant
            </h3>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Get help with interview questions and guidance
        </p>

        {/* Quick Action Buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setShowQuestionForm(true)}
            className="flex items-center space-x-1 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
          >
            <BookOpen className="h-3 w-3" />
            <span>Generate Questions</span>
          </button>
          <button
            onClick={() => {
              setQuestionRequest((prev) => ({ ...prev, type: "leetcode" }));
              setShowQuestionForm(true);
            }}
            className="flex items-center space-x-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
          >
            <Code className="h-3 w-3" />
            <span>LeetCode Problems</span>
          </button>
        </div>
      </div>

      {/* Chat Header with Clear Button */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Assistant</h3>
        {messages.length > 0 && (
          <button
            onClick={() => setShowClearDialog(true)}
            className="flex items-center space-x-1 text-xs text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Clear chat history"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoadingHistory ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-300" />
            <p className="text-sm">Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Bot className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-sm">Ask me anything about the interview!</p>
            <p className="mt-1 text-xs">
              I can help with questions, provide guidance, or suggest topics to discuss.
            </p>

            {/* Configuration Help */}
            {!isLoadingProvider && provider && !provider.configured && (
              <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-left dark:border-yellow-800 dark:bg-yellow-900">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Google Gemini Not Configured
                </h4>
                <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                  To use the AI assistant, you need to configure Google Gemini:
                </p>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
                  <li>
                    Get a free API key from{" "}
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Google AI Studio
                    </a>
                  </li>
                  <li>
                    Add{" "}
                    <code className="rounded bg-yellow-100 px-1">GEMINI_API_KEY=your_key_here</code>{" "}
                    to your .env file
                  </li>
                  <li>Restart your application</li>
                </ol>
                <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                  Contact your administrator to configure the API key.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {messages.map((message) => {
          return (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-2xl ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === "assistant" && <Bot className="mt-0.5 h-4 w-4 flex-shrink-0" />}
                  {message.role === "user" && <User className="mt-0.5 h-4 w-4 flex-shrink-0" />}
                  <div className="flex-1">
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm break-words">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Custom styling for code blocks
                            code: ({ node, inline, className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || "");
                              const language = match ? match[1] : "";

                              if (inline) {
                                return (
                                  <code
                                    className="rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }

                              return (
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={language}
                                  PreTag="div"
                                  className="rounded-lg"
                                  customStyle={{
                                    margin: 0,
                                    background: "var(--color-card-bg)",
                                    whiteSpace: "pre-wrap",
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                  wrapLines={true}
                                  wrapLongLines={true}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              );
                            },
                            // Custom styling for lists
                            ul: ({ children }) => (
                              <ul className="list-inside list-disc space-y-1">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-inside list-decimal space-y-1">{children}</ol>
                            ),
                            // Custom styling for headings
                            h1: ({ children }) => (
                              <h1 className="mb-2 text-lg font-bold break-words">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="mb-2 text-base font-semibold break-words">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="mb-1 text-sm font-medium break-words">{children}</h3>
                            ),
                            // Custom styling for paragraphs
                            p: ({ children }) => (
                              <p className="overflow-wrap-anywhere mb-2 break-words last:mb-0">
                                {children}
                              </p>
                            ),
                            // Custom styling for blockquotes
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-gray-300 pl-4 break-words italic dark:border-gray-600">
                                {children}
                              </blockquote>
                            ),
                            // Custom styling for tables
                            table: ({ children }) => (
                              <div className="w-full">
                                <table className="w-full table-fixed border-collapse border border-gray-300 dark:border-gray-600">
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th className="border border-gray-300 bg-gray-100 px-2 py-1 text-left break-words dark:border-gray-600 dark:bg-gray-800">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border border-gray-300 px-2 py-1 break-words dark:border-gray-600">
                                {children}
                              </td>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        {isLoading &&
                          message.id === messages[messages.length - 1]?.id &&
                          message.content === "" && (
                            <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-gray-400"></span>
                          )}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && messages.length > 0 && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-700">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Question Generation Form */}
      {showQuestionForm && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {questionRequest.type === "interview"
                ? "Generate Interview Questions"
                : "Get LeetCode Problems"}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Specify the topic and difficulty level
            </p>
          </div>

          <div className="space-y-3">
            {/* Question Type */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setQuestionRequest((prev) => ({ ...prev, type: "interview" }))}
                  className={`rounded-lg px-3 py-1.5 text-xs ${
                    questionRequest.type === "interview"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  Interview Questions
                </button>
                <button
                  onClick={() => setQuestionRequest((prev) => ({ ...prev, type: "leetcode" }))}
                  className={`rounded-lg px-3 py-1.5 text-xs ${
                    questionRequest.type === "leetcode"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  LeetCode Problems
                </button>
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Topic
              </label>
              <input
                type="text"
                value={questionRequest.topic}
                onChange={(e) => setQuestionRequest((prev) => ({ ...prev, topic: e.target.value }))}
                placeholder="e.g., React, JavaScript, Data Structures, Algorithms..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              />
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Difficulty Level
              </label>
              <div className="flex space-x-2">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setQuestionRequest((prev) => ({ ...prev, difficulty: level }))}
                    className={`rounded-lg px-3 py-1.5 text-xs capitalize ${
                      questionRequest.difficulty === level
                        ? level === "easy"
                          ? "bg-green-500 text-white"
                          : level === "medium"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={generateQuestions}
                disabled={!questionRequest.topic.trim() || isLoading}
                className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-600"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  `Generate ${questionRequest.type === "interview" ? "Questions" : "Problems"}`
                )}
              </button>
              <button
                onClick={() => setShowQuestionForm(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about interview questions, topics, or guidance..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-600"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Clear Chat Confirmation Dialog */}
      <ConfirmationDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={clearChat}
        title="Clear Chat History"
        description="Are you sure you want to clear the chat history? This action cannot be undone and will permanently delete all messages in this conversation."
        confirmText="Clear Chat"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isClearing}
      />
    </div>
  );
}
