import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
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
    <div className="flex h-full flex-col bg-[var(--color-card-bg)]">
      {/* Chat Header with Clear Button */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowQuestionForm(true)}
            variant="secondary"
            size="sm"
            className="h-8 text-xs"
          >
            <BookOpen className="h-3 w-3" />
            Generate Questions
          </Button>
          <Button
            onClick={() => {
              setQuestionRequest((prev) => ({ ...prev, type: "leetcode" }));
              setShowQuestionForm(true);
            }}
            variant="secondary"
            size="sm"
            className="h-8 text-xs"
          >
            <Code className="h-3 w-3" />
            LeetCode Problems
          </Button>
        </div>
        {messages.length > 0 && (
          <Button
            onClick={() => setShowClearDialog(true)}
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-3 w-3" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoadingHistory ? (
          <div className="text-center text-[var(--color-text-secondary)]">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-sm">Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[var(--color-text-secondary)]">
            <Bot className="mx-auto mb-4 h-12 w-12" />
            <p className="text-sm">Ask me anything about the interview!</p>
            <p className="mt-1 text-xs">
              I can help with questions, provide guidance, or suggest topics to discuss.
            </p>

            {/* Configuration Help */}
            {!isLoadingProvider && provider && !provider.configured && (
              <Card className="mt-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900">
                <CardHeader>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Google Gemini Not Configured
                  </h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
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
                      <code className="rounded bg-yellow-100 px-1">
                        GEMINI_API_KEY=your_key_here
                      </code>{" "}
                      to your .env file
                    </li>
                    <li>Restart your application</li>
                  </ol>
                  <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                    Contact your administrator to configure the API key.
                  </p>
                </CardHeader>
              </Card>
            )}
          </div>
        ) : null}

        {messages.map((message) => {
          return (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-xs lg:max-w-2xl ${
                  message.role === "user"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)]"
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    {message.role === "assistant" && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                        <Bot className="h-3 w-3" />
                      </div>
                    )}
                    {message.role === "user" && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
                        <User className="h-3 w-3" />
                      </div>
                    )}
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
                                      className="rounded bg-[var(--color-muted)] px-1 py-0.5 text-sm"
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
                                <blockquote className="border-l-4 border-[var(--color-border)] pl-4 break-words italic">
                                  {children}
                                </blockquote>
                              ),
                              // Custom styling for tables
                              table: ({ children }) => (
                                <div className="w-full">
                                  <table className="w-full table-fixed border-collapse border border-[var(--color-border)]">
                                    {children}
                                  </table>
                                </div>
                              ),
                              th: ({ children }) => (
                                <th className="border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-1 text-left break-words">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="border border-[var(--color-border)] px-2 py-1 break-words">
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
                              <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-[var(--color-text-secondary)]"></span>
                            )}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p
                        className={`mt-1 text-xs ${message.role === "user" ? "opacity-70" : "text-[var(--color-text-secondary)]"}`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}

        {isLoading && messages.length > 0 && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[var(--color-text)]">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Question Generation Form */}
      {showQuestionForm && !isLoading && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-[var(--color-text)]">
              {questionRequest.type === "interview"
                ? "Generate Interview Questions"
                : "Get LeetCode Problems"}
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Specify the topic and difficulty level
            </p>
          </div>

          <div className="space-y-3">
            {/* Question Type */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-text)]">
                Type
              </label>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setQuestionRequest((prev) => ({ ...prev, type: "interview" }))}
                  variant={questionRequest.type === "interview" ? "default" : "secondary"}
                  size="sm"
                  className="text-xs"
                >
                  Interview Questions
                </Button>
                <Button
                  onClick={() => setQuestionRequest((prev) => ({ ...prev, type: "leetcode" }))}
                  variant={questionRequest.type === "leetcode" ? "default" : "secondary"}
                  size="sm"
                  className="text-xs"
                >
                  LeetCode Problems
                </Button>
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-text)]">
                Topic
              </label>
              <Input
                type="text"
                value={questionRequest.topic}
                onChange={(e) => setQuestionRequest((prev) => ({ ...prev, topic: e.target.value }))}
                placeholder="e.g., React, JavaScript, Data Structures, Algorithms..."
                className="text-sm"
              />
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-text)]">
                Difficulty Level
              </label>
              <div className="flex space-x-2">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <Button
                    key={level}
                    onClick={() => setQuestionRequest((prev) => ({ ...prev, difficulty: level }))}
                    variant={questionRequest.difficulty === level ? "default" : "secondary"}
                    size="sm"
                    className={`text-xs capitalize ${
                      questionRequest.difficulty === level
                        ? level === "easy"
                          ? "bg-green-500 hover:bg-green-600"
                          : level === "medium"
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-red-500 hover:bg-red-600"
                        : ""
                    }`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={generateQuestions}
                disabled={!questionRequest.topic.trim() || isLoading}
                className="flex-1 text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  `Generate ${questionRequest.type === "interview" ? "Questions" : "Problems"}`
                )}
              </Button>
              <Button
                onClick={() => setShowQuestionForm(false)}
                variant="secondary"
                className="text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[var(--color-border)] p-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about interview questions, topics, or guidance..."
            className="text-sm"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading} className="px-4">
            <Send className="h-4 w-4" />
          </Button>
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
