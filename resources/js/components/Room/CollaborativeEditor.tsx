'use client';

import { useRoom } from '@liveblocks/react';
import { getYjsProviderForRoom } from '@liveblocks/yjs';
import { Editor } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { Awareness } from 'y-protocols/awareness';

// Collaborative text editor with simple rich text, live cursors, and live avatars
export function CollaborativeEditor({
    editorText,
    handleEditorTextChange,
    language,
}: {
    editorText: string;
    handleEditorTextChange: (text: string | undefined) => void;
    language: string;
}) {
    const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
    const room = useRoom();
    const yProvider = getYjsProviderForRoom(room);

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
    }, [editorRef, room]);

    const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
        setEditorRef(e);
    }, []);

    return (
        <Editor
            onMount={handleOnMount}
            height="500px"
            width="full"
            theme="vs-dark"
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
    );
}
