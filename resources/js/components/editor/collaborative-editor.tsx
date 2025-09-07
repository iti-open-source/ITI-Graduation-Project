'use client';

import { languageTemplates } from '@/utils/language-templates';
import { ClientSideSuspense, LiveblocksProvider, RoomProvider, useRoom } from '@liveblocks/react';
import { getYjsProviderForRoom } from '@liveblocks/yjs';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { Awareness } from 'y-protocols/awareness';
import EditorControls from './editor-controlls';
import OutputPanel from './output-panel';

// inner component, have to use it because RoomProvider needs to be a parent of useRoom
function CollaborativeEditorInner() {
    const room = useRoom();
    const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
    const yProvider = getYjsProviderForRoom(room);
    const [editorText, setEditorText] = useState<string>('');
    const [language, setLanguage] = useState<string>('typescript');
    const [output, setOutput] = useState<string>('');

    const langs = {
        cpp: 54,
        python: 109,
        javascript: 102,
        java: 91,
        csharp: 51,
        typescript: 101,
    };

    const handleSubmit = async () => {
        try {
            // Submit the code
            const response = await axios.post('https://ce.judge0.com/submissions/', {
                source_code: editorText,
                language_id: langs[language as keyof typeof langs],
            });

            const token = response.data.token;

            setOutput('Please wait...');

            // Poll for result until completion
            const result = await pollForResult(token);
            setOutput(result.stdout || result.stderr || 'No output');
        } catch (error) {
            console.error('Submission failed:', error);
        }
    };

    // helper function to poll for results
    const pollForResult = async (token: string, maxAttempts = 30): Promise<{ stdout?: string; stderr?: string }> => {
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
                return { stderr: (error as { message: string }).message };
            }
        }

        throw new Error('Maximum polling attempts reached');
    };

    const handleEditorTextChange = (text: string | undefined) => {
        setEditorText(text || '');
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);

        // Set the boilerplate for the selected language
        const template = languageTemplates[newLanguage as keyof typeof languageTemplates];
        if (template) {
            setEditorText(template);
            // Also update the Monaco editor directly if it exists
            if (editorRef) {
                editorRef.setValue(template);
            }
        }
    };

    // Initialize with default language template
    useEffect(() => {
        const template = languageTemplates[language as keyof typeof languageTemplates];
        if (template && editorText === '') {
            setEditorText(template);
        }
    }, [language]);

    // Set up Liveblocks Yjs provider and attach Monaco editor
    useEffect(() => {
        let binding: MonacoBinding;

        if (editorRef) {
            const yDoc = yProvider.getYDoc();
            const yText = yDoc.getText('monaco');

            // Attach Yjs to Monaco
            binding = new MonacoBinding(
                yText,
                editorRef.getModel() as editor.ITextModel,
                new Set([editorRef]),
                yProvider.awareness as unknown as Awareness,
            );

            // Set initial template if editor is empty
            const template = languageTemplates[language as keyof typeof languageTemplates];
            if (template && editorRef.getValue() === '') {
                editorRef.setValue(template);
            }
        }

        return () => {
            binding?.destroy();
        };
    }, [editorRef, room, yProvider]);

    const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
        setEditorRef(e);
    }, []);

    return (
        <>
            <EditorControls
                selectedLanguage={language}
                languages={Object.keys(langs)}
                handleSubmit={handleSubmit}
                handleLanguageChange={handleLanguageChange}
            />

            <Editor
                onMount={handleOnMount}
                height="100vh"
                width="100%"
                theme={localStorage.getItem('theme') === 'dark' ? 'vs-dark' : 'light'}
                defaultLanguage={language}
                language={language}
                defaultValue={languageTemplates[language as keyof typeof languageTemplates]}
                onChange={handleEditorTextChange}
                value={editorText}
                options={{
                    tabSize: 2,
                    cursorBlinking: 'smooth',
                    fontSize: 16,
                    minimap: { enabled: false },
                    overviewRulerLanes: 0,
                    padding: { top: 20, bottom: 20 },
                }}
            />
            <OutputPanel content={output} />
        </>
    );
}

// main component
export function CollaborativeEditor({ id }: { id: string }) {
    return (
        <LiveblocksProvider publicApiKey={'pk_dev_MDlFOJddGa3Jz5Wkux9tzCArD9ytT22YlXTcFPvBTrepZdZ4vlSA1fiTG0myYpf8'}>
            <RoomProvider id={id}>
                <ClientSideSuspense fallback={<div>Loading…</div>}>
                    <CollaborativeEditorInner />
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
}
