"use client";

import { langs, languageTemplates } from "@/utils/language-templates";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useMutation,
  useRoom,
  useStorage,
} from "@liveblocks/react";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { Editor } from "@monaco-editor/react";
import axios from "axios";
import { editor } from "monaco-editor";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness";
import EditorControls from "./editor-controls";
import Terminal from "./terminal";

// inner component, have to use it because RoomProvider needs to be a parent of useRoom
function CollaborativeEditorInner() {
  const room = useRoom();
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
  const yProvider = getYjsProviderForRoom(room);

  // Use Liveblocks storage for synchronized state
  const output = useStorage((root) => root.terminalOutput) || "";
  const userInputsFromStorage = useStorage((root) => root.userInputs);
  const userInputs = useMemo(() => userInputsFromStorage || [], [userInputsFromStorage]);
  const isWaitingForInput = useStorage((root) => root.isWaitingForInput) || false;
  const language = useStorage((root) => root.selectedLanguage) || "typescript";
  const isExecuting = useStorage((root) => root.isExecuting) || false;

  // Mutations to update shared state
  const updateTerminalOutput = useMutation(({ storage }, output: string) => {
    storage.set("terminalOutput", output);
  }, []);

  const updateUserInputs = useMutation(({ storage }, inputs: string[]) => {
    storage.set("userInputs", inputs);
  }, []);

  const updateWaitingForInput = useMutation(({ storage }, waiting: boolean) => {
    storage.set("isWaitingForInput", waiting);
  }, []);

  const updateLanguage = useMutation(({ storage }, lang: string) => {
    storage.set("selectedLanguage", lang);
  }, []);

  const updateExecuting = useMutation(({ storage }, executing: boolean) => {
    storage.set("isExecuting", executing);
  }, []);

  const handleSubmit = async () => {
    const currentCode = editorRef?.getValue();
    if (!currentCode) {
      updateTerminalOutput("Editor is empty.");
      return;
    }
    try {
      // Check if the code might need input
      const needsInput = /input\(|Scanner|cin\s*>>|Console\.ReadLine|gets\(|scanf\(/i.test(
        currentCode,
      );

      // If code needs input and no inputs provided yet, prompt for input
      if (needsInput && (!userInputs || (userInputs as string[]).length === 0)) {
        updateTerminalOutput(
          'This program requires input. Please provide input in the terminal below and then click "Run with Input".\n',
        );
        updateWaitingForInput(true);
        return;
      }

      // Proceed with execution
      updateTerminalOutput("Executing code...\n");
      updateExecuting(true);
      updateWaitingForInput(false);

      // Submit the code with user inputs if any
      const submissionData: {
        source_code: string;
        language_id: number;
        stdin?: string;
      } = {
        source_code: currentCode,
        language_id: langs[language as string as keyof typeof langs],
      };

      // Add user inputs if available
      if (userInputs && (userInputs as string[]).length > 0) {
        submissionData.stdin = (userInputs as string[]).join("\n");
      }

      const response = await axios.post("https://ce.judge0.com/submissions/", submissionData);
      const token = response.data.token;

      // Poll for result until completion
      const result = await pollForResult(token);
      console.log(result);

      let terminalOutput = "";

      if (result.compile_output) {
        terminalOutput += `Compilation:\n${result.compile_output}\n`;
      }

      if (result.stdout) {
        terminalOutput += `Output:\n${result.stdout}\n`;
      }

      if (result.stderr) {
        terminalOutput += `Error:\n${result.stderr}\n`;
      }

      if (!result.stdout && !result.stderr && !result.compile_output) {
        terminalOutput = "No output";
      }

      updateTerminalOutput(terminalOutput);
      updateExecuting(false);

      // Clear inputs after successful execution
      if (userInputs && (userInputs as string[]).length > 0) {
        updateUserInputs([]);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      updateTerminalOutput(`Error: ${(error as Error).message}\n`);
      updateExecuting(false);
    }
  };

  // New function to run code with fresh inputs
  const handleRunWithInput = async () => {
    // Clear previous inputs and prompt for new ones
    updateUserInputs([]);
    updateTerminalOutput(
      'Previous inputs cleared. Please provide fresh input and then click "Submit".\n',
    );
    updateWaitingForInput(true);
  };

  interface Result {
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    status: { id: number };
  }

  // helper function to poll for results
  const pollForResult = async (token: string, maxAttempts = 30): Promise<Result> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await axios.get(`https://ce.judge0.com/submissions/${token}`);
        const status = result.data.status;

        // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, etc.
        // Check if status is final (not in queue or processing)
        if (status.id !== 1 && status.id !== 2) {
          return result.data; // Return final result
        }

        // Wait before next poll (1 second)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Polling attempt ${attempt} failed:`, error);
        return { stderr: (error as { message: string }).message, status: { id: 6 } };
      }
    }

    throw new Error("Maximum polling attempts reached");
  };

  const handleTerminalInput = (input: string) => {
    const currentInputs = (userInputs as string[]) || [];
    updateUserInputs([...currentInputs, input]);
    updateWaitingForInput(false);
  };

  const handleTerminalClear = () => {
    updateTerminalOutput("");
    updateUserInputs([]);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    updateLanguage(newLanguage);

    const template = languageTemplates[newLanguage as keyof typeof languageTemplates];

    if (template && yProvider) {
      // Get the Yjs shared text document
      const yText = yProvider.getYDoc().getText("monaco");

      yProvider.getYDoc().transact(() => {
        // 1. Delete the entire existing content
        yText.delete(0, yText.length);
        // 2. Insert the new template at the beginning
        yText.insert(0, template);
      });
    }
  };

  // Initialize Liveblocks storage with default values
  useEffect(() => {
    if (output === undefined) {
      updateTerminalOutput("");
    }
    if (userInputsFromStorage === undefined) {
      updateUserInputs([]);
    }
    if (isWaitingForInput === undefined) {
      updateWaitingForInput(false);
    }
    if (language === undefined) {
      updateLanguage("typescript");
    }
    if (isExecuting === undefined) {
      updateExecuting(false);
    }
  }, [
    output,
    userInputsFromStorage,
    isWaitingForInput,
    language,
    isExecuting,
    updateTerminalOutput,
    updateUserInputs,
    updateWaitingForInput,
    updateLanguage,
    updateExecuting,
  ]);

  // Set up Liveblocks Yjs provider and attach Monaco editor
  useEffect(() => {
    let binding: MonacoBinding | null = null;

    if (editorRef) {
      const yDoc = yProvider.getYDoc();
      const yText = yDoc.getText("monaco");
      const model = editorRef.getModel();

      // 1. Create the Monaco binding immediately
      if (model) {
        binding = new MonacoBinding(
          yText,
          model,
          new Set([editorRef]),
          yProvider.awareness as unknown as Awareness,
        );
      }

      // 2. function to handle the initial content logic
      const handleSync = () => {
        // This runs only *after* the document is synced
        if (yText.length === 0) {
          const template = languageTemplates[language as keyof typeof languageTemplates];
          if (template) {
            yText.insert(0, template);
          }
        }
      };

      // 3. Listen for the 'sync' event
      yProvider.on("sync", handleSync);

      // 4. Also check if the provider is already synced upon mount
      if (yProvider.synced) {
        handleSync();
      }

      return () => {
        // 5. Clean up the binding and the event listener
        binding?.destroy();
        yProvider.off("sync", handleSync);
      };
    }
  }, [editorRef, yProvider, language]);

  const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
    setEditorRef(e);
  }, []);

  return (
    <div className="space-y-4">
      <EditorControls
        selectedLanguage={language as string}
        languages={Object.keys(langs)}
        handleSubmit={handleSubmit}
        handleLanguageChange={handleLanguageChange}
        handleRunWithInput={handleRunWithInput}
        userInputs={userInputs as string[]}
      />

      <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
        <style>{`
          /* VS Code-like backgrounds that respect theme */
          .monaco-editor.vs {
            background-color: #ffffff !important;
          }
          .monaco-editor.vs .monaco-editor-background {
            background-color: #ffffff !important;
          }
          .monaco-editor.vs .view-lines {
            background-color: #ffffff !important;
          }
          .monaco-editor.vs .margin {
            background-color: #f3f3f3 !important;
          }
          
          .monaco-editor.vs-dark {
            background-color: #1e1e1e !important;
          }
          .monaco-editor.vs-dark .monaco-editor-background {
            background-color: #1e1e1e !important;
          }
          .monaco-editor.vs-dark .view-lines {
            background-color: #1e1e1e !important;
          }
          .monaco-editor.vs-dark .margin {
            background-color: #252526 !important;
          }
        `}</style>
        <Editor
          onMount={handleOnMount}
          height="50vh"
          width="100%"
          theme={(() => {
            const appearance = localStorage.getItem("appearance") || "system";
            const isDark =
              appearance === "dark" ||
              (appearance === "system" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);
            return isDark ? "vs-dark" : "vs";
          })()}
          defaultLanguage={language as string}
          language={language as string}
          defaultValue={languageTemplates[language as string as keyof typeof languageTemplates]}
          options={{
            tabSize: 2,
            cursorBlinking: "smooth",
            fontSize: 16,
            minimap: { enabled: false },
            overviewRulerLanes: 0,
            padding: { top: 20, bottom: 20 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      <Terminal
        output={output as string}
        isWaitingForInput={isWaitingForInput as boolean}
        userInputs={userInputs as string[]}
        onInput={handleTerminalInput}
        onClear={handleTerminalClear}
      />
    </div>
  );
}

// main component
export default function CollaborativeEditor({ id }: { id: string }) {
  return (
    <LiveblocksProvider
      publicApiKey={"pk_dev_TJvAsyYvtl6GARb5tMeCiBOyOQBoJ0FgPTsoOkxRmjvcPkunTEdNtkIxgd6K3QqA"}
    >
      <RoomProvider id={id}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          <CollaborativeEditorInner />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
