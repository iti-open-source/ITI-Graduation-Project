import CustomLayout from '@/layouts/CustomLayout';
import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from '@liveblocks/react/suspense';
import { useState } from 'react';
import { CollaborativeEditor } from '../components/Room/CollaborativeEditor';

function Room() {
    const [editorText, setEditorText] = useState<string>('');
    const [language, setLanguage] = useState<string>('typescript');
    const languages = ['cpp', 'python', 'javascript', 'java', 'csharp', 'ruby', 'go', 'php', 'typescript', 'css', 'html'];

    const handleSubmit = () => {
        console.log(editorText);
    };

    const handleEditorTextChange = (text: string | undefined) => {
        setEditorText(text || '');
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
    };

    return (
        <>
            <CustomLayout>
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
                        value={language}
                        onChange={handleLanguageChange}
                    >
                        {languages.map((lang) => (
                            <option key={lang} value={lang} className="text-black">
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <LiveblocksProvider publicApiKey={'pk_dev_MDlFOJddGa3Jz5Wkux9tzCArD9ytT22YlXTcFPvBTrepZdZ4vlSA1fiTG0myYpf8'}>
                    <RoomProvider id="my-room">
                        <ClientSideSuspense fallback={<div>Loading…</div>}>
                            <CollaborativeEditor editorText={editorText} handleEditorTextChange={handleEditorTextChange} language={language} />
                        </ClientSideSuspense>
                    </RoomProvider>
                </LiveblocksProvider>
            </CustomLayout>
        </>
    );
}

export default Room;
