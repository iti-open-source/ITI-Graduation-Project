interface EditorControlsProps {
    selectedLanguage: string;
    languages: string[];
    handleSubmit: () => void;
    handleLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function EditorControls({ selectedLanguage, languages, handleSubmit, handleLanguageChange }: EditorControlsProps) {
    return (
        <div className="mb-3 flex items-center justify-center gap-3 py-3">
            <button
                className="cursor-pointer rounded-sm border-1 border-gray-500 px-3 py-1 transition-all ease-in-out hover:border-black hover:bg-gray-50 hover:text-black"
                onClick={handleSubmit}
            >
                Submit
            </button>
            <select
                name="language"
                id="language"
                className="rounded-sm border-1 border-gray-500 px-3 py-1"
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
    );
}
