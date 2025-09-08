import React, { useEffect, useMemo, useRef, useState } from "react";

interface TerminalProps {
  output: string;
  isWaitingForInput: boolean;
  userInputs: string[];
  onInput: (input: string) => void;
  onClear: () => void;
}

interface TerminalLine {
  type: "output" | "input" | "error";
  content: string;
}

export default function Terminal({
  output,
  isWaitingForInput,
  userInputs,
  onInput,
  onClear,
}: TerminalProps) {
  const [currentInput, setCurrentInput] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lines = useMemo(() => {
    const allLines: TerminalLine[] = [];

    if (output) {
      const outputLines = output
        .split("\n")
        .filter(Boolean)
        .map(
          (line): TerminalLine => ({
            type: line.toLowerCase().includes("error:") ? "error" : "output",
            content: line,
          }),
        );
      allLines.push(...outputLines);
    }

    if (userInputs && userInputs.length > 0) {
      const inputLines = userInputs.map(
        (input): TerminalLine => ({
          type: "input",
          content: `> ${input}`,
        }),
      );
      allLines.push(...inputLines);
    }

    return allLines;
  }, [output, userInputs]);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when waiting for input
  useEffect(() => {
    if (isWaitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isWaitingForInput]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Send input to parent (will be added to shared state)
      onInput(currentInput);
      setCurrentInput("");
    }
  };

  const handleClear = () => {
    onClear();
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-500";
      case "input":
        return "text-green-500";
      case "output":
      default:
        return "text-[var(--color-text)]";
    }
  };

  return (
    <div className="flex h-84 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3"
              />
            </svg>
          </div>
          <span className="font-medium text-[var(--color-text)]">Terminal</span>
        </div>
        <button
          onClick={handleClear}
          className="rounded-lg px-3 py-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-card-bg)] hover:text-[var(--color-text)]"
        >
          Clear
        </button>
      </div>

      {/* Terminal Content */}
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {lines.length === 0 && (
          <div className="flex items-center gap-2 text-gray-800 dark:text-gray-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Ready to execute code...
          </div>
        )}

        {lines.map((line, index) => (
          <div key={index} className={`mb-1 ${getLineColor(line.type)}`}>
            {line.content}
          </div>
        ))}

        {/* Input Prompt */}
        {isWaitingForInput && (
          <div className="mt-3 flex items-center rounded-lg bg-[var(--color-muted)] p-2">
            <label htmlFor="terminal-input" className="mr-2 font-bold text-green-500">
              $
            </label>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-none bg-transparent text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
              placeholder="Enter input and press Enter..."
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isWaitingForInput ? "bg-yellow-500" : "bg-green-500"}`}
          />
          <span className="text-xs text-[var(--color-text-secondary)]">
            {isWaitingForInput ? "Waiting for input..." : "Ready"}
          </span>
        </div>
      </div>
    </div>
  );
}
