interface EditorControlsProps {
  selectedLanguage: string;
  languages: string[];
  handleSubmit: () => void;
  handleLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleRunWithInput?: () => void;
  userInputs?: string[];
}

export default function EditorControls({
  selectedLanguage,
  languages,
  handleSubmit,
  handleLanguageChange,
  handleRunWithInput,
  userInputs,
}: EditorControlsProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4">
      <div className="flex items-center gap-3">
        <label htmlFor="language" className="text-sm font-medium text-[var(--color-text)]">
          Language:
        </label>
        <select
          name="language"
          id="language"
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          {languages.map((lang: string) => (
            <option key={lang} value={lang} className="text-black">
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        {handleRunWithInput && userInputs && userInputs.length > 0 && (
          <button
            className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
            onClick={handleRunWithInput}
          >
            Reset Inputs
          </button>
        )}

        <button
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Submit Code
        </button>
      </div>
    </div>
  );
}
