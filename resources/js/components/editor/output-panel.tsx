export default function OutputPanel({ content }: { content?: string }) {
    return (
        <div className="h-1/3 w-full border-t border-[var(--color-border)] bg-[var(--color-output-bg)] text-[var(--color-output-text)]">
            <div className="h-full w-full p-4">
                <h2 className="mb-2 text-lg font-semibold">Output Panel</h2>
                <div className="h-[calc(100%-1.5rem)] overflow-y-auto rounded bg-[var(--color-output-inner-bg)] p-4 text-sm">
                    <p>{content || 'This is where the output of the code execution or any relevant information will be displayed.'}</p>
                </div>
            </div>
        </div>
    );
}
