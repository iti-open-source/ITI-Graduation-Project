'use client';

import { ClientSideSuspense, LiveblocksProvider, RoomProvider, useRoom } from '@liveblocks/react';
import { getYjsProviderForRoom } from '@liveblocks/yjs';
import { Editor } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { Awareness } from 'y-protocols/awareness';
import EditorControls from './editor-controlls';

// inner component, have to use it because RoomProvider needs to be a parent of useRoom
function CollaborativeEditorInner() {
    const room = useRoom();
    const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
    const yProvider = getYjsProviderForRoom(room);
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
                languages={languages}
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
                defaultValue=""
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
