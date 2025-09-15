import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useMutation,
  useStorage,
} from "@liveblocks/react";
import { useState } from "react";

interface ProblemProps {
  isCreator: boolean;
  roomId: string;
}

interface ProblemData {
  [key: string]: string;
  title: string;
  content: string;
}

// Inner component that uses Liveblocks hooks
function ProblemInner({ isCreator }: { isCreator: boolean }) {
  const [problemSlug, setProblemSlug] = useState("");
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [problemError, setProblemError] = useState("");

  // Use Liveblocks storage for shared problem data
  const problemData = useStorage((root) => root.problemData) as ProblemData | null;

  // Mutation to update shared problem data
  const updateProblemData = useMutation(({ storage }, data: ProblemData | null) => {
    storage.set("problemData", data);
  }, []);

  // Handle loading LeetCode problem
  const handleLoadProblem = async () => {
    if (!problemSlug.trim()) {
      setProblemError("Please enter a problem slug");
      return;
    }

    setIsLoadingProblem(true);
    setProblemError("");

    try {
      const response = await fetch(`/leetcode/${problemSlug.trim()}`);
      console.log("Fetching problem:", problemSlug.trim());
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`Failed to fetch problem: ${response.status}`);
      }

      const data = await response.json();
      console.log("Problem data received:", data);
      updateProblemData({
        title: data.title,
        content: data.content,
      });
      setProblemSlug("");
    } catch (error) {
      setProblemError("Failed to load problem. Please check the slug and try again.");
      console.error("Error loading problem:", error);
    } finally {
      setIsLoadingProblem(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* Creator Controls */}
      {isCreator && (
        <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
          <h3 className="mb-3 text-sm font-medium text-[var(--color-text)]">
            Load LeetCode Problem
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter problem slug (e.g., two-sum)"
              value={problemSlug}
              onChange={(e) => setProblemSlug(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLoadProblem()}
              disabled={isLoadingProblem}
              className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleLoadProblem}
              disabled={isLoadingProblem || !problemSlug.trim()}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingProblem ? "Loading..." : "Load Problem"}
            </button>
          </div>
          {problemError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{problemError}</p>
          )}
        </div>
      )}

      {/* Problem Display Area */}
      <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)]">
        {problemData ? (
          <div className="h-full overflow-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                {problemData.title}
              </h2>
              {isCreator && (
                <button
                  onClick={() => updateProblemData(null)}
                  className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                >
                  Clear
                </button>
              )}
            </div>
            <div
              className="prose prose-sm prose-headings:text-[var(--color-text)] prose-p:text-[var(--color-text)] prose-strong:text-[var(--color-text)] prose-code:text-[var(--color-text)] prose-pre:bg-[var(--color-muted)] prose-pre:text-[var(--color-text)] max-w-none text-[var(--color-text)]"
              dangerouslySetInnerHTML={{ __html: problemData.content }}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-[var(--color-text-secondary)]">
            <div className="text-center">
              <div className="mb-2 text-4xl">📝</div>
              <p className="text-sm">No problem loaded</p>
              {isCreator && (
                <p className="mt-1 text-xs">Use the form above to load a LeetCode problem</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Liveblocks providers
export default function Problem({ isCreator, roomId }: ProblemProps) {
  return (
    <LiveblocksProvider
      publicApiKey={"pk_dev_TJvAsyYvtl6GARb5tMeCiBOyOQBoJ0FgPTsoOkxRmjvcPkunTEdNtkIxgd6K3QqA"}
    >
      <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          <ProblemInner isCreator={isCreator} />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
