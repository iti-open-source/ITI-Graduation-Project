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
        return "text-red-400";
      case "input":
        return "text-green-400";
      case "output":
      default:
        return "text-gray-200";
    }
  };

  return (
    <div className="flex h-84 flex-col rounded-lg border border-gray-700 bg-gray-900">
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
        <span className="text-sm text-gray-400">Terminal</span>
        <button
          onClick={handleClear}
          className="rounded px-2 py-1 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          Clear
        </button>
      </div>

      {/* Terminal Content */}
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {lines.length === 0 && <div className="text-gray-500">Ready to execute code...</div>}

        {lines.map((line, index) => (
          <div key={index} className={`mb-1 ${getLineColor(line.type)}`}>
            {line.content}
          </div>
        ))}

        {/* Input Prompt */}
        {isWaitingForInput && (
          <div className="mt-2 flex items-center">
            <label htmlFor="terminal-input" className="mr-2 text-green-400">
              $
            </label>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-none bg-transparent text-gray-200 outline-none"
              placeholder="Enter input..."
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-700 bg-gray-800 px-4 py-1 text-xs text-gray-400">
        {isWaitingForInput ? "Waiting for input..." : "Ready"}
      </div>
    </div>
  );
}
