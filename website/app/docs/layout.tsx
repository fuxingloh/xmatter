export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="prose dark:prose-invert max-w-none">{children}</div>
    </div>
  );
}
